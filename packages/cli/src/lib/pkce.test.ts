import { createPkcePair } from './pkce';

describe('createPkcePair', () => {
  it('produces S256 challenge from verifier', () => {
    const { verifier, challenge } = createPkcePair();
    expect(verifier.length).toBeGreaterThan(20);
    expect(challenge).not.toEqual(verifier);
  });
});
