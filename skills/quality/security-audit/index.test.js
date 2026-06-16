const SecurityAudit = require('./index');

describe('SecurityAudit', () => {
  it('should flag a hardcoded secret', () => {
    const s = new SecurityAudit();
    const r = s.scanCode("const apiKey = 'sk_live_1234567890abcdef';");
    expect(r.safe).toBe(false);
    expect(r.issues.some(i => i.id === 'hardcoded_secret')).toBe(true);
  });

  it('should consider clean code safe', () => {
    const s = new SecurityAudit();
    const r = s.scanCode('const x = computeTotal(items);');
    expect(r.safe).toBe(true);
    expect(r.issuesFound).toBe(0);
  });

  it('should flag permissive CORS', () => {
    const s = new SecurityAudit();
    const r = s.scanCode("cors({ origin: '*' })");
    expect(r.issues.some(i => i.id === 'cors_star')).toBe(true);
  });

  it('should generate an OWASP checklist', () => {
    const s = new SecurityAudit();
    const r = s.auditChecklist('web');
    expect(r.totalCategories).toBe(10);
    expect(r.checklist.every(c => c.checks.length > 0)).toBe(true);
  });

  it('should exclude software-integrity for api apps', () => {
    const s = new SecurityAudit();
    const r = s.auditChecklist('api');
    expect(r.checklist.some(c => c.id === 'A08_software_integrity')).toBe(false);
  });

  it('should evaluate answers and flag critical risk', () => {
    const s = new SecurityAudit();
    const r = s.evaluate({ A03_injection: { passed: false, notes: 'no sanitization' } });
    expect(r.overallRisk).toBe('CRITICAL');
    expect(r.readyToShip).toBe(false);
  });

  it('should report low risk when nothing failed', () => {
    const s = new SecurityAudit();
    const r = s.evaluate({});
    expect(r.overallRisk).toBe('LOW');
    expect(r.readyToShip).toBe(true);
  });

  it('should look up a rule by OWASP id', () => {
    const s = new SecurityAudit();
    const r = s.getOwaspRule('A01');
    expect(r.name).toBe('Broken Access Control');
  });

  it('should return an error for an unknown OWASP id', () => {
    const s = new SecurityAudit();
    const r = s.getOwaspRule('A99');
    expect(r.type).toBe('error');
  });

  it('should render a markdown checklist', () => {
    const s = new SecurityAudit();
    const md = s.toMarkdown();
    expect(md).toContain('Security Audit Checklist');
  });
});
