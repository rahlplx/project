const TaskCoordinator = require('./index');

describe('TaskCoordinator', () => {
  it('should create instance', () => {
    const s = new TaskCoordinator();
    expect(s.name).toBe('task-coordinator');
  });

  it('should define workflows', () => {
    const s = new TaskCoordinator();
    const wf = s.define('Deploy', [{ name: 'Build' }, { name: 'Test', dependsOn: ['S01'] }, { name: 'Deploy', dependsOn: ['S02'] }]);
    expect(wf.steps).toHaveLength(3);
  });

  it('should resolve dependency order', () => {
    const s = new TaskCoordinator();
    const wf = s.define('Test', [{ name: 'Setup' }, { name: 'Run', dependsOn: ['S01'] }]);
    const r = s.execute(wf.id);
    expect(r.executionOrder[0]).toBe('S01');
  });

  it('should report status', () => {
    const s = new TaskCoordinator();
    const wf = s.define('Simple', [{ name: 'Step 1' }]);
    const st = s.status(wf.id);
    expect(st.progress).toBe('0/1');
  });
});
