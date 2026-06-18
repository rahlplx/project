const fs = require('fs');
const os = require('os');
const path = require('path');
const CodeHealth = require('./index');

describe('CodeHealth', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-health-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should report a missing file as an error', () => {
    const s = new CodeHealth({ projectRoot: tmpDir });
    const r = s.analyzeFile('does-not-exist.js');
    expect(r.type).toBe('error');
  });

  it('should find no issues in clean code', () => {
    fs.writeFileSync(path.join(tmpDir, 'clean.js'), 'const x = 1;\nmodule.exports = x;\n');
    const s = new CodeHealth({ projectRoot: tmpDir });
    const r = s.analyzeFile('clean.js');
    expect(r.issueCount).toBe(0);
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
  });

  it('should flag eval() as critical', () => {
    fs.writeFileSync(path.join(tmpDir, 'risky.js'), "eval('1+1');\n");
    const s = new CodeHealth({ projectRoot: tmpDir });
    const r = s.analyzeFile('risky.js');
    expect(r.issues.some(i => i.checkId === 'no_eval' && i.severity === 'critical')).toBe(true);
  });

  it('should flag console.log as a warning', () => {
    fs.writeFileSync(path.join(tmpDir, 'debug.js'), "console.log('debug');\n");
    const s = new CodeHealth({ projectRoot: tmpDir });
    const r = s.analyzeFile('debug.js');
    expect(r.issues.some(i => i.checkId === 'no_console_log')).toBe(true);
  });

  it('should analyze a directory recursively', () => {
    fs.writeFileSync(path.join(tmpDir, 'a.js'), 'const a = 1;\n');
    fs.mkdirSync(path.join(tmpDir, 'sub'));
    fs.writeFileSync(path.join(tmpDir, 'sub', 'b.js'), "console.log('x');\n");
    const s = new CodeHealth({ projectRoot: tmpDir });
    const r = s.analyzeDirectory('.');
    expect(r.filesAnalyzed).toBe(2);
    expect(r.totalIssues).toBeGreaterThan(0);
  });

  it('should list available health checks', () => {
    const s = new CodeHealth();
    const r = s.getCheckList();
    expect(r.checks.length).toBeGreaterThan(0);
  });

  it('should render a markdown report', () => {
    const s = new CodeHealth();
    const md = s.toMarkdown({ file: 'x.js', score: 90, grade: 'A', issueCount: 0 });
    expect(md).toContain('Code Health Report');
  });
});
