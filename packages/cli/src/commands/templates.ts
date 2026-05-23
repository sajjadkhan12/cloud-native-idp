import { Command } from 'commander';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { loadConfig } from '../config/store';
import { requireFreshToken } from '../lib/session';
import { createCatalogClient } from '../client/catalog';
import { authOptions } from '../client/scaffolder';

async function listTemplates(): Promise<void> {
  const { config, token } = await requireFreshToken();
  const client = createCatalogClient(config);

  const { items } = await client.getEntities(
    { filter: { kind: 'Template' } },
    authOptions(token),
  );

  if (items.length === 0) {
    console.log('No templates found.');
    console.log(
      'Ensure the IDP is running and templates are registered in app-config.yaml.',
    );
    return;
  }

  for (const entity of items) {
    const ref = stringifyEntityRef(entity);
    const title = entity.metadata.title ?? entity.metadata.name;
    const desc = entity.metadata.description ?? '';
    console.log(ref);
    console.log(`  ${title}`);
    if (desc) {
      console.log(`  ${desc}`);
    }
    console.log();
  }
}

export function registerTemplatesCommands(program: Command): void {
  const templates = program
    .command('templates')
    .description('Software template commands');

  templates.command('list').description('List available scaffolder templates').action(listTemplates);
}
