import { ScaffolderClient } from '@backstage/plugin-scaffolder-common';
import type { ScaffolderRequestOptions } from '@backstage/plugin-scaffolder-common';
import type { ScmIntegrationRegistry } from '@backstage/integration';
import type { FoundryConfig } from '../config/store';
import { createDiscoveryApi, createScmIntegrationsStub } from './discovery';

export function createScaffolderClient(config: FoundryConfig): ScaffolderClient {
  return new ScaffolderClient({
    discoveryApi: createDiscoveryApi(config),
    fetchApi: { fetch: globalThis.fetch.bind(globalThis) },
    scmIntegrationsApi: createScmIntegrationsStub() as unknown as ScmIntegrationRegistry,
    useLongPollingLogs: true,
  });
}

export function authOptions(token: string): ScaffolderRequestOptions {
  return { token };
}
