const Guardrails = require('./index');

describe('Guardrails', () => {
  it('should create instance', () => {
    const s = new Guardrails();
    expect(s.name).toBe('guardrails');
  });

  it('should allow safe actions', () => {
    const s = new Guardrails();
    const r = s.check('read file contents');
    expect(r.allowed).toBe(true);
  });

  it('should flag delete operations', () => {
    const s = new Guardrails();
    const r = s.check('delete the users table');
    expect(r.confirmations.length).toBeGreaterThan(0);
  });

  it('should block dangerous system commands', () => {
    const s = new Guardrails();
    const r = s.check('rm -rf /');
    expect(r.blocked).toBe(true);
  });

  it('should flag deploy operations', () => {
    const s = new Guardrails();
    const r = s.check('deploy to production');
    expect(r.confirmations.some(c => c.id === 'G04')).toBe(true);
  });

  it('should flag reset operations', () => {
    const s = new Guardrails();
    const r = s.check('reset the database');
    expect(r.confirmations.some(c => c.id === 'G06')).toBe(true);
  });

  it('should handle empty input', () => {
    const s = new Guardrails();
    const r = s.check('');
    expect(r.allowed).toBe(false);
  });

  it('should confirm guardrails', () => {
    const s = new Guardrails();
    const r = s.confirm('G01', 'delete file');
    expect(r.confirmed).toBe(true);
    expect(r.guardrailId).toBe('G01');
  });

  it('should return 8 guardrails', () => {
    const s = new Guardrails();
    expect(s.toJSON().guardrails).toHaveLength(8);
  });
});
