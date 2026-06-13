const HealthCheck = require('./index');

describe('HealthCheck', () => {
  it('should create instance', () => {
    const s = new HealthCheck();
    expect(s.name).toBe('health-check');
  });

  it('should run checks on current directory', () => {
    const s = new HealthCheck();
    const r = s.checkProject('.');
    expect(r.success).toBe(true);
    expect(r.checks.length).toBeGreaterThan(0);
  });

  it('should report nonexistent directory', () => {
    const s = new HealthCheck();
    // Should still run checks but most will fail
    const r = s.checkProject('/nonexistent/path');
    expect(r.score).toBeLessThan(100);
  });

  it('should generate recommendations', () => {
    const s = new HealthCheck();
    const r = s.checkProject('/empty/path');
    expect(r.recommendations).toBeDefined();
  });

  it('should include disk check', () => {
    const s = new HealthCheck();
    const r = s.checkProject('.');
    expect(r.disk).toHaveProperty('freeMemoryGB');
  });
});
