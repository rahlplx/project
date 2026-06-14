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

  it('should return 14 guardrails total', () => {
    const s = new Guardrails();
    expect(s.toJSON().guardrails).toHaveLength(14);
  });

  it('should trigger G09 spec file operation gate', () => {
    const s = new Guardrails();
    const r = s.check('open spec file for editing');
    expect(r.confirmations.some(c => c.id === 'G09')).toBe(true);
  });

  it('should trigger G10 acceptance criteria gate', () => {
    const s = new Guardrails();
    const r = s.check('check acceptance criteria');
    expect(r.confirmations.some(c => c.id === 'G10')).toBe(true);
  });

  it('should block on G11 decomposition gate', () => {
    const s = new Guardrails();
    const r = s.check('decompose the system architecture');
    expect(r.blocked).toBe(true);
    expect(r.confirmations.some(c => c.id === 'G11')).toBe(true);
  });

  it('should trigger G12 spec drift gate', () => {
    const s = new Guardrails();
    const r = s.check('detect spec drift');
    expect(r.confirmations.some(c => c.id === 'G12')).toBe(true);
  });

  it('should block on G13 spec override gate', () => {
    const s = new Guardrails();
    const r = s.check('override spec settings');
    expect(r.blocked).toBe(true);
    expect(r.confirmations.some(c => c.id === 'G13')).toBe(true);
  });

  it('should trigger G14 milestone spec check gate', () => {
    const s = new Guardrails();
    const r = s.check('check milestone spec');
    expect(r.confirmations.some(c => c.id === 'G14')).toBe(true);
  });

  it('should allow actions that match only confirmation gates', () => {
    const s = new Guardrails();
    const r = s.check('open spec file');
    expect(r.allowed).toBe(true);
    expect(r.confirmations.some(c => c.id === 'G09')).toBe(true);
  });

  it('should return correct count via check for spec actions', () => {
    const s = new Guardrails();
    const r = s.check('check milestone spec against decomposition');
    expect(r.confirmations.length).toBe(2);
  });
});
