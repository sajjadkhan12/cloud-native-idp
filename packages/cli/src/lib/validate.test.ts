import { resolveTemplateRef, validateServiceName } from './validate';

describe('validateServiceName', () => {
  it('accepts valid DNS-safe names', () => {
    expect(() => validateServiceName('payment-api')).not.toThrow();
    expect(() => validateServiceName('my-api')).not.toThrow();
  });

  it('rejects invalid names', () => {
    expect(() => validateServiceName('INVALID')).toThrow(/Invalid service name/);
    expect(() => validateServiceName('a')).toThrow();
    expect(() => validateServiceName('-bad')).toThrow();
  });
});

describe('resolveTemplateRef', () => {
  it('maps short names to default namespace', () => {
    expect(resolveTemplateRef('python-fastapi')).toBe(
      'template:default/python-fastapi',
    );
  });

  it('passes through full entity refs', () => {
    expect(resolveTemplateRef('template:custom/my-tpl')).toBe(
      'template:custom/my-tpl',
    );
  });
});
