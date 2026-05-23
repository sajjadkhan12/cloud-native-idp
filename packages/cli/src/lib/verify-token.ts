import type { FoundryConfig } from '../config/store';
import { createScaffolderClient, authOptions } from '../client/scaffolder';

/** Confirm the token works against the Foundry backend before saving it. */
export async function verifyTokenWithBackend(
  config: FoundryConfig,
  token: string,
): Promise<void> {
  const base = config.backendUrl.replace(/\/$/, '');

  const userinfo = await fetch(`${base}/api/auth/v1/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userinfo.ok) {
    throw new Error(
      `Token rejected by backend (${userinfo.status} ${userinfo.statusText}). ` +
        'Copy a fresh Bearer token from a request to http://localhost:7007/api/... in DevTools.',
    );
  }

  const client = createScaffolderClient(config);
  await client.listActions(authOptions(token));
}
