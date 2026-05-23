import type { FoundryConfig } from '../config/store';
import { loadConfig, saveConfig } from '../config/store';
import { assertBackstageToken } from './jwt';
import { refreshAccessToken, type BrowserLoginResult } from './browser-login';
import { verifyTokenWithBackend } from './verify-token';

export function applyLoginResult(
  config: FoundryConfig,
  result: BrowserLoginResult,
  provider: 'guest' | 'oidc',
): void {
  const identity = assertBackstageToken(result.accessToken);
  config.token = result.accessToken;
  config.refreshToken = result.refreshToken;
  config.tokenExpiresAt = result.expiresAt?.toISOString();
  config.authProvider = provider;

  if (identity.entityRef?.startsWith('user:')) {
    config.defaults = config.defaults ?? {};
    config.defaults.owner = identity.entityRef;
  }

  saveConfig(config);
}

export function isTokenExpired(config: FoundryConfig): boolean {
  if (!config.tokenExpiresAt) {
    return false;
  }
  return Date.parse(config.tokenExpiresAt) <= Date.now() + 60_000;
}

/** Return a valid access token, refreshing when possible. */
export async function ensureFreshToken(
  config?: FoundryConfig,
): Promise<{ config: FoundryConfig; token: string }> {
  const cfg = config ?? loadConfig();

  if (!cfg.token) {
    throw new Error('Not authenticated. Run `foundry auth login`.');
  }

  if (!isTokenExpired(cfg)) {
    return { config: cfg, token: cfg.token };
  }

  if (cfg.refreshToken && cfg.authProvider === 'oidc') {
    const result = await refreshAccessToken(cfg);
    applyLoginResult(cfg, result, 'oidc');
    await verifyTokenWithBackend(cfg, cfg.token!);
    return { config: cfg, token: cfg.token! };
  }

  throw new Error(
    'Session expired. Run `foundry auth login` or `foundry auth refresh`.',
  );
}

export async function requireFreshToken(
  config?: FoundryConfig,
): Promise<{ config: FoundryConfig; token: string }> {
  const { config: cfg, token } = await ensureFreshToken(config);
  return { config: cfg, token };
}
