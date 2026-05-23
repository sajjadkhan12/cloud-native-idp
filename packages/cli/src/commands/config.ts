import { Command } from 'commander';
import {
  getConfigPath,
  getConfigValue,
  loadConfig,
  setConfigValue,
} from '../config/store';

export function registerConfigCommands(program: Command): void {
  const config = program.command('config').description('Manage CLI configuration');

  config.command('path').description('Print the config file path').action(() => {
    console.log(getConfigPath());
  });

  config
    .command('show')
    .description('Show current configuration (token redacted)')
    .action(() => {
      const cfg = loadConfig();
      console.log(
        JSON.stringify({ ...cfg, token: cfg.token ? '***' : undefined }, null, 2),
      );
    });

  config
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action((key: string, value: string) => {
      setConfigValue(key, value);
      console.log(`Set ${key}`);
    });

  config
    .command('get <key>')
    .description('Get a configuration value')
    .action((key: string) => {
      const value = getConfigValue(key);
      console.log(value === undefined ? '(not set)' : value);
    });
}
