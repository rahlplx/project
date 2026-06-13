const GitOps = require('./index');

describe('GitOps', () => {
  it('should create instance', () => {
    const s = new GitOps();
    expect(s.name).toBe('git-ops');
  });

  it('should build git commands', () => {
    const s = new GitOps();
    const r = s.buildCommand('status');
    expect(r.cmd).toBe('git status');
  });

  it('should build commit command', () => {
    const s = new GitOps();
    const r = s.buildCommand('commit', { message: 'feat: add login' });
    expect(r.cmd).toContain('feat: add login');
  });

  it('should build push with upstream', () => {
    const s = new GitOps();
    const r = s.buildCommand('push', { first: true, branch: 'feat/x' });
    expect(r.cmd).toContain('--set-upstream');
  });

  it('should suggest workflows', () => {
    const s = new GitOps();
    const w = s.suggestWorkflow('feature');
    expect(w.length).toBeGreaterThan(0);
  });
});
