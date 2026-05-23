const SERVICE_NAME_PATTERN = /^[a-z][a-z0-9-]{1,61}[a-z0-9]$/;

export function validateServiceName(name: string): void {
  if (!SERVICE_NAME_PATTERN.test(name)) {
    throw new Error(
      `Invalid service name "${name}". Must match: ^[a-z][a-z0-9-]{1,61}[a-z0-9]$`,
    );
  }
}

export function resolveTemplateRef(template: string): string {
  if (template.includes(':')) {
    return template;
  }
  return `template:default/${template}`;
}
