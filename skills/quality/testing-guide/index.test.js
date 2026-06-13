const TestingGuide = require('./index');

describe('TestingGuide', () => {
  it('should create instance', () => {
    const s = new TestingGuide();
    expect(s.name).toBe('testing-guide');
  });

  it('should suggest tests for functions', () => {
    const s = new TestingGuide();
    const r = s.suggest('function add(a, b) { return a + b; }');
    expect(r.success).toBe(true);
    expect(r.stats.functionsFound).toBeGreaterThan(0);
    expect(r.testCases.length).toBeGreaterThan(0);
  });

  it('should detect Python', () => {
    const s = new TestingGuide();
    const r = s.suggest('def hello(name):\n  return f"Hi {name}"');
    expect(r.language).toBe('python');
  });

  it('should detect classes', () => {
    const s = new TestingGuide();
    const r = s.suggest('class User { constructor(name) { this.name = name; } }');
    expect(r.stats.classesFound).toBeGreaterThan(0);
  });

  it('should handle empty input', () => {
    const s = new TestingGuide();
    const r = s.suggest('');
    expect(r.success).toBe(false);
  });

  it('should include test file name', () => {
    const s = new TestingGuide();
    const r = s.suggest('const x = 1;', { fileName: 'utils' });
    expect(r.stats.testFileName).toContain('utils');
  });
});
