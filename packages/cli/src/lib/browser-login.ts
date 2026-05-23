import { exec } from 'child_process';
import { promisify } from 'util';
import type { FoundryConfig } from '../config/store';
import { createPkcePair, randomState } from './pkce';
import { CLI_REDIRECT_URI, waitForOAuthCallback } from './callback-server';

const execAsync = promisify(exec);

type CimdMetadata = {
  client_id: string;
  redirect_uris?: string[];
  scope?: string;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

export type BrowserLoginResult = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
};

/** Direct backend API (token exchange, metadata). */
function authApiBase(config: FoundryConfig): string {
  return `${config.backendUrl.replace(/\/$/, '')}/api/auth`;
}

/** OIDC /v1/* routes are registered only at backend startup — not hot-reloaded. */
export async function assertBrowserLoginReady(config: FoundryConfig): Promise<void> {
  const res = await fetch(`${authApiBase(config)}/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: 'probe' }),
  });

  const body = await res.text();
  if (res.status === 404 && body.includes("Unknown auth provider 'v1'")) {
    throw new Error(
      [
        'CLI OAuth is not active on the auth backend yet.',
        'Restart Foundry IDP after enabling in app-config.yaml:',
        '  auth.experimentalClientIdMetadataDocuments.enabled: true',
        '  auth.experimentalRefreshToken.enabled: true',
        'Then run: yarn start',
      ].join('\n'),
    );
  }
}

export async function fetchCimdMetadata(
  config: FoundryConfig,
): Promise<CimdMetadata> {
  const url = `${authApiBase(config)}/.well-known/oauth-client/cli.json`;
  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error(
      [
        'CLI browser login is not enabled on the backend.',
        'Set auth.experimentalClientIdMetadataDocuments.enabled: true in app-config.yaml and restart `yarn start`.',
      ].join('\n'),
    );
  }

  if (!res.ok) {
    throw new Error(`Failed to load CLI OAuth metadata (${res.status})`);
  }

  return (await res.json()) as CimdMetadata;
}

async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  try {
    if (platform === 'darwin') {
      await execAsync(`open ${JSON.stringify(url)}`);
    } else if (platform === 'linux') {
      await execAsync(`xdg-open ${JSON.stringify(url)}`);
    } else if (platform === 'win32') {
      await execAsync(`start ${JSON.stringify(url)}`);
    } else {
      console.log(`Open this URL in your browser:\n${url}`);
    }
  } catch {
    console.log(`Open this URL in your browser:\n${url}`);
  }
}

export async function loginWithBrowser(
  config: FoundryConfig,
): Promise<BrowserLoginResult> {
  await assertBrowserLoginReady(config);
  const cimd = await fetchCimdMetadata(config);
  const clientId = cimd.client_id;
  const redirectUri = cimd.redirect_uris?.[0] ?? CLI_REDIRECT_URI;
  const scope = cimd.scope ?? 'openid offline_access';
  const { verifier, challenge } = createPkcePair();
  const state = randomState();

  // Start on the backend; it redirects to {appUrl}/oauth2/authorize/{sessionId}
  const authorizeUrl = new URL(`${authApiBase(config)}/v1/authorize`);
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('code_challenge', challenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');
  authorizeUrl.searchParams.set('state', state);

  console.log('Opening browser for Foundry sign-in...');
  console.log(`If the browser does not open, visit:\n${authorizeUrl.toString()}\n`);
  console.log(
    'Sign in with GitHub (if prompted), then approve access for the Foundry CLI.',
  );

  const callbackPromise = waitForOAuthCallback(state);
  await openBrowser(authorizeUrl.toString());
  const callback = await callbackPromise;

  if (callback.error) {
    throw new Error(
      `Login denied: ${callback.error}${callback.errorDescription ? ` — ${callback.errorDescription}` : ''}`,
    );
  }

  const tokenRes = await fetch(`${authApiBase(config)}/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: callback.code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: verifier,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(
      `Token exchange failed (${tokenRes.status}): ${body.trim() || tokenRes.statusText}`,
    );
  }

  const tokens = (await tokenRes.json()) as TokenResponse;
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : undefined;

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt,
  };
}

export async function refreshAccessToken(
  config: FoundryConfig,
): Promise<BrowserLoginResult> {
  if (!config.refreshToken) {
    throw new Error('No refresh token stored. Run `foundry auth login`.');
  }

  const cimd = await fetchCimdMetadata(config);
  const tokenRes = await fetch(`${authApiBase(config)}/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
      client_id: cimd.client_id,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(
      `Refresh failed (${tokenRes.status}). Run \`foundry auth login\` again.\n${body.trim()}`,
    );
  }

  const tokens = (await tokenRes.json()) as TokenResponse;
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : undefined;

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? config.refreshToken,
    expiresAt,
  };
}
