const VibeReview = require('./index');

describe('VibeReview', () => {
  it('should create instance', () => {
    const s = new VibeReview();
    expect(s.name).toBe('vibe-review');
  });

  it('should review clean code', () => {
    const s = new VibeReview();
    const r = s.review('const x = 1;');
    expect(r.success).toBe(true);
    expect(r.rating.label).toBe('Excellent');
  });

  it('should flag hardcoded secrets', () => {
    const s = new VibeReview();
    const r = s.review('const API_KEY = "sk-1234567890abcdef";');
    expect(r.stats.criticalIssues).toBeGreaterThan(0);
  });

  it('should flag eval usage', () => {
    const s = new VibeReview();
    const r = s.review('eval(userInput);');
    expect(r.findings.some(f => f.message.includes('eval'))).toBe(true);
  });

  it('should flag console.log spam', () => {
    const s = new VibeReview();
    const r = s.review('console.log(1); console.log(2); console.log(3); console.log(4);');
    expect(r.stats.warnings).toBeGreaterThan(0);
  });

  it('should handle large files', () => {
    const s = new VibeReview();
    const big = Array(600).fill('const x = 1;').join('\n');
    const r = s.review(big);
    expect(r.findings.some(f => f.message.includes('long'))).toBe(true);
  });

  it('should handle empty input', () => {
    const s = new VibeReview();
    const r = s.review('');
    expect(r.success).toBe(false);
  });
});
