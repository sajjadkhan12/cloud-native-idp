import type { JsonValue } from '@backstage/types';
import type { FoundryConfig } from '../config/store';
import { createScaffolderClient, authOptions } from '../client/scaffolder';
import { printTaskUrl } from './output';
import { watchTask } from './watch';
import { resolveTemplateRef, validateServiceName } from './validate';

const PYTHON_FASTAPI = 'python-fastapi';

export async function scaffoldService(
  config: FoundryConfig,
  token: string,
  template: string,
  values: Record<string, JsonValue>,
  watch: boolean,
): Promise<void> {
  const templateRef = resolveTemplateRef(template);
  validateServiceName(String(values.service_name));

  const client = createScaffolderClient(config);
  const options = authOptions(token);

  await client.getTemplateParameterSchema(templateRef, options);

  console.log(`Template: ${templateRef}`);
  console.log(`Owner:    ${values.owner}`);
  console.log(`Values:   ${JSON.stringify(values, null, 2)}`);

  const { taskId } = await client.scaffold({ templateRef, values }, options);

  console.log('\nScaffold task started.');
  printTaskUrl(config, taskId);

  if (watch) {
    console.log('');
    await watchTask(config, taskId, token);
  } else {
    console.log(`\nRun \`yarn foundry tasks watch ${taskId}\` to follow progress.`);
  }
}

export function isPythonFastapiTemplate(template: string): boolean {
  const ref = resolveTemplateRef(template);
  return ref.includes(PYTHON_FASTAPI) || template === PYTHON_FASTAPI;
}
