import fs from 'fs';
import os from 'os';
import path from 'path';
import YAML from 'yaml';

export type FoundryDefaults = {
  github_org?: string;
  image_registry?: string;
  owner?: string;
};

export type FoundryConfig = {
  backendUrl: string;
  appUrl: string;
  token?: string;
  refreshToken?: string;
  /** ISO-8601 expiry from OIDC token response */
  tokenExpiresAt?: string;
  authProvider?: 'guest' | 'oidc' | 'manual';
  defaults?: FoundryDefaults;
};

const CONFIG_DIR = path.join(os.homedir(), '.config', 'foundry');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.yaml');

const DEFAULT_CONFIG: FoundryConfig = {
  backendUrl: 'http://localhost:7007',
  appUrl: 'http://localhost:3000',
};

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function loadConfig(): FoundryConfig {
  const fromFile = readConfigFile();
  const merged: FoundryConfig = {
    ...DEFAULT_CONFIG,
    ...fromFile,
    defaults: {
      ...DEFAULT_CONFIG.defaults,
      ...fromFile?.defaults,
    },
  };

  if (process.env.FOUNDRY_BACKEND_URL) {
    merged.backendUrl = process.env.FOUNDRY_BACKEND_URL.replace(/\/$/, '');
  }
  if (process.env.FOUNDRY_APP_URL) {
    merged.appUrl = process.env.FOUNDRY_APP_URL.replace(/\/$/, '');
  }
  if (process.env.FOUNDRY_TOKEN) {
    merged.token = process.env.FOUNDRY_TOKEN;
  }

  return merged;
}

function readConfigFile(): Partial<FoundryConfig> | undefined {
  if (!fs.existsSync(CONFIG_PATH)) {
    return undefined;
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return YAML.parse(raw) as Partial<FoundryConfig>;
}

export function saveConfig(config: FoundryConfig): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  const content = YAML.stringify(config);
  fs.writeFileSync(CONFIG_PATH, content, { mode: 0o600 });
}

export function requireToken(config: FoundryConfig): string {
  if (!config.token) {
    throw new Error(
      'Not authenticated. Run `foundry auth login` or set FOUNDRY_TOKEN.',
    );
  }
  return config.token;
}

export function clearCredentials(config: FoundryConfig): void {
  delete config.token;
  delete config.refreshToken;
  delete config.tokenExpiresAt;
  delete config.authProvider;
}

export function setConfigValue(key: string, value: string): void {
  const config = loadConfig();

  if (key === 'backendUrl' || key === 'appUrl' || key === 'token') {
    config[key] = value;
  } else if (
    key === 'defaults.github_org' ||
    key === 'defaults.image_registry' ||
    key === 'defaults.owner'
  ) {
    const subKey = key.split('.')[1] as keyof FoundryDefaults;
    config.defaults = config.defaults ?? {};
    config.defaults[subKey] = value;
  } else {
    throw new Error(
      `Unknown config key: ${key}. Supported: backendUrl, appUrl, token, defaults.github_org, defaults.image_registry, defaults.owner`,
    );
  }

  saveConfig(config);
}

export function getConfigValue(key: string): string | undefined {
  const config = loadConfig();

  if (key === 'backendUrl') {
    return config.backendUrl;
  }
  if (key === 'appUrl') {
    return config.appUrl;
  }
  if (key === 'token') {
    return config.token;
  }
  if (key === 'defaults.github_org') {
    return config.defaults?.github_org;
  }
  if (key === 'defaults.image_registry') {
    return config.defaults?.image_registry;
  }
  if (key === 'defaults.owner') {
    return config.defaults?.owner;
  }

  throw new Error(`Unknown config key: ${key}`);
}
