const CodeReview = require('./index');

describe('CodeReview', () => {
  it('should create instance', () => {
    const s = new CodeReview();
    expect(s.name).toBe('code-review');
  });

  it('should review clean code', () => {
    const s = new CodeReview();
    const r = s.review('const x = 1;\nconst y = 2;');
    expect(r.success).toBe(true);
    expect(r.stats.comments).toBe(0);
  });

  it('should flag var usage', () => {
    const s = new CodeReview();
    const r = s.review('var x = 1;');
    expect(r.comments.some(c => c.message.includes('var'))).toBe(true);
  });

  it('should flag console.log', () => {
    const s = new CodeReview();
    const r = s.review('console.log("debug");');
    expect(r.comments.some(c => c.severity === 'info')).toBe(true);
  });

  it('should flag empty catch', () => {
    const s = new CodeReview();
    const r = s.review('try { x(); } catch (e) {\n}');
    expect(r.comments.some(c => c.severity === 'critical')).toBe(true);
  });

  it('should flag innerHTML', () => {
    const s = new CodeReview();
    const r = s.review('div.innerHTML = "<b>hi</b>";');
    expect(r.comments.some(c => c.message.includes('innerHTML'))).toBe(true);
  });

  it('should handle empty input', () => {
    const s = new CodeReview();
    const r = s.review('');
    expect(r.success).toBe(false);
  });

  it('should include line numbers', () => {
    const s = new CodeReview();
    const r = s.review('console.log("a");\nconsole.log("b");\nvar x = 1;');
    r.comments.forEach(c => {
      expect(c).toHaveProperty('line');
    });
  });
});
