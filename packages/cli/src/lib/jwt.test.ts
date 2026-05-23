import { assertBackstageToken, parseTokenIdentity } from './jwt';

function fakeBackstageToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.sig`;
}

describe('assertBackstageToken', () => {
  it('accepts a Backstage-shaped token', () => {
    const token = fakeBackstageToken({
      iss: 'http://localhost:7007/api/auth',
      sub: 'user:development/sajjadkhan12',
      ent: ['user:development/sajjadkhan12'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const id = assertBackstageToken(token);
    expect(id.entityRef).toBe('user:development/sajjadkhan12');
  });

  it('rejects cookie-style pasted values', () => {
    expect(() =>
      assertBackstageToken('eyJh.eyJi.sig; argocd.token=eyJx.y.z'),
    ).toThrow(/Cookie header/);
  });

  it('rejects OAuth-style access tokens', () => {
    const token = fakeBackstageToken({
      sub: '5a80f9d0-ed82-4848-8407-3a03e618a2e4',
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    expect(() => assertBackstageToken(token)).toThrow(/does not look like a Backstage token/);
  });
});

describe('parseTokenIdentity', () => {
  it('reads entity from ent claim', () => {
    const token = fakeBackstageToken({
      sub: 'user:development/guest',
      ent: ['user:development/guest'],
    });
    expect(parseTokenIdentity(token).entityRef).toBe('user:development/guest');
  });
});
