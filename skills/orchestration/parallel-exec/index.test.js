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

  it('should return error for empty task list', () => {
    const s = new ParallelExec();
    const r = s.plan([]);
    expect(r.success).toBe(false);
    expect(r.error).toBe('No tasks to plan.');
  });

  it('should create one group for a single task', () => {
    const s = new ParallelExec();
    const r = s.plan([{ id: 'A' }]);
    expect(r.success).toBe(true);
    expect(r.groupCount).toBe(1);
    expect(r.groups[0].tasks).toEqual(['A']);
  });

  it('should group 4 independent tasks together in one group', () => {
    const s = new ParallelExec();
    const tasks = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
    const r = s.plan(tasks);
    expect(r.success).toBe(true);
    expect(r.groupCount).toBe(1);
    expect(r.groups[0].parallelCount).toBe(4);
    expect(r.speedup).toBe(4);
  });

  it('should handle task with invalid dependsOn gracefully', () => {
    const s = new ParallelExec();
    const tasks = [{ id: 'A', dependsOn: ['NONEXISTENT'] }, { id: 'B' }];
    const r = s.plan(tasks);
    expect(r.success).toBe(true);
    expect(r.groupCount).toBe(1);
  });

  it('should place task with valid dependsOn in later group', () => {
    const s = new ParallelExec();
    const tasks = [{ id: 'A' }, { id: 'B', dependsOn: ['A'] }];
    const r = s.plan(tasks);
    expect(r.success).toBe(true);
    expect(r.groupCount).toBe(2);
    expect(r.groups[0].tasks).toEqual(['A']);
    expect(r.groups[1].tasks).toEqual(['B']);
  });
});
