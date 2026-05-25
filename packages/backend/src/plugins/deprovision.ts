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

const TERRAFORM_REPO_OWNER = 'sajjadkhan-academy';
const TERRAFORM_REPO = 'backstage-terraform';
const GITOPS_REPO_OWNER = 'sajjadkhan-academy';
const GITOPS_REPO = 'argocd-centralized-repo-idp';

type GitHubHeaders = Record<string, string>;

function githubHeaders(token: string): GitHubHeaders {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function removeFromCatalog(
  catalog: CatalogService,
  credentials: BackstageCredentials,
  logger: LoggerService,
  options: {
    entityRef: string;
    entityUid?: string;
    locationPrefix?: string;
  },
): Promise<void> {
  const { entityRef, entityUid, locationPrefix } = options;

  let location = await catalog.getLocationByEntity(entityRef, { credentials });

  if (!location?.id && locationPrefix) {
    const { items: locations } = await catalog.queryLocations(
      {
        query: {
          type: 'url',
          target: { $hasPrefix: locationPrefix },
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

async function getMainCommitSha(
  owner: string,
  repo: string,
  token: string,
): Promise<string> {
  const mainRefRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`,
    { headers: githubHeaders(token) },
  );

  if (!mainRefRes.ok) {
    throw new Error(`Failed to fetch main ref: ${await mainRefRes.text()}`);
  }

  const mainRefJson = await mainRefRes.json();
  return mainRefJson.object.sha;
}

async function ensureBranch(
  owner: string,
  repo: string,
  branchName: string,
  mainCommitSha: string,
  token: string,
  logger: LoggerService,
): Promise<void> {
  const createBranchRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    {
      method: 'POST',
      headers: {
        ...githubHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: mainCommitSha,
      }),
    },
  );

  if (!createBranchRes.ok && createBranchRes.status !== 422) {
    throw new Error(
      `Failed to create branch ${branchName}: ${await createBranchRes.text()}`,
    );
  }

  logger.info(`Branch ${branchName} ready`);
}

async function createDeletionPullRequest(
  owner: string,
  repo: string,
  branchName: string,
  pathsToDelete: string[],
  commitMessage: string,
  prTitle: string,
  prBody: string,
  token: string,
  logger: LoggerService,
): Promise<string> {
  if (pathsToDelete.length === 0) {
    return '';
  }

  const mainCommitSha = await getMainCommitSha(owner, repo, token);
  await ensureBranch(owner, repo, branchName, mainCommitSha, token, logger);

  logger.info(`Files to delete in PR: ${pathsToDelete.join(', ')}`);

  const newTreeItems = pathsToDelete.map(path => ({
    path,
    mode: '100644',
    type: 'blob',
    sha: null,
  }));

  const postTreeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    {
      method: 'POST',
      headers: {
        ...githubHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_tree: mainCommitSha,
        tree: newTreeItems,
      }),
    },
  );

  if (!postTreeRes.ok) {
    throw new Error(`Failed to create tree: ${await postTreeRes.text()}`);
  }

  const { sha: newTreeSha } = await postTreeRes.json();

  const postCommitRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    {
      method: 'POST',
      headers: {
        ...githubHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        tree: newTreeSha,
        parents: [mainCommitSha],
      }),
    },
  );

  if (!postCommitRes.ok) {
    throw new Error(`Failed to create commit: ${await postCommitRes.text()}`);
  }

  const { sha: newCommitSha } = await postCommitRes.json();

  const updateRefRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`,
    {
      method: 'PATCH',
      headers: {
        ...githubHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sha: newCommitSha,
        force: true,
      }),
    },
  );

  if (!updateRefRes.ok) {
    throw new Error(
      `Failed to update branch reference: ${await updateRefRes.text()}`,
    );
  }

  const prRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers: {
        ...githubHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: prTitle,
        head: branchName,
        base: 'main',
        body: prBody,
      }),
    },
  );

  if (!prRes.ok) {
    logger.warn(`PR creation returned code ${prRes.status}: ${await prRes.text()}`);
    return '';
  }

  const prJson = await prRes.json();
  logger.info(`Successfully created PR: ${prJson.html_url}`);
  return prJson.html_url;
}

async function deprovisionService(
  options: {
    serviceName: string;
    githubOrg: string;
    environment: string;
    entityRef: string;
    entityUid?: string;
    githubToken: string;
    catalog: CatalogService;
    credentials: BackstageCredentials;
    logger: LoggerService;
  },
): Promise<{ message: string; prUrl?: string }> {
  const {
    serviceName,
    githubOrg,
    environment,
    entityRef,
    entityUid,
    githubToken,
    catalog,
    credentials,
    logger,
  } = options;

  logger.info(`Removing ${entityRef} from Backstage catalog`);
  await removeFromCatalog(catalog, credentials, logger, {
    entityRef,
    entityUid,
    locationPrefix: `https://github.com/${githubOrg}/${serviceName}/`,
  });

  logger.info(`Deleting GitHub repository: ${githubOrg}/${serviceName}`);
  const deleteRepoRes = await fetch(
    `https://api.github.com/repos/${githubOrg}/${serviceName}`,
    {
      method: 'DELETE',
      headers: githubHeaders(githubToken),
    },
  );

  if (deleteRepoRes.status !== 204 && deleteRepoRes.status !== 404) {
    throw new Error(
      `Failed to delete GitHub repository: ${await deleteRepoRes.text()}`,
    );
  }

  const branchName = `delete-${serviceName}-${environment}`;
  const treeRes = await fetch(
    `https://api.github.com/repos/${GITOPS_REPO_OWNER}/${GITOPS_REPO}/git/trees/main?recursive=1`,
    { headers: githubHeaders(githubToken) },
  );

  if (!treeRes.ok) {
    throw new Error(`Failed to fetch main tree: ${await treeRes.text()}`);
  }

  const treeJson = await treeRes.json();
  const targetPaths = treeJson.tree
    .filter((item: { path: string; type: string }) => {
      const itemPathLower = item.path.toLowerCase();
      const expectedAppPath =
        `applications/${serviceName}-${environment}.yaml`.toLowerCase();
      const expectedAppsDirPrefix = `apps/${serviceName}/`.toLowerCase();

      return (
        item.type === 'blob' &&
        (itemPathLower === expectedAppPath ||
          itemPathLower.startsWith(expectedAppsDirPrefix))
      );
    })
    .map((item: { path: string }) => item.path);

  const prUrl = await createDeletionPullRequest(
    GITOPS_REPO_OWNER,
    GITOPS_REPO,
    branchName,
    targetPaths,
    `chore(gitops): delete service ${serviceName} dev manifests`,
    `chore(gitops): deprovision service ${serviceName}`,
    `This Pull Request removes the ArgoCD applications and Kustomize manifests for \`${serviceName}\` to completely deprovision the microservice.`,
    githubToken,
    logger,
  );

  if (prUrl) {
    return {
      message: `Successfully removed ${serviceName} from the catalog, deleted GitHub repository ${githubOrg}/${serviceName}, and created deletion Pull Request.`,
      prUrl,
    };
  }

  if (targetPaths.length === 0) {
    return {
      message: `Successfully removed ${serviceName} from the catalog and deleted GitHub repository ${githubOrg}/${serviceName}. No GitOps manifests were found to delete.`,
    };
  }

  return {
    message: `Successfully removed ${serviceName} from the catalog and deleted GitHub repository ${githubOrg}/${serviceName}.`,
  };
}

async function deprovisionS3Bucket(
  options: {
    bucketName: string;
    entityRef: string;
    entityUid?: string;
    githubToken: string;
    catalog: CatalogService;
    credentials: BackstageCredentials;
    logger: LoggerService;
  },
): Promise<{ message: string; prUrl?: string }> {
  const {
    bucketName,
    entityRef,
    entityUid,
    githubToken,
    catalog,
    credentials,
    logger,
  } = options;

  logger.info(`Removing S3 bucket entity ${entityRef} from Backstage catalog`);
  await removeFromCatalog(catalog, credentials, logger, {
    entityRef,
    entityUid,
    locationPrefix: `https://github.com/${TERRAFORM_REPO_OWNER}/${TERRAFORM_REPO}/blob/main/catalog-info-${bucketName}.yaml`,
  });

  const pathsToDelete = [
    `stacks/${bucketName}/main.tf`,
    `stacks/${bucketName}/versions.tf`,
    `stacks/${bucketName}/variables.tf`,
    `catalog-info-${bucketName}.yaml`,
  ];

  const branchName = `decommission/s3-${bucketName}`;
  const prUrl = await createDeletionPullRequest(
    TERRAFORM_REPO_OWNER,
    TERRAFORM_REPO,
    branchName,
    pathsToDelete,
    `decommission: remove s3 bucket ${bucketName}`,
    `decommission: remove s3 bucket ${bucketName}`,
    [
      `## S3 Bucket Decommission`,
      '',
      `Removes Terraform configuration for bucket \`${bucketName}\`.`,
      '',
      '**Before merging:** ensure the bucket is empty in the AWS console.',
    ].join('\n'),
    githubToken,
    logger,
  );

  return {
    message: prUrl
      ? `Successfully removed ${bucketName} from the catalog and created a decommission Pull Request in ${TERRAFORM_REPO_OWNER}/${TERRAFORM_REPO}. Empty the bucket in AWS before merging the PR.`
      : `Successfully removed ${bucketName} from the catalog. Terraform files were not found in ${TERRAFORM_REPO_OWNER}/${TERRAFORM_REPO}.`,
    prUrl: prUrl || undefined,
  };
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

        http.addAuthPolicy({
          path: '/delete',
          allow: 'unauthenticated',
        });

        router.post('/delete', async (req, res) => {
          const {
            resourceType = 'service',
            serviceName,
            githubOrg,
            environment,
            bucketName,
            teamId,
            entityRef,
            entityUid,
          } = req.body;

          if (!entityRef) {
            return res.status(400).json({ error: 'Missing entityRef' });
          }

          const githubConfigs =
            config.getOptionalConfigArray('integrations.github');
          const githubToken =
            githubConfigs?.[0]?.getOptionalString('token') ||
            process.env.GITHUB_TOKEN;

          if (!githubToken) {
            return res.status(500).json({
              error: 'GitHub token not configured in Backstage backend',
            });
          }

          try {
            const credentials = await auth.getOwnServiceCredentials();

            if (resourceType === 's3-bucket') {
              if (!bucketName) {
                return res.status(400).json({
                  error: 'Missing bucketName for S3 bucket deprovision',
                });
              }

              logger.info(
                `Starting S3 bucket deprovisioning for ${bucketName}`,
              );

              const result = await deprovisionS3Bucket({
                bucketName,
                entityRef,
                entityUid,
                githubToken,
                catalog,
                credentials,
                logger,
              });

              return res.status(200).json(result);
            }

            if (!serviceName || !githubOrg || !environment) {
              return res.status(400).json({
                error: 'Missing serviceName, githubOrg, or environment',
              });
            }

            logger.info(
              `Starting service deprovisioning for ${serviceName} in ${environment}`,
            );

            const result = await deprovisionService({
              serviceName,
              githubOrg,
              environment,
              entityRef,
              entityUid,
              githubToken,
              catalog,
              credentials,
              logger,
            });

            return res.status(200).json(result);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error(`Error during deprovisioning: ${message}`);
            return res.status(500).json({
              error: `Internal error during deprovisioning: ${message}`,
            });
          }
        });

        http.use(router);
      },
    });
  },
});
