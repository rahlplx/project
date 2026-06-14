const fs = require('fs');
const path = require('path');
const os = require('os');
const { extractFromModule, extractFromAny, extractFrontmatter, generateFrontmatter } = require('./skill-frontmatter');

describe('extractFrontmatter', () => {
  test('parses YAML frontmatter from markdown', () => {
    const content = `---
name: test-skill
description: A test skill
---

# Test Skill
Some instructions here.`;
    const result = extractFrontmatter(content);
    expect(result).toEqual({ name: 'test-skill', description: 'A test skill' });
  });

  test('returns null for content without frontmatter', () => {
    const content = '# Just a heading\nNo frontmatter here.';
    expect(extractFrontmatter(content)).toBeNull();
  });

  test('returns null for empty content', () => {
    expect(extractFrontmatter('')).toBeNull();
  });

  test('parses frontmatter with additional fields', () => {
    const content = `---
name: my-skill
description: Does something
category: design
version: 1.0.0
---

# Content`;
    const result = extractFrontmatter(content);
    expect(result.name).toBe('my-skill');
    expect(result.description).toBe('Does something');
    expect(result.category).toBe('design');
    expect(result.version).toBe('1.0.0');
  });
});

describe('generateFrontmatter', () => {
  test('produces valid YAML frontmatter', () => {
    const meta = { name: 'test-skill', description: 'A test skill', category: 'design' };
    const result = generateFrontmatter(meta);
    expect(result).toContain('---');
    expect(result).toContain('name: test-skill');
    expect(result).toContain('description: A test skill');
    expect(result).toContain('category: design');
  });

  test('round-trips with extractFrontmatter', () => {
    const meta = { name: 'round-trip', description: 'Round trip test', category: 'quality' };
    const frontmatter = generateFrontmatter(meta);
    const content = frontmatter + '\n# Body';
    const result = extractFrontmatter(content);
    expect(result).toEqual(meta);
  });
});

describe('extractFromModule', () => {
  test('extracts metadata from class-based skill', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-test-'));
    try {
      const skillDir = path.join(tmpDir, 'skills', 'design', 'test-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      const indexJs = path.join(skillDir, 'index.js');
      fs.writeFileSync(indexJs, `class TestSkill {
  constructor() {
    this.name = 'test-skill';
    this.description = 'A test skill class';
  }
}
module.exports = TestSkill;`);

      const result = extractFromModule(indexJs);
      expect(result).toEqual({ name: 'test-skill', description: 'A test skill class', category: 'design' });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('extracts metadata from object-based skill', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-test-'));
    try {
      const skillDir = path.join(tmpDir, 'skills', 'quality', 'obj-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      const indexJs = path.join(skillDir, 'index.js');
      fs.writeFileSync(indexJs, `module.exports = {
  name: 'obj-skill',
  description: 'An object skill'
};`);

      const result = extractFromModule(indexJs);
      expect(result).toEqual({ name: 'obj-skill', description: 'An object skill', category: 'quality' });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('returns null for missing file', () => {
    const result = extractFromModule(path.join(os.tmpdir(), 'nonexistent.js'));
    expect(result).toBeNull();
  });
});

describe('extractFromAny', () => {
  test('reads SKILL.md frontmatter when available', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-test-'));
    try {
      const skillDir = path.join(tmpDir, 'skills', 'deploy', 'md-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: md-skill
description: From SKILL.md frontmatter
---

# Content`);
      fs.writeFileSync(path.join(skillDir, 'index.js'), 'module.exports = { name: \'md-skill\', description: \'From module\' };');

      const result = extractFromAny(path.join(skillDir, 'index.js'));
      expect(result.description).toBe('From SKILL.md frontmatter');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('falls back to module when no SKILL.md', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-test-'));
    try {
      const skillDir = path.join(tmpDir, 'skills', 'workflow', 'fallback-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'index.js'), `class Fallback {
  constructor() {
    this.name = 'fallback-skill';
    this.description = 'Fallback module';
  }
}
module.exports = Fallback;`);

      const result = extractFromAny(path.join(skillDir, 'index.js'));
      expect(result.description).toBe('Fallback module');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('returns null when neither SKILL.md nor module works', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-test-'));
    try {
      const skillDir = path.join(tmpDir, 'skills', 'test', 'empty-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'index.js'), 'module.exports = {};');
      const result = extractFromAny(path.join(skillDir, 'index.js'));
      expect(result).toBeNull();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
