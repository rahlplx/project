const DoneVerifier = require('./index');

describe('DoneVerifier', () => {
  it('should start a verification session', () => {
    const s = new DoneVerifier();
    const r = s.startVerification('my-app');
    expect(r.type).toBe('verification_started');
    expect(r.sessionId).toBeDefined();
    expect(r.totalChecks).toBeGreaterThan(0);
  });

  it('should report an error for an unknown session', () => {
    const s = new DoneVerifier();
    const r = s.respond('nope', 'spec_met', true);
    expect(r.type).toBe('error');
  });

  it('should record responses and report readiness', () => {
    const s = new DoneVerifier();
    const { sessionId, totalChecks } = s.startVerification('my-app');
    const criteria = s.getCriteria().criteria;
    for (const c of criteria) {
      s.respond(sessionId, c.id, true, 'looks good');
    }
    const report = s.getReport(sessionId);
    expect(report.readyToShip).toBe(true);
    expect(report.passedCount).toBe(totalChecks);
  });

  it('should flag blocking failures as not ready', () => {
    const s = new DoneVerifier();
    const { sessionId } = s.startVerification('my-app');
    s.respond(sessionId, 'spec_met', false, 'missing feature');
    const report = s.getReport(sessionId);
    expect(report.readyToShip).toBe(false);
    expect(report.blockingIssues.some(i => i.id === 'spec_met')).toBe(true);
  });

  it('should support a quick check without a session', () => {
    const s = new DoneVerifier();
    const r = s.quickCheck({ spec_met: true, tests_pass: false });
    expect(r.readyToShip).toBe(false);
    expect(r.blockingIssues.length).toBeGreaterThan(0);
  });

  it('should filter criteria by category', () => {
    const s = new DoneVerifier();
    const r = s.getCriteria('security');
    expect(r.criteria.every(c => c.category === 'security')).toBe(true);
  });

  it('should render a markdown checklist', () => {
    const s = new DoneVerifier();
    const md = s.toMarkdown();
    expect(md).toContain('Done Checklist');
  });
});
