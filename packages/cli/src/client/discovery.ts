import type { FoundryConfig } from '../config/store';

export function createDiscoveryApi(config: FoundryConfig) {
  return {
    async getBaseUrl(pluginId: string): Promise<string> {
      const base = config.backendUrl.replace(/\/$/, '');
      return `${base}/api/${pluginId}`;
    },
  };
}

/** Minimal SCM integrations stub required by ScaffolderClient constructor. */
export function createScmIntegrationsStub() {
  const empty = { list: () => [] as never[] };
  return {
    azure: empty,
    bitbucketCloud: empty,
    bitbucketServer: empty,
    gerrit: empty,
    gitea: empty,
    github: empty,
    gitlab: empty,
  };
}
