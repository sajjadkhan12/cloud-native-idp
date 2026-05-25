import {
  coreServices,
  createBackendPlugin,
  LoggerService,
  BackstageCredentials,
} from '@backstage/backend-plugin-api';
import {
  catalogServiceRef,
  CatalogService,
} from '@backstage/plugin-catalog-node';
import express, { Router } from 'express';

async function removeFromCatalog(
  catalog: CatalogService,
  credentials: BackstageCredentials,
  logger: LoggerService,
  options: {
    entityRef: string;
    entityUid?: string;
    githubOrg: string;
    serviceName: string;
  },
): Promise<void> {
  const { entityRef, entityUid, githubOrg, serviceName } = options;

  let location = await catalog.getLocationByEntity(entityRef, { credentials });

  if (!location?.id) {
    const { items: locations } = await catalog.queryLocations(
      {
        query: {
          type: 'url',
          target: {
            $hasPrefix: `https://github.com/${githubOrg}/${serviceName}/`,
          },
        },
      },
      { credentials },
    );
    location = locations[0];
  }

  if (location?.id) {
    logger.info(`Removing catalog location ${location.id} for ${entityRef}`);
    await catalog.removeLocationById(location.id, { credentials });
  } else {
    logger.warn(`No catalog location found for ${entityRef}`);
  }

  if (entityUid) {
    logger.info(`Removing catalog entity uid ${entityUid}`);
    await catalog.removeEntityByUid(entityUid, { credentials });
  }
}

