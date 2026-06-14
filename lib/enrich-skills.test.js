const fs = require('fs');
const path = require('path');
const os = require('os');
const { enrichSkills } = require('./enrich-skills');

const projectRoot = path.resolve(__dirname, '..');

describe('enrichSkills', () => {
  test('scans and returns all skills', () => {
    const result = enrichSkills({ rootDir: projectRoot, write: false });
    expect(result.skill_count).toBeGreaterThanOrEqual(45);
    expect(result.skills.length).toBeGreaterThanOrEqual(45);
  });

  test('returns correct top-level structure', () => {
    const result = enrichSkills({ rootDir: projectRoot, write: false });
    expect(result).toHaveProperty('version', '1.0');
    expect(result).toHaveProperty('generated_at');
    expect(result).toHaveProperty('skill_count');
    expect(result).toHaveProperty('skills');
    expect(result).toHaveProperty('errors');
  });

  test('errors array is empty for valid skills', () => {
    const result = enrichSkills({ rootDir: projectRoot, write: false });
    expect(result.errors).toHaveLength(0);
  });

  test('each skill has digest in correct format', () => {
    const result = enrichSkills({ rootDir: projectRoot, write: false });
    for (const skill of result.skills) {
      expect(skill.digest).toMatch(/^sha256-[a-f0-9]{64}$/);
    }
  });

  test('idempotent — running twice produces same result', () => {
    const result1 = enrichSkills({ rootDir: projectRoot, write: false });
    const result2 = enrichSkills({ rootDir: projectRoot, write: false });
    expect(result1.skill_count).toBe(result2.skill_count);
    expect(result1.skills.map(s => s.digest)).toEqual(result2.skills.map(s => s.digest));
  });

  test('writes index file when write option is true', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-'));
    try {
      fs.mkdirSync(path.join(tmpDir, 'skills', 'test', 'my-skill'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'skills', 'test', 'my-skill', 'index.js'),
        `class MySkill {
  constructor() {
    this.name = 'my-skill';
    this.description = 'A test skill';
  }
}
module.exports = MySkill;`);

      enrichSkills({ rootDir: tmpDir, write: true });

      const indexPath = path.join(tmpDir, '.well-known', 'agent-skills', 'index.json');
      expect(fs.existsSync(indexPath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      expect(content.skill_count).toBe(1);
      expect(content.skills[0].name).toBe('my-skill');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('reports errors for invalid skill files', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-'));
    try {
      fs.mkdirSync(path.join(tmpDir, 'skills', 'broken', 'bad-skill'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'skills', 'broken', 'bad-skill', 'index.js'), 'not valid javascript {{{');

      const result = enrichSkills({ rootDir: tmpDir, write: false });
      expect(result.skill_count).toBe(1);
      expect(result.skills[0].name).toBe('bad-skill');
      expect(result.skills[0].description).toBe('');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
