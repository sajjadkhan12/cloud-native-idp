import { resolveOwner } from './identity';

describe('resolveOwner', () => {
  it('prefers explicit --owner', () => {
    const owner = resolveOwner(
      { backendUrl: 'http://localhost:7007', appUrl: 'http://localhost:3000' },
      'user:default/sajjadkhan12',
    );
    expect(owner).toBe('user:default/sajjadkhan12');
  });

  it('uses identity from token when no explicit owner', () => {
    const token = [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      Buffer.from(
        JSON.stringify({
          sub: 'user:development/guest',
          ent: ['user:development/guest'],
        }),
      ).toString('base64url'),
      'sig',
    ].join('.');

    const owner = resolveOwner({
      backendUrl: 'http://localhost:7007',
      appUrl: 'http://localhost:3000',
      token,
    });
    expect(owner).toBe('user:development/guest');
  });
});
