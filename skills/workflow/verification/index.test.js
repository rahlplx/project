const Verification = require('./index');

describe('Verification', () => {
  it('should create instance', () => {
    const s = new Verification();
    expect(s.name).toBe('verification');
  });

  it('should verify implemented features', () => {
    const s = new Verification();
    const spec = { features: [{ name: 'login', priority: 'high' }, { name: 'logout' }] };
    const r = s.verify(spec, 'function login() {}');
    expect(r.results[0].passed).toBe(true);
    expect(r.results[1].passed).toBe(false);
  });

  it('should detect critical missing items', () => {
    const s = new Verification();
    const spec = { features: [{ name: 'auth', priority: 'high' }] };
    const r = s.verify(spec, 'console.log("hello")');
    expect(r.verdict).toBe('FAIL');
  });
});