export const deprovisionPlugin = createBackendPlugin({
  pluginId: 'deprovision',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        catalog: catalogServiceRef,
        auth: coreServices.auth,
      },
      async init({ config, http, logger, catalog, auth }) {
        const router = Router();
        router.use(express.json());

        // Allow guest/unauthenticated calls during development
        http.addAuthPolicy({
          path: '/delete',
          allow: 'unauthenticated',
        });

        router.post('/delete', async (req, res) => {
          const { serviceName, githubOrg, environment, entityRef, entityUid } =
            req.body;

          if (!serviceName || !githubOrg || !environment) {
            return res.status(400).json({
              error: 'Missing serviceName, githubOrg, or environment',
            });
          }

          if (!entityRef) {
            return res.status(400).json({ error: 'Missing entityRef' });
          }

          const githubConfigs = config.getOptionalConfigArray('integrations.github');
          const githubToken =
            githubConfigs?.[0]?.getOptionalString('token') ||
            process.env.GITHUB_TOKEN;
          if (!githubToken) {
            return res.status(500).json({
              error: 'GitHub token not configured in Backstage backend',
            });
          }

          try {
            logger.info(`Starting deprovisioning for ${serviceName} in ${environment}`);

            const credentials = await auth.getOwnServiceCredentials();

            // 1. Remove from Backstage catalog (location + component) before external deletes
            logger.info(`Removing ${entityRef} from Backstage catalog`);
            await removeFromCatalog(catalog, credentials, logger, {
              entityRef,
              entityUid,
              githubOrg,
              serviceName,
            });

            // 2. Delete GitHub Repository
            logger.info(`Deleting GitHub repository: ${githubOrg}/${serviceName}`);
            const deleteRepoRes = await fetch(
              `https://api.github.com/repos/${githubOrg}/${serviceName}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: 'application/vnd.github+json',
                  'X-GitHub-Api-Version': '2022-11-28',
                },
              },
            );

            if (deleteRepoRes.status !== 204 && deleteRepoRes.status !== 404) {
              const errText = await deleteRepoRes.text();
              logger.error(`Failed to delete repo: ${errText}`);
              return res.status(deleteRepoRes.status).json({
                error: `Failed to delete GitHub repository: ${errText}`,
              });
            }

            // 3. Open PR to delete manifest files in GitOps repository
            const gitopsOwner = 'sajjadkhan-academy';
            const gitopsRepo = 'argocd-centralized-repo-idp';
            const branchName = `delete-${serviceName}-${environment}`;

            logger.info(
              `Fetching latest commit from main in ${gitopsOwner}/${gitopsRepo}`,
            );
            const mainRefRes = await fetch(
              `https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/ref/heads/main`,
              {
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: 'application/vnd.github+json',
                },
              },
            );

            if (!mainRefRes.ok) {
              const err = await mainRefRes.text();
              throw new Error(`Failed to fetch main ref: ${err}`);
            }
            const mainRefJson = await mainRefRes.json();
            const mainCommitSha = mainRefJson.object.sha;

            logger.info(`Creating branch ${branchName}`);
            const createBranchRes = await fetch(
              `https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/refs`,
              {
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
              },
            );

            if (!createBranchRes.ok && createBranchRes.status !== 422) {
              const err = await createBranchRes.text();
              throw new Error(`Failed to create branch ${branchName}: ${err}`);
            }

            logger.info(`Fetching recursive tree from main branch`);
            const treeRes = await fetch(
              `https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/trees/main?recursive=1`,
              {
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: 'application/vnd.github+json',
                },
              },
            );
            if (!treeRes.ok) {
              const err = await treeRes.text();
              throw new Error(`Failed to fetch main tree: ${err}`);
            }
            const treeJson = await treeRes.json();

            const targetPaths = treeJson.tree
              .filter((item: any) => {
                const itemPathLower = item.path.toLowerCase();
                const expectedAppPath =
                  `applications/${serviceName}-${environment}.yaml`.toLowerCase();
                const expectedAppsDirPrefix =
                  `apps/${serviceName}/`.toLowerCase();

                return (
                  item.type === 'blob' &&
                  (itemPathLower === expectedAppPath ||
                    itemPathLower.startsWith(expectedAppsDirPrefix))
                );
              })
              .map((item: any) => item.path);

            let prUrl = '';

            if (targetPaths.length > 0) {
              logger.info(`Files to delete in PR: ${targetPaths.join(', ')}`);

              const newTreeItems = targetPaths.map((path: string) => ({
                path,
                mode: '100644',
                type: 'blob',
                sha: null,
              }));

              logger.info(`Creating new tree with deleted files`);
              const postTreeRes = await fetch(
                `https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/trees`,
                {
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
                },
              );
              if (!postTreeRes.ok) {
                const err = await postTreeRes.text();
                throw new Error(`Failed to create tree: ${err}`);
              }
              const postTreeJson = await postTreeRes.json();
              const newTreeSha = postTreeJson.sha;

              logger.info(`Creating commit on branch ${branchName}`);
              const postCommitRes = await fetch(
                `https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/commits`,
                {
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
                },
              );
              if (!postCommitRes.ok) {
                const err = await postCommitRes.text();
                throw new Error(`Failed to create commit: ${err}`);
              }
              const postCommitJson = await postCommitRes.json();
              const newCommitSha = postCommitJson.sha;

              logger.info(`Updating branch ${branchName} reference to new commit`);
              const updateRefRes = await fetch(
                `https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/git/refs/heads/${branchName}`,
                {
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
                },
              );
              if (!updateRefRes.ok) {
                const err = await updateRefRes.text();
                throw new Error(`Failed to update branch reference: ${err}`);
              }

              logger.info(`Creating Pull Request to merge ${branchName} into main`);
              const prRes = await fetch(
                `https://api.github.com/repos/${gitopsOwner}/${gitopsRepo}/pulls`,
                {
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
                },
              );

              if (prRes.ok) {
                const prJson = await prRes.json();
                prUrl = prJson.html_url;
                logger.info(`Successfully created PR: ${prUrl}`);
              } else {
                const err = await prRes.text();
                logger.warn(`PR creation returned code ${prRes.status}: ${err}`);
              }

              return res.status(200).json({
                message: `Successfully removed ${serviceName} from the catalog, deleted GitHub repository ${githubOrg}/${serviceName}, and created deletion Pull Request.`,
                prUrl,
              });
            }

            logger.info(
              `No manifest files found to delete for ${serviceName} in GitOps repo.`,
            );
            return res.status(200).json({
              message: `Successfully removed ${serviceName} from the catalog and deleted GitHub repository ${githubOrg}/${serviceName}. No GitOps manifests were found to delete.`,
            });
          } catch (err: any) {
            logger.error(`Error during deprovisioning: ${err.message}`);
            return res.status(500).json({
              error: `Internal error during deprovisioning: ${err.message}`,
            });
          }
        });

        http.use(router);
      },
    });
  },
});
