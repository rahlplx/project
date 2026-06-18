const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { buildIndex, readIndex, writeIndex, computeDigest } = require('./discovery-index');

const projectRoot = path.resolve(__dirname, '..');

describe('computeDigest', () => {
  test('returns sha256- prefixed hex string', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'digest-test-'));
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'hello world');
    try {
      const result = computeDigest(filePath);
      assert.match(result, /^sha256-[a-f0-9]{64}$/);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('same content produces same digest', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'digest-test-'));
    const a = path.join(tmpDir, 'a.txt');
    const b = path.join(tmpDir, 'b.txt');
    fs.writeFileSync(a, 'same content');
    fs.writeFileSync(b, 'same content');
    try {
      assert.strictEqual(computeDigest(a), computeDigest(b));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('different content produces different digest', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'digest-test-'));
    const a = path.join(tmpDir, 'a.txt');
    const b = path.join(tmpDir, 'b.txt');
    fs.writeFileSync(a, 'content a');
    fs.writeFileSync(b, 'content b');
    try {
      assert.notStrictEqual(computeDigest(a), computeDigest(b));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('buildIndex', () => {
  test('returns correct top-level structure', () => {
    const result = buildIndex({ rootDir: projectRoot });
    assert.strictEqual(result.version, '1.0');
    assert.ok('$schema' in result);
    assert.ok('generated_at' in result);
    assert.doesNotThrow(() => new Date(result.generated_at));
    assert.ok('skill_count' in result);
    assert.ok(Array.isArray(result.skills));
    assert.ok(Array.isArray(result.errors));
  });

  test('discovers all skills', () => {
    const result = buildIndex({ rootDir: projectRoot });
    assert.ok(result.skill_count >= 45);
    assert.ok(result.skills.length >= 45);
  });

  test('each skill has required fields', () => {
    const result = buildIndex({ rootDir: projectRoot });
    for (const skill of result.skills) {
      assert.ok('name' in skill);
      assert.strictEqual(skill.type, 'skill-md');
      assert.ok('category' in skill);
      assert.ok('description' in skill);
      assert.ok('url' in skill);
      assert.ok('digest' in skill);
      assert.match(skill.digest, /^sha256-[a-f0-9]{64}$/);
    }
  });

  test('category is derived from directory structure', () => {
    const result = buildIndex({ rootDir: projectRoot });
    const valid =
      /^(deploy|deployment|design|explain|knowledge|orchestration|preview|progress|quality|setup|testing-qa|workflow)$/;
    for (const skill of result.skills) {
      assert.match(skill.category, valid);
    }
  });

  test('skills are sorted by name', () => {
    const result = buildIndex({ rootDir: projectRoot });
    const names = result.skills.map(s => s.name);
    assert.deepStrictEqual(names, [...names].sort());
  });

  test('generated_at is ISO 8601 string', () => {
    const result = buildIndex({ rootDir: projectRoot });
    assert.strictEqual(new Date(result.generated_at).toISOString(), result.generated_at);
  });

  test('url follows well-known convention', () => {
    const result = buildIndex({ rootDir: projectRoot });
    for (const skill of result.skills) {
      assert.strictEqual(skill.url, `/.well-known/agent-skills/${skill.name}/SKILL.md`);
    }
  });
});

describe('buildIndex — description extraction', () => {
  test('extracts description from SKILL.md heading paragraph when no frontmatter', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-desc-test-'));
    try {
      const skillDir = path.join(tmpDir, 'skills', 'quality', 'my-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'index.js'), 'module.exports = {};');
      fs.writeFileSync(
        path.join(skillDir, 'SKILL.md'),
        '# My Skill\n\nDetects security issues in code.\n\n## Usage\n...'
      );
      const result = buildIndex({ rootDir: tmpDir });
      const skill = result.skills.find(s => s.name === 'my-skill');
      assert.ok(skill, 'skill found in index');
      assert.strictEqual(skill.description, 'Detects security issues in code.');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('prefers YAML frontmatter description over heading paragraph', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-fm-test-'));
    try {
      const skillDir = path.join(tmpDir, 'skills', 'quality', 'fm-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'index.js'), 'module.exports = {};');
      fs.writeFileSync(
        path.join(skillDir, 'SKILL.md'),
        '---\ndescription: "From frontmatter"\n---\n# FM Skill\n\nShould be ignored.'
      );
      const result = buildIndex({ rootDir: tmpDir });
      const skill = result.skills.find(s => s.name === 'fm-skill');
      assert.ok(skill, 'skill found');
      assert.strictEqual(skill.description, 'From frontmatter');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('real skill descriptions differ from skill name', () => {
    const result = buildIndex({ rootDir: projectRoot });
    const nameOnly = result.skills.filter(s => s.description === s.name);
    assert.ok(
      nameOnly.length < result.skills.length / 2,
      `Too many skills with name-only descriptions: ${nameOnly.map(s => s.name).join(', ')}`
    );
  });
});

describe('readIndex / writeIndex', () => {
  test('round-trip read and write preserves index', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'index-test-'));
    try {
      const index = {
        $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
        version: '1.0',
        generated_at: new Date().toISOString(),
        skill_count: 0,
        skills: [],
        errors: [],
      };
      writeIndex(tmpDir, index);
      assert.deepStrictEqual(readIndex(tmpDir), index);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('readIndex returns null for missing file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'index-test-'));
    try {
      assert.strictEqual(readIndex(tmpDir), null);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('writeIndex creates directory structure', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'index-test-'));
    try {
      const index = {
        version: '1.0',
        generated_at: new Date().toISOString(),
        skill_count: 0,
        skills: [],
        errors: [],
      };
      writeIndex(tmpDir, index);
      assert.ok(fs.existsSync(path.join(tmpDir, '.well-known', 'agent-skills', 'index.json')));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
