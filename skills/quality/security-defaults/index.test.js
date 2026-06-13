const SecurityDefaults = require('./index');

describe('SecurityDefaults', () => {
  it('should create instance', () => {
    const s = new SecurityDefaults();
    expect(s.name).toBe('security-defaults');
  });

  it('should pass clean code', () => {
    const s = new SecurityDefaults();
    const r = s.audit('const x = process.env.DB_URL;');
    expect(r.score).toBeGreaterThanOrEqual(50);
  });

  it('should flag hardcoded secrets', () => {
    const s = new SecurityDefaults();
    const r = s.audit('const key = "sk-1234567890abcdef12345678";');
    expect(r.failed.some(c => c.id === 'SEC01')).toBe(true);
  });

  it('should flag eval', () => {
    const s = new SecurityDefaults();
    const r = s.audit('eval(userInput);');
    expect(r.failed.some(c => c.id === 'SEC03')).toBe(true);
  });

  it('should flag innerHTML', () => {
    const s = new SecurityDefaults();
    const r = s.audit('div.innerHTML = "<b>hello</b>";');
    expect(r.failed.some(c => c.id === 'SEC07')).toBe(true);
  });

  it('should handle empty input', () => {
    const s = new SecurityDefaults();
    const r = s.audit('');
    expect(r.success).toBe(false);
  });

  it('should return OWASP reference', () => {
    const s = new SecurityDefaults();
    const ref = s.getOWASPReference();
    expect(ref.top10.length).toBe(7);
  });
});
