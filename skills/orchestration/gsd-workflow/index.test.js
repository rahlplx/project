const GSDWorkflow = require('./index');

describe('GSDWorkflow', () => {
  it('should create instance', () => {
    const g = new GSDWorkflow();
    expect(g.name).toBe('gsd-workflow');
  });

  it('should expose define/build/ship stages', () => {
    const g = new GSDWorkflow();
    const stages = g.getStages().map(s => s.name);
    expect(stages).toEqual(['define', 'build', 'ship']);
  });

  it('should recommend gsd-discuss-phase when requirements are not locked', () => {
    const g = new GSDWorkflow();
    expect(g.nextCommand('define', {})).toBe('gsd-discuss-phase');
  });

  it('should recommend gsd-ui-phase when requirements locked and has UI', () => {
    const g = new GSDWorkflow();
    expect(g.nextCommand('define', { requirementsLocked: true, hasUI: true })).toBe('gsd-ui-phase');
  });

  it('should recommend gsd-plan-phase once define is complete', () => {
    const g = new GSDWorkflow();
    expect(g.nextCommand('define', { requirementsLocked: true, hasUI: false })).toBe(
      'gsd-plan-phase'
    );
  });

  it('should walk the build stage from plan to execute to verify', () => {
    const g = new GSDWorkflow();
    expect(g.nextCommand('build', {})).toBe('gsd-plan-phase');
    expect(g.nextCommand('build', { plansApproved: true })).toBe('gsd-execute-phase');
    expect(g.nextCommand('build', { plansApproved: true, executed: true })).toBe('gsd-verify-work');
  });

  it('should walk the ship stage from verify to ship to audit', () => {
    const g = new GSDWorkflow();
    expect(g.nextCommand('ship', {})).toBe('gsd-verify-work');
    expect(g.nextCommand('ship', { verified: true })).toBe('gsd-ship');
    expect(g.nextCommand('ship', { verified: true, shipped: true })).toBe('gsd-audit-milestone');
  });

  it('should return an error for an unknown stage', () => {
    const g = new GSDWorkflow();
    const r = g.nextCommand('nope', {});
    expect(r.error).toMatch(/Unknown stage/);
  });

  it('should validate the atomic-commit guarantee for a complete task', () => {
    const g = new GSDWorkflow();
    const r = g.validateAtomicCommit({
      commitSha: 'abc123',
      summaryPath: 'T01-SUMMARY.md',
      verificationPath: 'VERIFICATION.md',
    });
    expect(r.atomic).toBe(true);
    expect(r.missing.length).toBe(0);
  });

  it('should flag missing atomic-commit artifacts', () => {
    const g = new GSDWorkflow();
    const r = g.validateAtomicCommit({ commitSha: 'abc123' });
    expect(r.atomic).toBe(false);
    expect(r.missing.length).toBe(2);
  });

  it('should audit a milestone for unshipped requirements', () => {
    const g = new GSDWorkflow();
    const r = g.auditMilestone(['req-a', 'req-b', 'req-c'], ['req-a', 'req-c']);
    expect(r.complete).toBe(false);
    expect(r.missing).toEqual(['req-b']);
  });

  it('should report a complete milestone when all requirements are shipped', () => {
    const g = new GSDWorkflow();
    const r = g.auditMilestone(['req-a'], ['req-a']);
    expect(r.complete).toBe(true);
  });

  it('should preserve prior waves and isolate a failed task on resume', () => {
    const g = new GSDWorkflow();
    const r = g.resumeAfterFailure([
      {
        tasks: [
          { id: 'T01', status: 'completed' },
          { id: 'T02', status: 'completed' },
        ],
      },
      {
        tasks: [
          { id: 'T03', status: 'failed' },
          { id: 'T04', status: 'completed' },
        ],
      },
    ]);
    expect(r.preservedTasks).toEqual(['T01', 'T02']);
    expect(r.failedTask).toBe('T03');
  });

  it('should report all waves completed when nothing failed', () => {
    const g = new GSDWorkflow();
    const r = g.resumeAfterFailure([{ tasks: [{ id: 'T01', status: 'completed' }] }]);
    expect(r.failedTask).toBe(null);
    expect(r.action).toMatch(/All waves completed/);
  });

  it('should list auxiliary commands', () => {
    const g = new GSDWorkflow();
    expect(g.getAuxiliaryCommands()).toContain('gsd-quick');
  });

  it('should render toJSON', () => {
    const g = new GSDWorkflow();
    const json = g.toJSON();
    expect(json.stages).toEqual(['define', 'build', 'ship']);
  });
});
