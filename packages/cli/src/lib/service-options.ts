import { Command } from 'commander';
import type { FoundryConfig } from '../config/store';
import { resolveOwner } from './identity';

export type CreateServiceOptions = {
  name?: string;
  org?: string;
  registry?: string;
  owner?: string;
  env: string;
  port: string;
  description: string;
  branch: string;
  watch: boolean;
};

export type PythonFastapiValues = {
  service_name: string;
  github_org: string;
  image_registry: string;
  owner: string;
  environment: string;
  service_port: number;
  description: string;
  git_branch: string;
};

export function buildPythonFastapiValues(
  config: FoundryConfig,
  opts: CreateServiceOptions,
): PythonFastapiValues {
  if (!opts.name) {
    throw new Error('--name is required');
  }

  return {
    service_name: opts.name,
    github_org: opts.org ?? config.defaults?.github_org ?? 'sajjadkhan-academy',
    image_registry:
      opts.registry ?? config.defaults?.image_registry ?? 'ghcr.io/sajjadkhan-academy',
    owner: resolveOwner(config, opts.owner),
    environment: opts.env,
    service_port: Number(opts.port),
    description: opts.description,
    git_branch: opts.branch,
  };
}

export function applyCreateServiceOptions(cmd: Command): void {
  cmd
    .requiredOption('-n, --name <name>', 'Service name (DNS-safe)')
    .option('--org <org>', 'GitHub organization')
    .option('--registry <registry>', 'Container image registry prefix')
    .option(
      '--owner <ref>',
      'Backstage owner (defaults to your signed-in identity)',
    )
    .option('--env <env>', 'Deployment environment', 'dev')
    .option('--port <port>', 'Service port', '8080')
    .option('-d, --description <text>', 'Service description', 'FastAPI microservice')
    .option('--branch <branch>', 'Default git branch', 'main')
    .option('--watch', 'Watch task until completion');
}
