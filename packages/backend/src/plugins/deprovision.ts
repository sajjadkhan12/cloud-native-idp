import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import express, { Router } from 'express';

export const deprovisionPlugin = createBackendPlugin({
  pluginId: 'deprovision',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ config, http, logger }) {
        const router = Router();
        router.use(express.json());
        
        // Allow guest/unauthenticated calls during development
        http.addAuthPolicy({
          path: '/delete',
          allow: 'unauthenticated',
        });

        router.post('/delete', async (req, res) => {
          const { serviceName, githubOrg, environment } = req.body;

          if (!serviceName || !githubOrg || !environment) {
            return res.status(400).json({ error: 'Missing serviceName, githubOrg, or environment' });
          }

          const githubConfigs = config.getOptionalConfigArray('integrations.github');
          const githubToken = githubConfigs?.[0]?.getOptionalString('token') || process.env.GITHUB_TOKEN;
          if (!githubToken) {
            return res.status(500).json({ error: 'GitHub token not configured in Backstage backend' });
          }

          try {
            logger.info(`Starting deprovisioning for ${serviceName} in ${environment}`);

            // 1. Delete GitHub Repository
            logger.info(`Deleting GitHub repository: ${githubOrg}/${serviceName}`);
            const deleteRepoRes = await fetch(`https://api.github.com/repos/${githubOrg}/${serviceName}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            });

            if (deleteRepoRes.status !== 204 && deleteRepoRes.status !== 404) {
              const errText = await deleteRepoRes.text();
              logger.error(`Failed to delete repo: ${errText}`);
              return res.status(deleteRepoRes.status).json({ error: `Failed to delete GitHub repository: ${errText}` });
            }

            // 2. Open PR to delete manifest files in GitOps repository
            const gitopsOwner = 'sajjadkhan-academy';
            const gitopsRepo = 'argocd-centralized-repo-idp';
            const branchName = `delete-${serviceName}-${environment}`;

            logger.info(`Fetching latest commit from main in ${gitopsOwner}/${gitopsRepo}`);
            const mainRefRes = await fetch(`https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/ref/heads/main`, {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github+json',
              },
            });
            
            if (!mainRefRes.ok) {
              const err = await mainRefRes.text();
              throw new Error(`Failed to fetch main ref: ${err}`);
            }
            const mainRefJson = await mainRefRes.json();
            const mainCommitSha = mainRefJson.object.sha;

            // Create branch
            logger.info(`Creating branch ${branchName}`);
            const createBranchRes = await fetch(`https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/refs`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha: mainCommitSha,
              }),
            });
            
            if (!createBranchRes.ok && createBranchRes.status !== 422) { // 422 means branch already exists
              const err = await createBranchRes.text();
              throw new Error(`Failed to create branch ${branchName}: ${err}`);
            }

            // Get recursive tree from main to find files
            logger.info(`Fetching recursive tree from main branch`);
            const treeRes = await fetch(`https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/trees/main?recursive=1`, {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github+json',
              },
            });
            if (!treeRes.ok) {
              const err = await treeRes.text();
              throw new Error(`Failed to fetch main tree: ${err}`);
            }
            const treeJson = await treeRes.json();
            
            // Filter files that we want to delete (case-insensitive)
            const targetPaths = treeJson.tree
              .filter((item: any) => {
                const itemPathLower = item.path.toLowerCase();
                const expectedAppPath = `applications/${serviceName}-${environment}.yaml`.toLowerCase();
                const expectedAppsDirPrefix = `apps/${serviceName}/`.toLowerCase();
                
                return (
                  item.type === 'blob' &&
                  (itemPathLower === expectedAppPath ||
                    itemPathLower.startsWith(expectedAppsDirPrefix))
                );
              })
              .map((item: any) => item.path);

            if (targetPaths.length > 0) {
              logger.info(`Files to delete in PR: ${targetPaths.join(', ')}`);
              
              // Create trees payload with sha: null
              const newTreeItems = targetPaths.map((path: string) => ({
                path,
                mode: '100644',
                type: 'blob',
                sha: null,
              }));

              // Post new tree
              logger.info(`Creating new tree with deleted files`);
              const postTreeRes = await fetch(`https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/trees`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: 'application/vnd.github+json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  base_tree: mainCommitSha,
                  tree: newTreeItems,
                }),
              });
              if (!postTreeRes.ok) {
                const err = await postTreeRes.text();
                throw new Error(`Failed to create tree: ${err}`);
              }
              const postTreeJson = await postTreeRes.json();
              const newTreeSha = postTreeJson.sha;

              // Create Commit
              logger.info(`Creating commit on branch ${branchName}`);
              const postCommitRes = await fetch(`https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/commits`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: 'application/vnd.github+json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: `chore(gitops): delete service ${serviceName} dev manifests`,
                  tree: newTreeSha,
                  parents: [mainCommitSha],
                }),
              });
              if (!postCommitRes.ok) {
                const err = await postCommitRes.text();
                throw new Error(`Failed to create commit: ${err}`);
              }
              const postCommitJson = await postCommitRes.json();
              const newCommitSha = postCommitJson.sha;

              // Update Ref of branch
              logger.info(`Updating branch ${branchName} reference to new commit`);
              const updateRefRes = await fetch(`https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/refs/heads/${branchName}`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: 'application/vnd.github+json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sha: newCommitSha,
                  force: true,
                }),
              });
              if (!updateRefRes.ok) {
                const err = await updateRefRes.text();
                throw new Error(`Failed to update branch reference: ${err}`);
              }

              // Create Pull Request
              logger.info(`Creating Pull Request to merge ${branchName} into main`);
              const prRes = await fetch(`https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/pulls`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: 'application/vnd.github+json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title: `chore(gitops): deprovision service ${serviceName}`,
                  head: branchName,
                  base: 'main',
                  body: `This Pull Request removes the ArgoCD applications and Kustomize manifests for \`${serviceName}\` to completely deprovision the microservice.`,
                }),
              });

              let prUrl = '';
              if (prRes.ok) {
                const prJson = await prRes.json();
                prUrl = prJson.html_url;
                logger.info(`Successfully created PR: ${prUrl}`);
              } else {
                const err = await prRes.text();
                logger.warn(`PR creation returned code ${prRes.status}: ${err}`);
              }

              return res.status(200).json({
                message: `Successfully deleted GitHub repository ${githubOrg}/${serviceName} and created deletion Pull Request.`,
                prUrl,
              });
            }

            logger.info(`No manifest files found to delete for ${serviceName} in GitOps repo.`);
            return res.status(200).json({
              message: `Successfully deleted GitHub repository ${githubOrg}/${serviceName}. No GitOps manifests were found to delete.`,
            });

          } catch (err: any) {
            logger.error(`Error during deprovisioning: ${err.message}`);
            return res.status(500).json({ error: `Internal error during deprovisioning: ${err.message}` });
          }
        });

        http.use(router);
      },
    });
  },
});
