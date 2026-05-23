import crypto from 'crypto';

export function createPkcePair(): {
  verifier: string;
  challenge: string;
} {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

export function randomState(): string {
  return crypto.randomBytes(16).toString('base64url');
}
