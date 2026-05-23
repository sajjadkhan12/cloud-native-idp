import { CatalogClient } from '@backstage/catalog-client';
import type { FoundryConfig } from '../config/store';
import { createDiscoveryApi } from './discovery';

export function createCatalogClient(config: FoundryConfig): CatalogClient {
  return new CatalogClient({
    discoveryApi: createDiscoveryApi(config),
    fetchApi: { fetch: globalThis.fetch.bind(globalThis) },
  });
}
