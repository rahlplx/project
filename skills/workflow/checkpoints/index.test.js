const Checkpoints = require('./index');

describe('Checkpoints', () => {
  it('should create instance', () => {
    const s = new Checkpoints();
    expect(s.name).toBe('checkpoints');
  });

  it('should define checkpoints', () => {
    const s = new Checkpoints();
    const cp = s.define('MVP', ['setup', 'build', 'deploy']);
    expect(cp.tasks).toHaveLength(3);
    expect(cp.status).toBe('pending');
  });

  it('should complete checkpoints', () => {
    const s = new Checkpoints();
    const cp = s.define('Setup');
    const result = s.complete(cp.id);
    expect(result.status).toBe('completed');
  });

  it('should track progress', () => {
    const s = new Checkpoints();
    s.define('Phase 1', ['a']);
    s.define('Phase 2', ['b']);
    const p = s.progress();
    expect(p.summary.total).toBe(2);
  });
});
