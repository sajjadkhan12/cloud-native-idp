export type TokenIdentity = {
  subject: string;
  entityRef?: string;
  expiresAt?: Date;
  issuer?: string;
};

type JwtPayload = {
  sub?: string;
  ent?: string[];
  exp?: number;
  iss?: string;
  aud?: string | string[];
  type?: string;
};

export function parseTokenIdentity(token: string): TokenIdentity {
  const payload = decodePayload(token);
  const subject = payload.sub ?? 'unknown';
  const entityRef =
    payload.ent?.find(e => e.startsWith('user:')) ??
    payload.ent?.[0] ??
    (subject.startsWith('user:') ? subject : undefined);

  return {
    subject,
    entityRef,
    expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
    issuer: payload.iss,
  };
}

function decodePayload(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format (expected JWT with 3 parts)');
  }

  return JSON.parse(
    Buffer.from(parts[1], 'base64url').toString('utf8'),
  ) as JwtPayload;
}

/** Reject OAuth/GitHub tokens that are not Backstage session JWTs. */
export function assertBackstageToken(token: string): TokenIdentity {
  if (token.includes(';') || token.includes('=')) {
    throw new Error(
      [
        'Token looks like a Cookie header (semicolons or name=value pairs).',
        'Do not copy from DevTools → Application → Cookies.',
        'Use Network → /api/auth/github/refresh → Response → backstageIdentity.token',
        'Run: yarn foundry auth github',
      ].join('\n'),
    );
  }

  const payload = decodePayload(token);
  const identity = parseTokenIdentity(token);

  const iss = payload.iss ?? '';
  const looksLikeBackstage =
    iss.includes('/api/auth') ||
    iss.includes('backstage') ||
    (Array.isArray(payload.ent) && payload.ent.length > 0) ||
    (payload.sub?.startsWith('user:') ?? false);

  if (!looksLikeBackstage) {
    throw new Error(
      [
        'This does not look like a Backstage token.',
        `Got iss="${iss || '(missing)'}" sub="${payload.sub ?? ''}" type="${payload.type ?? ''}".`,
        'Wrong sources: Cookies tab, argocd.token, GitHub.com requests, type "access" or "refresh".',
        'Right source: Network → localhost:7007/api/auth/github/refresh → Response → backstageIdentity.token',
        'Run: yarn foundry auth github',
      ].join('\n'),
    );
  }

  if (identity.expiresAt && identity.expiresAt.getTime() < Date.now()) {
    throw new Error(
      `Token expired at ${identity.expiresAt.toISOString()}. Sign in again in the browser and copy a fresh token.`,
    );
  }

  return identity;
}
