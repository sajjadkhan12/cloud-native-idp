import type { FoundryConfig } from '../config/store';

export function printTaskUrl(config: FoundryConfig, taskId: string): void {
  console.log(`Task ID:  ${taskId}`);
  console.log(`Task URL: ${config.appUrl}/create/tasks/${taskId}`);
}

export function printCatalogEntityUrl(
  config: FoundryConfig,
  entityRef: string,
): void {
  const encoded = encodeURIComponent(entityRef);
  console.log(`Catalog:  ${config.appUrl}/catalog/default/component/${encoded.split('%2F').pop() ?? entityRef}`);
  console.log(`Entity:   ${entityRef}`);
}

export function printLinks(links: Array<{ title?: string; url?: string; entityRef?: string }>): void {
  for (const link of links) {
    if (link.url) {
      console.log(`  ${link.title ?? 'Link'}: ${link.url}`);
    } else if (link.entityRef) {
      console.log(`  ${link.title ?? 'Entity'}: ${link.entityRef}`);
    }
  }
}
