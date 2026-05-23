import { Command } from 'commander';
import ora from 'ora';
import type { LogEvent } from '@backstage/plugin-scaffolder-common';
import { loadConfig } from '../config/store';
import { requireFreshToken } from '../lib/session';
import { createScaffolderClient, authOptions } from '../client/scaffolder';
import { printTaskUrl } from '../lib/output';

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled']);

export function registerTasksCommands(program: Command): void {
  const tasks = program.command('tasks').description('Scaffolder task commands');

  tasks
    .command('get <taskId>')
    .description('Get task status')
    .action(async (taskId: string) => {
      const { config, token } = await requireFreshToken();
      const client = createScaffolderClient(config);
      const task = await client.getTask(taskId, authOptions(token));
      console.log(JSON.stringify(task, null, 2));
    });

  tasks
    .command('watch <taskId>')
    .description('Watch a task until it completes')
    .option('--no-logs', 'Do not stream step logs')
    .action(async (taskId: string, opts: { logs?: boolean }) => {
      const { config, token } = await requireFreshToken();
      const client = createScaffolderClient(config);
      const options = authOptions(token);

      printTaskUrl(config, taskId);
      const spinner = ora('Waiting for task...').start();

      const logPromise =
        opts.logs !== false
          ? streamLogs(client, taskId, options, msg => {
              spinner.stop();
              console.log(msg);
              spinner.start('Running...');
            })
          : Promise.resolve();

      let status = 'open';
      while (!TERMINAL_STATUSES.has(status)) {
        await new Promise(r => setTimeout(r, 2000));
        const task = await client.getTask(taskId, options);
        status = task.status;
        spinner.text = `Status: ${status}`;
      }

      await logPromise;
      spinner.stop();

      if (status === 'completed') {
        console.log('\nTask completed successfully.');
        await printTaskOutput(config, taskId, token);
      } else {
        console.error(`\nTask ended with status: ${status}`);
        process.exitCode = 1;
      }
    });
}

async function streamLogs(
  client: ReturnType<typeof createScaffolderClient>,
  taskId: string,
  options: { token?: string },
  onLog: (message: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const sub = client.streamLogs({ taskId }, options).subscribe({
      next: (event: LogEvent) => {
        if (event.type === 'log' && event.body?.message) {
          const step = event.body.stepId ? `[${event.body.stepId}] ` : '';
          onLog(`${step}${event.body.message}`);
        }
        if (event.type === 'completion') {
          sub.unsubscribe();
          resolve();
        }
      },
      error: reject,
      complete: resolve,
    });
  });
}

async function printTaskOutput(
  config: { backendUrl: string; appUrl: string },
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
  const output = (
    completion?.body as {
      output?: {
        links?: Array<{ title?: string; url?: string; entityRef?: string }>;
      };
    }
  )?.output;

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
