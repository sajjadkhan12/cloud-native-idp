#!/usr/bin/env node
import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth';
import { registerConfigCommands } from './commands/config';
import { registerCreateCommands } from './commands/create';
import { registerTemplatesCommands } from './commands/templates';
import { registerTasksCommands } from './commands/tasks';

const program = new Command();

program
  .name('foundry')
  .description('Foundry IDP CLI — scaffold services and interact with the platform')
  .version('0.2.0');

registerAuthCommands(program);
registerConfigCommands(program);
registerTemplatesCommands(program);
registerCreateCommands(program);
registerTasksCommands(program);

program
  .parseAsync(process.argv)
  .then(() => {
    // OAuth callback server must not keep the shell hanging after success.
    process.exit(0);
  })
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  });
