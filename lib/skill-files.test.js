const fs = require('fs');
const path = require('path');
const os = require('os');
const { gatherSkillFiles } = require('./skill-files');

const projectRoot = path.resolve(__dirname, '..');

describe('gatherSkillFiles', () => {
  test('returns all skill paths', () => {
    const result = gatherSkillFiles(projectRoot);
    expect(result.length).toBeGreaterThanOrEqual(45);
  });

  test('each path ends with index.js', () => {
    const result = gatherSkillFiles(projectRoot);
    result.forEach(p => expect(p.endsWith('index.js')).toBe(true));
  });

  test('each path contains skills directory', () => {
    const result = gatherSkillFiles(projectRoot);
    result.forEach(p => expect(p).toContain('skills'));
  });

  test('every path is absolute', () => {
    const result = gatherSkillFiles(projectRoot);
    result.forEach(p => expect(path.isAbsolute(p)).toBe(true));
  });

  test('no duplicate paths returned', () => {
    const result = gatherSkillFiles(projectRoot);
    expect(new Set(result).size).toBe(result.length);
  });

  test('returns all unique skill directories', () => {
    const result = gatherSkillFiles(projectRoot);
    const dirs = result.map(p => path.relative(path.join(projectRoot, 'skills'), path.dirname(p)).replace(/\\/g, '/'));
    dirs.sort();
    expect(dirs.length).toBeGreaterThanOrEqual(45);
    expect(dirs).toContain('deploy/git-free-deploy');
    expect(dirs).toContain('design/theme-factory');
    expect(dirs).toContain('quality/code-review');
    expect(dirs).toContain('workflow/tdd-vibe');
    expect(dirs).toContain('workflow/architect');
  });

  test.each([
    'design/theme-factory',
    'quality/code-review',
    'workflow/git-ops',
    'deploy/git-free-deploy',
    'setup/prompt-templates',
    'knowledge/context-memory',
    'explain/intent-capture',
    'orchestration/model-router',
    'preview/flowchart-gen',
    'progress/dashboard',
  ])('includes known skill: %s', (skillPath) => {
    const result = gatherSkillFiles(projectRoot);
    const full = path.join(projectRoot, 'skills', skillPath, 'index.js');
    expect(result).toContain(full);
  });

  test('returns empty array for nonexistent rootDir', () => {
    const result = gatherSkillFiles(path.join(os.tmpdir(), 'nonexistent-dir-' + Date.now()));
    expect(result).toEqual([]);
  });

  test('returns empty array when rootDir has no skills directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
    try {
      const result = gatherSkillFiles(tmpDir);
      expect(result).toEqual([]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('returns empty array when skills directory is empty', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
    fs.mkdirSync(path.join(tmpDir, 'skills'));
    try {
      const result = gatherSkillFiles(tmpDir);
      expect(result).toEqual([]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('ignores non-index.js files in skill directories', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
    fs.mkdirSync(path.join(tmpDir, 'skills', 'test-skill'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'skills', 'test-skill', 'helper.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'skills', 'test-skill', 'README.md'), '');
    try {
      const result = gatherSkillFiles(tmpDir);
      expect(result).toEqual([]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('finds index.js files in nested subdirectories', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
    fs.mkdirSync(path.join(tmpDir, 'skills', 'a', 'b', 'deep-skill'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'skills', 'a', 'b', 'deep-skill', 'index.js'), '');
    try {
      const result = gatherSkillFiles(tmpDir);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('deep-skill');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('handles multiple index.js files across multiple subdirectories', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
    fs.mkdirSync(path.join(tmpDir, 'skills', 'alpha'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'skills', 'beta'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'skills', 'nested', 'deep'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'skills', 'alpha', 'index.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'skills', 'beta', 'index.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'skills', 'nested', 'deep', 'index.js'), '');
    try {
      const result = gatherSkillFiles(tmpDir);
      expect(result).toHaveLength(3);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('rootDir is not itself a directory throws', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
    const filePath = path.join(tmpDir, 'not-a-dir');
    fs.writeFileSync(filePath, '');
    try {
      const result = gatherSkillFiles(filePath);
      expect(result).toEqual([]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
