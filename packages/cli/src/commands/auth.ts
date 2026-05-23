import { Command } from 'commander';
import {
  getConfigPath,
  loadConfig,
  saveConfig,
  clearCredentials,
} from '../config/store';
import { assertBackstageToken, parseTokenIdentity } from '../lib/jwt';
import { fetchGuestToken } from '../lib/dev-auth';
import { getIdentityFromConfig } from '../lib/identity';
import { GITHUB_LOGIN_STEPS } from '../lib/auth-help';
import { verifyTokenWithBackend } from '../lib/verify-token';
import { loginWithBrowser, refreshAccessToken } from '../lib/browser-login';
import { applyLoginResult, ensureFreshToken } from '../lib/session';

export function registerAuthCommands(program: Command): void {
  const auth = program.command('auth').description('Authentication commands');

  auth
    .command('login')
    .description(
      'Sign in via browser (default), or use --guest / --token for dev',
    )
    .option(
      '--token <jwt>',
      'Manual JWT from DevTools (advanced; prefer browser login)',
    )
    .option('--guest', 'Guest dev login (no browser)')
    .action(async (opts: { token?: string; guest?: boolean }) => {
      if (opts.token && opts.guest) {
        throw new Error('Use either --token or --guest, not both.');
      }

      const config = loadConfig();

      if (opts.token?.trim()) {
        const token = opts.token.trim();
        const identity = assertBackstageToken(token);
        const probe = { ...config, token };
        await verifyTokenWithBackend(probe, token);
        config.token = token;
        config.authProvider = 'manual';
        delete config.refreshToken;
        delete config.tokenExpiresAt;

        if (identity.entityRef?.startsWith('user:')) {
          config.defaults = config.defaults ?? {};
          config.defaults.owner = identity.entityRef;
        }
      } else if (opts.guest) {
        const token = await fetchGuestToken(config);
        await verifyTokenWithBackend(config, token);
        applyLoginResult(config, { accessToken: token }, 'guest');
        delete config.refreshToken;
        delete config.tokenExpiresAt;
      } else {
        const result = await loginWithBrowser(config);
        await verifyTokenWithBackend(
          { ...config, token: result.accessToken },
          result.accessToken,
        );
        applyLoginResult(config, result, 'oidc');
      }

      const identity = parseTokenIdentity(config.token!);

      saveConfig(config);

      console.log(`Credentials saved to ${getConfigPath()}`);
      if (identity.entityRef) {
        console.log(`Identity: ${identity.entityRef}`);
      }
      if (config.tokenExpiresAt) {
        console.log(`Expires:  ${config.tokenExpiresAt}`);
      }
      if (config.refreshToken) {
        console.log('Refresh:  stored (use `foundry auth refresh` when expired)');
      }

      if (opts.guest || (!opts.token && config.authProvider === 'guest')) {
        console.log(
          'Guest dev login. Scaffolds without --owner use user:development/guest.',
        );
      } else if (config.defaults?.owner) {
        console.log(`defaults.owner: ${config.defaults.owner}`);
        console.log('Scaffolds without --owner use this identity (Catalog → Owned).');
      }
    });

  auth
    .command('refresh')
    .description('Refresh browser login session (like gcloud auth login --update-adc)')
    .action(async () => {
      const config = loadConfig();
      if (!config.refreshToken) {
        throw new Error('No refresh token. Run `foundry auth login` in the browser first.');
      }
      const result = await refreshAccessToken(config);
      applyLoginResult(config, result, 'oidc');
      await verifyTokenWithBackend(config, config.token!);
      console.log('Session refreshed.');
      if (config.tokenExpiresAt) {
        console.log(`Expires: ${config.tokenExpiresAt}`);
      }
    });

  auth
    .command('github')
    .description('Manual GitHub token from DevTools (prefer `auth login`)')
    .action(() => {
      console.log(GITHUB_LOGIN_STEPS);
      console.log('');
      console.log('Prefer: yarn foundry auth login  (opens browser, stores refresh token)');
    });

  auth
    .command('whoami')
    .description('Show the current authenticated identity')
    .action(async () => {
      const { config, token } = await ensureFreshToken();
      const identity = getIdentityFromConfig(config);

      if (identity.subject) {
        console.log(`Subject:  ${identity.subject}`);
      }
      if (identity.entityRef) {
        console.log(`Entity:   ${identity.entityRef}`);
      }
      if (config.authProvider) {
        console.log(`Method:   ${config.authProvider}`);
      }
      if (identity.entityRef?.includes('guest')) {
        console.log('');
        console.log('CLI is using GUEST. Use `foundry auth login` for GitHub in the browser.');
      }
      try {
        const parsed = assertBackstageToken(token);
        if (parsed.issuer) {
          console.log(`Issuer:   ${parsed.issuer}`);
        }
        if (parsed.expiresAt) {
          console.log(`JWT exp:  ${parsed.expiresAt.toISOString()}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(
          `Stored token is invalid: ${message}\nRun: yarn foundry auth login`,
        );
      }

      if (config.tokenExpiresAt) {
        console.log(`Session:  ${config.tokenExpiresAt}`);
      }

      await verifyTokenWithBackend(config, token);
      console.log(`Backend:  connected (${config.backendUrl})`);
    });

  auth
    .command('logout')
    .description('Remove stored credentials')
    .action(() => {
      const config = loadConfig();
      clearCredentials(config);
      saveConfig(config);
      console.log('Logged out.');
    });
}
