const Rollback = require('./index');

describe('Rollback', () => {
  it('should create instance', () => {
    const s = new Rollback();
    expect(s.name).toBe('rollback');
  });

  it('should build undo commit command', () => {
    const s = new Rollback();
    const r = s.buildCommand('undo-commit', 'abc123');
    expect(r.cmd).toContain('git revert');
    expect(r.safe).toBe(true);
  });

  it('should warn on destructive commands', () => {
    const s = new Rollback();
    const r = s.buildCommand('reset-to-commit');
    expect(r.safe).toBe(false);
  });

  it('should suggest recovery for scenarios', () => {
    const s = new Rollback();
    const r = s.suggestRecovery('I committed to the wrong branch');
    expect(r.type).toBe('undo-commit');
  });

  it('should suggest recovery for deleted files', () => {
    const s = new Rollback();
    const r = s.suggestRecovery('I accidentally deleted a file');
    expect(r.type).toBe('revert-file');
  });
});
