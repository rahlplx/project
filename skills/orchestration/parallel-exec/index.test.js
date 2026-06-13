const ParallelExec = require('./index');

describe('ParallelExec', () => {
  it('should create instance', () => {
    const s = new ParallelExec();
    expect(s.name).toBe('parallel-exec');
  });

  it('should group independent tasks', () => {
    const s = new ParallelExec();
    const tasks = [
      { id: 'A' }, { id: 'B', dependsOn: ['A'] }, { id: 'C' }
    ];
    const r = s.plan(tasks);
    expect(r.success).toBe(true);
    expect(r.groups.length).toBeGreaterThan(0);
  });

  it('should calculate speedup', () => {
    const s = new ParallelExec();
    const tasks = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const r = s.plan(tasks);
    expect(r.speedup).toBeGreaterThan(1);
  });
});
