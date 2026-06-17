const Verification = require('./index');

describe('Verification', () => {
  it('should create instance', () => {
    const s = new Verification();
    expect(s.name).toBe('verification');
  });

  it('should verify implemented features', () => {
    const s = new Verification();
    const spec = { features: [{ name: 'login', priority: 'high' }, { name: 'logout' }] };
    const r = s.verify(spec, 'function login() {}');
    expect(r.results[0].passed).toBe(true);
    expect(r.results[1].passed).toBe(false);
  });

  it('should detect critical missing items', () => {
    const s = new Verification();
    const spec = { features: [{ name: 'auth', priority: 'high' }] };
    const r = s.verify(spec, 'console.log("hello")');
    expect(r.verdict).toBe('FAIL');
  });

  it('should return success with empty features array', () => {
    const s = new Verification();
    const r = s.verify({ features: [] }, 'any code');
    expect(r.success).toBe(true);
    expect(r.score).toBe(100);
    expect(r.verdict).toBe('PASS');
    expect(r.results).toHaveLength(0);
  });

  it('should return error when spec is null', () => {
    const s = new Verification();
    const r = s.verify(null, 'some code');
    expect(r.success).toBe(false);
    expect(r.error).toBe('Both spec and implementation required.');
  });

  it('should return error when implementation is null', () => {
    const s = new Verification();
    const r = s.verify({ features: [{ name: 'login' }] }, null);
    expect(r.success).toBe(false);
    expect(r.error).toBe('Both spec and implementation required.');
  });

  it('should return error when implementation is empty string', () => {
    const s = new Verification();
    const r = s.verify({ features: [{ name: 'login' }] }, '');
    expect(r.success).toBe(false);
    expect(r.error).toBe('Both spec and implementation required.');
  });

  it('should mark all as failed when code is missing', () => {
    const s = new Verification();
    const spec = { features: ['login', 'logout', 'signup'] };
    const r = s.verify(spec, 'console.log("no features")');
    expect(r.results).toHaveLength(3);
    r.results.forEach(res => expect(res.passed).toBe(false));
    expect(r.score).toBe(0);
    expect(r.verdict).toBe('INCOMPLETE');
  });

  it('should detect partial matches correctly', () => {
    const s = new Verification();
    const spec = { features: ['login', 'logout', 'signup', 'reset'] };
    const r = s.verify(spec, 'function login() {} function logout() {}');
    expect(r.results.filter(res => res.passed)).toHaveLength(2);
    expect(r.results.filter(res => !res.passed)).toHaveLength(2);
    expect(r.score).toBe(50);
    expect(r.verdict).toBe('INCOMPLETE');
  });

  it('should return mixed results correctly', () => {
    const s = new Verification();
    const spec = {
      features: [
        { name: 'auth', priority: 'high' },
        { name: 'dashboard' },
        { name: 'billing', priority: 'high' },
        { name: 'profile', priority: 'low' },
      ],
    };
    const r = s.verify(spec, 'function auth() {} function profile() {}');
    expect(r.results).toHaveLength(4);
    expect(r.results[0].passed).toBe(true);
    expect(r.results[1].passed).toBe(false);
    expect(r.results[2].passed).toBe(false);
    expect(r.results[3].passed).toBe(true);
    expect(r.missingItems).toHaveLength(2);
    expect(r.missingItems[0].severity).toBe('warning');
    expect(r.missingItems[1].severity).toBe('critical');
    expect(r.verdict).toBe('FAIL');
  });

  it('should verify acceptance criteria', () => {
    const s = new Verification();
    const spec = {
      features: [{ name: 'login', acceptanceCriteria: ['email', 'token'] }],
    };
    const r = s.verifyAcceptanceCriteria(spec, 'function login() { return email + token; }');
    expect(r.total).toBe(2);
    expect(r.passed).toBe(2);
  });

  it('should verify against milestone', () => {
    const s = new Verification();
    const milestone = {
      name: 'Sprint 1',
      tasks: [
        { featureId: 'FEAT-001', featureName: 'login', type: 'GREEN' },
        { featureId: 'FEAT-002', featureName: 'logout', type: 'GREEN' },
      ],
    };
    const r = s.verifyAgainstMilestone(milestone, 'function login() {}');
    expect(r.milestone).toBe('Sprint 1');
    expect(r.total).toBe(2);
    expect(r.passed).toBeGreaterThanOrEqual(1);
  });

  it('should generate spec drift report', () => {
    const s = new Verification();
    const specA = { title: 'App', features: [{ name: 'login' }, { name: 'dashboard' }] };
    const specB = { title: 'App', features: [{ name: 'login' }, { name: 'admin' }] };
    const r = s.generateSpecDriftReport(specA, specB);
    expect(r.drifted).toBe(true);
    expect(r.added).toContain('admin');
    expect(r.removed).toContain('dashboard');
  });

  it('should enforce strict mode', () => {
    const s = new Verification({ strict: true });
    const spec = { features: [{ name: 'login' }] };
    const r = s.verify(spec, 'function login() {}');
    expect(r.strict).toBe(true);
  });
});
