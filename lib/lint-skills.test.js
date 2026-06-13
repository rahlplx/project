const { lintSkills, formatReport, lintFile, gatherSkillFiles } = require('./lint-skills');
const path = require('path');

describe('gatherSkillFiles', () => {
  test('discovers all 45 skills', () => {
    const files = gatherSkillFiles(path.resolve(__dirname, '..'));
    expect(files.length).toBe(45);
  });

  test('each path ends with index.js', () => {
    const files = gatherSkillFiles(path.resolve(__dirname, '..'));
    files.forEach(f => expect(f.endsWith('index.js')).toBe(true));
  });
});

describe('lintFile', () => {
  test('a valid class-based skill passes', () => {
    const content = `
class GitFreeDeploy {
  constructor() {
    this.name = 'test';
    this.description = 'A test skill';
  }
  run() {
    return 'ok';
  }
}
module.exports = GitFreeDeploy;
`;
    const result = lintFile('test.js', content);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  test('valid non-class skill with exports passes', () => {
    const content = `
const foo = () => 1;
const bar = () => 2;
const baz = () => 3;
const qux = () => 4;
const quux = () => 5;
const corge = () => 6;
const grault = () => 7;
const garply = () => 8;
module.exports = { foo, bar, baz, qux, quux, corge, grault, garply };
`;
    const result = lintFile('test.js', content);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  test('missing module.exports errors', () => {
    const content = 'const x = 1;';
    const result = lintFile('test.js', content);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].type).toBe('exports');
  });

  test('class without name property warns', () => {
    const content = `class Foo { constructor() { } } module.exports = Foo;`;
    const result = lintFile('test.js', content);
    const nameWarn = result.warnings.find(w => w.type === 'class-name');
    expect(nameWarn).toBeDefined();
  });
});

describe('lintSkills', () => {
  test('returns correct structure', () => {
    const result = lintSkills({ rootDir: path.resolve(__dirname, '..') });
    expect(result.files).toBe(45);
    expect(result.clean).toBeGreaterThanOrEqual(39);
    expect(Array.isArray(result.issues)).toBe(true);
  });

  test('no errors in existing skills', () => {
    const result = lintSkills({ rootDir: path.resolve(__dirname, '..') });
    const errorCount = result.issues.reduce((sum, i) => sum + i.errors.length, 0);
    expect(errorCount).toBe(0);
  });
});

describe('formatReport', () => {
  test('formats empty report', () => {
    const result = { files: 45, clean: 45, issues: [] };
    const report = formatReport(result);
    expect(report).toContain('All skills passed lint checks.');
  });

  test('formats with issues', () => {
    const result = {
      files: 1, clean: 0, issues: [
        { file: 'skills/foo/index.js', errors: [], warnings: [{ type: 'class-name', detail: 'no name' }] }
      ]
    };
    const report = formatReport(result);
    expect(report).toContain('WARN');
    expect(report).toContain('no name');
  });
});
