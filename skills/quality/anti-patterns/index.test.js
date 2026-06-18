const AntiPatterns = require('./index');

describe('AntiPatterns', () => {
  it('should create instance', () => {
    const s = new AntiPatterns();
    expect(s.name).toBe('anti-patterns');
  });

  it('should detect magic numbers', () => {
    const s = new AntiPatterns();
    const r = s.analyze('const x = 12345; const y = 67890; const z = 99999; const w = 11111;');
    expect(r.findings.some(f => f.id === 'AP01')).toBe(true);
  });

  it('should detect empty catch blocks', () => {
    const s = new AntiPatterns();
    const r = s.analyze('try { x() } catch (e) {}');
    expect(r.findings.some(f => f.id === 'AP06')).toBe(true);
  });

  it('should detect mixed naming conventions', () => {
    const s = new AntiPatterns();
    const r = s.analyze('const user_name = "john"; const userName = "john";');
    expect(r.findings.some(f => f.id === 'AP04')).toBe(true);
  });

  it('should handle empty input', () => {
    const s = new AntiPatterns();
    const r = s.analyze('');
    expect(r.success).toBe(false);
  });

  it('should have 10 patterns', () => {
    const s = new AntiPatterns();
    expect(s.toJSON().patterns).toBe(10);
  });

  it('should detect deep nesting (AP03) on code with 5+ nesting levels', () => {
    const s = new AntiPatterns();
    const code = 'if (a) { if (b) { if (c) { if (d) { if (e) { doSomething(); } } } } }';
    const r = s.analyze(code);
    expect(r.findings.some(f => f.id === 'AP03')).toBe(true);
  });

  it('should NOT flag AP03 on shallow nesting (2 levels)', () => {
    const s = new AntiPatterns();
    const code = 'function foo() { if (a) { return b; } }';
    const r = s.analyze(code);
    expect(r.findings.some(f => f.id === 'AP03')).toBe(false);
  });
});
