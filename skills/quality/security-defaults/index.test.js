const SecurityDefaults = require('./index');

describe('SecurityDefaults', () => {
  it('should create instance', () => {
    const s = new SecurityDefaults();
    expect(s.name).toBe('security-defaults');
  });

  it('should pass clean code', () => {
    const s = new SecurityDefaults();
    const r = s.audit('const x = process.env.DB_URL;');
    expect(r.score).toBeGreaterThanOrEqual(50);
  });

  it('should flag hardcoded secrets', () => {
    const s = new SecurityDefaults();
    const r = s.audit('const key = "sk-1234567890abcdef12345678";');
    expect(r.failed.some(c => c.id === 'SEC01')).toBe(true);
  });

  it('should flag eval', () => {
    const s = new SecurityDefaults();
    const r = s.audit('eval(userInput);');
    expect(r.failed.some(c => c.id === 'SEC03')).toBe(true);
  });

  it('should flag innerHTML', () => {
    const s = new SecurityDefaults();
    const r = s.audit('div.innerHTML = "<b>hello</b>";');
    expect(r.failed.some(c => c.id === 'SEC07')).toBe(true);
  });

  it('should handle empty input', () => {
    const s = new SecurityDefaults();
    const r = s.audit('');
    expect(r.success).toBe(false);
  });

  it('should return OWASP reference', () => {
    const s = new SecurityDefaults();
    const ref = s.getOWASPReference();
    expect(ref.top10.length).toBe(7);
  });

  it('toJSON returns name/version/description', () => {
    const s = new SecurityDefaults();
    const json = s.toJSON();
    expect(json.name).toBe('security-defaults');
    expect(json.version).toBe('1.0.0');
    expect(json.reference).toContain('OWASP');
  });

  it('verdict is PASS when score >= 80', () => {
    const s = new SecurityDefaults();
    const r = s.audit('const db = process.env.DB_URL; // validate and sanitize');
    expect(r.verdict).toBe('PASS');
  });

  it('verdict is FAIL when score < 50', () => {
    const s = new SecurityDefaults();
    const code = [
      'eval(userInput);',
      'div.innerHTML = data;',
      "app.get('/api', h);",
      "fetch('http://example.com');",
      "const q = 'SELECT * FROM ' + t;",
    ].join('\n');
    const r = s.audit(code);
    expect(r.verdict).toBe('FAIL');
  });

  it('SEC02 passes with options.noEnvCheck', () => {
    const s = new SecurityDefaults();
    const r = s.audit('const x = 1;', { noEnvCheck: true });
    expect(r.passed.some(c => c.id === 'SEC02')).toBe(true);
  });

  it('SEC04 passes with options.skipInputCheck', () => {
    const s = new SecurityDefaults();
    const r = s.audit('const x = req.body.data;', { skipInputCheck: true });
    expect(r.passed.some(c => c.id === 'SEC04')).toBe(true);
  });

  it('SEC05 passes with options.allowHttp', () => {
    const s = new SecurityDefaults();
    const r = s.audit("fetch('http://example.com');", { allowHttp: true });
    expect(r.passed.some(c => c.id === 'SEC05')).toBe(true);
  });

  it('SEC05 passes for http://localhost', () => {
    const s = new SecurityDefaults();
    const r = s.audit("fetch('http://localhost:3000');");
    expect(r.passed.some(c => c.id === 'SEC05')).toBe(true);
  });

  it('SEC06 passes with options.skipDbCheck', () => {
    const s = new SecurityDefaults();
    const r = s.audit("const q = 'SELECT ' + id;", { skipDbCheck: true });
    expect(r.passed.some(c => c.id === 'SEC06')).toBe(true);
  });

  it('SEC07 passes when innerHTML is sanitized with DOMPurify', () => {
    const s = new SecurityDefaults();
    const r = s.audit('div.innerHTML = DOMPurify.sanitize(data);');
    expect(r.passed.some(c => c.id === 'SEC07')).toBe(true);
  });

  it('SEC08 passes with options.skipAuthCheck', () => {
    const s = new SecurityDefaults();
    const r = s.audit('const password = req.body.pass;', { skipAuthCheck: true });
    expect(r.passed.some(c => c.id === 'SEC08')).toBe(true);
  });

  it('SEC09 passes when rate limiting is present', () => {
    const s = new SecurityDefaults();
    const r = s.audit("app.get('/api', rateLimit(), handler);");
    expect(r.passed.some(c => c.id === 'SEC09')).toBe(true);
  });

  it('SEC09 passes with options.skipRateLimit', () => {
    const s = new SecurityDefaults();
    const r = s.audit("app.get('/api', handler);", { skipRateLimit: true });
    expect(r.passed.some(c => c.id === 'SEC09')).toBe(true);
  });

  it('SEC10 passes when CORS is configured', () => {
    const s = new SecurityDefaults();
    const r = s.audit("app.use(cors()); app.get('/api', handler);");
    expect(r.passed.some(c => c.id === 'SEC10')).toBe(true);
  });

  it('SEC10 passes with options.skipCorsCheck', () => {
    const s = new SecurityDefaults();
    const r = s.audit("app.get('/api', handler);", { skipCorsCheck: true });
    expect(r.passed.some(c => c.id === 'SEC10')).toBe(true);
  });
});
