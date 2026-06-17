const fs = require('fs');
const os = require('os');
const path = require('path');
const CavemanMode = require('./index');

describe('CavemanMode', () => {
  let tmpDir;
  let statsPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'caveman-'));
    statsPath = path.join(tmpDir, 'caveman-stats.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should list all four levels', () => {
    const c = new CavemanMode({ statsPath });
    const levels = c.listLevels();
    expect(levels.map(l => l.name)).toEqual(['lite', 'full', 'ultra', 'wenyan']);
  });

  it('should return an error for an unknown level', () => {
    const c = new CavemanMode({ statsPath });
    const r = c.getLevel('extreme');
    expect(r.type).toBe('error');
  });

  it('should strip filler phrases at full level', () => {
    const c = new CavemanMode({ statsPath });
    const r = c.compressText("I'd be happy to help, let me just check the file.", 'full');
    expect(r.text).not.toMatch(/i'd be happy to/i);
    expect(r.text).not.toMatch(/let me/i);
    expect(r.afterChars).toBeLessThan(r.beforeChars);
  });

  it('should strip articles at ultra level', () => {
    const c = new CavemanMode({ statsPath });
    const r = c.compressText('The file has a bug in the function.', 'ultra');
    expect(r.text).not.toMatch(/\bthe\b/i);
  });

  it('should flag wenyan as requiring a model rewrite', () => {
    const c = new CavemanMode({ statsPath });
    const r = c.compressText('Some text.', 'wenyan');
    expect(r.requiresModel).toBe(true);
  });

  it('should format a conventional commit message under 50 chars', () => {
    const c = new CavemanMode({ statsPath });
    const r = c.formatCommitMessage({
      type: 'fix',
      scope: 'auth',
      subject: 'reject expired tokens',
    });
    expect(r.header).toBe('fix(auth): reject expired tokens');
    expect(r.header.length).toBeLessThanOrEqual(50);
  });

  it('should format a one-line review comment', () => {
    const c = new CavemanMode({ statsPath });
    const r = c.formatReviewComment({
      line: 42,
      severity: 'critical',
      category: 'bug',
      message: 'null deref',
    });
    expect(r.comment).toBe('L42: 🔴 bug: null deref');
  });

  it('should record and aggregate savings', () => {
    const c = new CavemanMode({ statsPath });
    c.recordSavings({ beforeChars: 1000, afterChars: 400, costPerKChars: 0.01 });
    c.recordSavings({ beforeChars: 500, afterChars: 200, costPerKChars: 0.01 });
    const stats = c.getStats();
    expect(stats.sessions).toBe(2);
    expect(stats.totalSavedChars).toBe(900);
    expect(stats.reductionPct).toBeGreaterThan(0);
  });

  it('should render a markdown summary', () => {
    const c = new CavemanMode({ statsPath });
    const md = c.toMarkdown();
    expect(md).toContain('Caveman Mode');
    expect(md).toContain('ultra');
  });
});
