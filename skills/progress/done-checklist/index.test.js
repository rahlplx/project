const DoneChecklist = require('./index');

describe('DoneChecklist', () => {
  it('should create instance with defaults', () => {
    const s = new DoneChecklist();
    expect(s.name).toBe('done-checklist');
    expect(s.version).toBe('1.0.0');
  });

  it('should return web checklist with 16 items', () => {
    const s = new DoneChecklist();
    const c = s.getChecklist('web');
    expect(c).toHaveLength(16);
    expect(c[0]).toHaveProperty('severity');
    expect(c[0]).toHaveProperty('check');
  });

  it('should return api checklist with 10 items', () => {
    const s = new DoneChecklist();
    const c = s.getChecklist('api');
    expect(c).toHaveLength(10);
  });

  it('should return cli checklist with 5 items', () => {
    const s = new DoneChecklist();
    const c = s.getChecklist('cli');
    expect(c).toHaveLength(5);
  });

  it('should return web checklist for unknown category', () => {
    const s = new DoneChecklist();
    const c = s.getChecklist('unknown');
    expect(c).toHaveLength(16);
  });

  it('should evaluate passing checklist', () => {
    const s = new DoneChecklist();
    const c = s.getChecklist('cli');
    const r = s.evaluate(c, { CLI01: true, CLI02: true, CLI03: true, CLI04: true, CLI05: true });
    expect(r.verdict).toContain('READY');
    expect(r.summary.passed).toBe(5);
  });

  it('should flag blockers when critical checks fail', () => {
    const s = new DoneChecklist();
    const c = s.getChecklist('cli');
    const r = s.evaluate(c, { CLI01: false, CLI02: true, CLI03: true, CLI04: true, CLI05: true });
    expect(r.verdict).toContain('NOT READY');
    expect(r.summary.blockers).toBe(1);
  });

  it('should have category breakdown in evaluation', () => {
    const s = new DoneChecklist();
    const c = s.getChecklist('web');
    const r = s.evaluate(c, {});
    expect(r.categories.length).toBeGreaterThan(0);
    expect(r.categories[0]).toHaveProperty('category');
  });

  it('should return metadata via toJSON', () => {
    const s = new DoneChecklist();
    const j = s.toJSON();
    expect(j.references).toContain('12-factor app');
  });
});
