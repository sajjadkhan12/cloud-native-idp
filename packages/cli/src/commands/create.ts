import { Command } from 'commander';
import { loadConfig } from '../config/store';
import { requireFreshToken } from '../lib/session';
import {
  applyCreateServiceOptions,
  buildPythonFastapiValues,
  type CreateServiceOptions,
} from '../lib/service-options';
import { isPythonFastapiTemplate, scaffoldService } from '../lib/scaffold';

const PYTHON_FASTAPI_TEMPLATE = 'python-fastapi';

function registerServiceCommand(create: Command, name: string, description: string): void {
  const cmd = create.command(name).description(description);
  if (name === 'service') {
    cmd.option('-t, --template <name>', 'Template name or entity ref', PYTHON_FASTAPI_TEMPLATE);
  }
  applyCreateServiceOptions(cmd);
  cmd.action(async (opts: CreateServiceOptions & { template?: string }) => {
    const { config, token } = await requireFreshToken();
    const templateName = name === 'service' ? (opts.template ?? PYTHON_FASTAPI_TEMPLATE) : PYTHON_FASTAPI_TEMPLATE;

    if (!isPythonFastapiTemplate(templateName)) {
      throw new Error(
        `Template "${templateName}" is not supported yet. Use --template python-fastapi.`,
      );
    }

    const values = buildPythonFastapiValues(config, opts);
    await scaffoldService(config, token, templateName, values, opts.watch);
  });
}

export function registerCreateCommands(program: Command): void {
  const create = program.command('create').description('Create platform resources');

  registerServiceCommand(create, 'service', 'Scaffold a new service from a template');
  registerServiceCommand(
    create,
    'python-fastapi',
    'Scaffold a Python FastAPI microservice (alias)',
  );
}
