import type { FoundryConfig } from '../config/store';

type GuestRefreshResponse = {
  backstageIdentity?: { token?: string };
};

/** Fetch a guest JWT from a local Foundry backend (dev only). */
export async function fetchGuestToken(config: FoundryConfig): Promise<string> {
  const base = config.backendUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/api/auth/guest/refresh`);

  if (!res.ok) {
    throw new Error(
      `Guest auth failed (${res.status}). Is Foundry running at ${config.backendUrl}? Try \`yarn start\`.`,
    );
  }

  const body = (await res.json()) as GuestRefreshResponse;
  const token = body.backstageIdentity?.token;

  if (!token) {
    throw new Error('Guest refresh did not return a token.');
  }

  return token;
}
