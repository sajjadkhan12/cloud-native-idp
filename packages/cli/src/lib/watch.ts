import ora from 'ora';
import type { LogEvent } from '@backstage/plugin-scaffolder-common';
import type { FoundryConfig } from '../config/store';
import { createScaffolderClient, authOptions } from '../client/scaffolder';

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled']);

export async function watchTask(
  config: FoundryConfig,
  taskId: string,
  token: string,
): Promise<void> {
  const client = createScaffolderClient(config);
  const options = authOptions(token);
  const spinner = ora('Waiting for task...').start();

  const logSub = client.streamLogs({ taskId }, options).subscribe({
    next: (event: LogEvent) => {
      if (event.type === 'log' && event.body?.message) {
        spinner.stop();
        const step = event.body.stepId ? `[${event.body.stepId}] ` : '';
        console.log(`${step}${event.body.message}`);
        spinner.start('Running...');
      }
    },
  });

  let status = 'open';
  while (!TERMINAL_STATUSES.has(status)) {
    await new Promise(r => setTimeout(r, 2000));
    const task = await client.getTask(taskId, options);
    status = task.status;
    spinner.text = `Status: ${status}`;
  }

  logSub.unsubscribe();
  spinner.stop();

  if (status === 'completed') {
    console.log('\nTask completed successfully.');
    await printCompletionLinks(config, taskId, token);
  } else {
    throw new Error(`Task ended with status: ${status}`);
  }
}

async function printCompletionLinks(
  config: FoundryConfig,
  taskId: string,
  token: string,
): Promise<void> {
  const base = config.backendUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/api/scaffolder/v2/tasks/${taskId}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return;
  }

  const events = (await res.json()) as LogEvent[];
  const completion = [...events].reverse().find(e => e.type === 'completion');
  const output = (completion?.body as {
    output?: { links?: Array<{ title?: string; url?: string; entityRef?: string }> };
  })?.output;

  if (output?.links?.length) {
    console.log('\nOutput links:');
    for (const link of output.links) {
      if (link.url) {
        console.log(`  ${link.title ?? 'Link'}: ${link.url}`);
      } else if (link.entityRef) {
        const name = link.entityRef.split('/').pop();
        console.log(
          `  ${link.title ?? 'Catalog'}: ${config.appUrl}/catalog/default/component/${name}`,
        );
        console.log(`           (${link.entityRef})`);
      }
    }
  }
}
