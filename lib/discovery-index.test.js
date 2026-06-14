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
      expect(result).toMatch(/^sha256-[a-f0-9]{64}$/);
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
      expect(computeDigest(a)).toBe(computeDigest(b));
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
      expect(computeDigest(a)).not.toBe(computeDigest(b));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('buildIndex', () => {
  test('returns correct top-level structure', () => {
    const result = buildIndex({ rootDir: projectRoot });
    expect(result).toHaveProperty('version', '1.0');
    expect(result).toHaveProperty('$schema');
    expect(result).toHaveProperty('generated_at');
    expect(() => new Date(result.generated_at)).not.toThrow();
    expect(result).toHaveProperty('skill_count');
    expect(result).toHaveProperty('skills');
    expect(Array.isArray(result.skills)).toBe(true);
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.errors)).toBe(true);
  });

  test('discovers all skills', () => {
    const result = buildIndex({ rootDir: projectRoot });
    expect(result.skill_count).toBeGreaterThanOrEqual(45);
    expect(result.skills.length).toBeGreaterThanOrEqual(45);
  });

  test('each skill has required fields', () => {
    const result = buildIndex({ rootDir: projectRoot });
    for (const skill of result.skills) {
      expect(skill).toHaveProperty('name');
      expect(skill).toHaveProperty('type', 'skill-md');
      expect(skill).toHaveProperty('category');
      expect(skill).toHaveProperty('description');
      expect(skill).toHaveProperty('url');
      expect(skill).toHaveProperty('digest');
      expect(skill.digest).toMatch(/^sha256-[a-f0-9]{64}$/);
    }
  });

  test('category is derived from directory structure', () => {
    const result = buildIndex({ rootDir: projectRoot });
    for (const skill of result.skills) {
      expect(skill.category).toMatch(/^(deploy|design|explain|knowledge|orchestration|preview|progress|quality|setup|workflow)$/);
    }
  });

  test('skills are sorted by name', () => {
    const result = buildIndex({ rootDir: projectRoot });
    const names = result.skills.map(s => s.name);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test('generated_at is ISO 8601 string', () => {
    const result = buildIndex({ rootDir: projectRoot });
    expect(new Date(result.generated_at).toISOString()).toBe(result.generated_at);
  });

  test('url follows well-known convention', () => {
    const result = buildIndex({ rootDir: projectRoot });
    for (const skill of result.skills) {
      expect(skill.url).toBe(`/.well-known/agent-skills/${skill.name}/SKILL.md`);
    }
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
        errors: []
      };
      writeIndex(tmpDir, index);
      const result = readIndex(tmpDir);
      expect(result).toEqual(index);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('readIndex returns null for missing file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'index-test-'));
    try {
      const result = readIndex(tmpDir);
      expect(result).toBeNull();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('writeIndex creates directory structure', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'index-test-'));
    try {
      const index = { version: '1.0', generated_at: new Date().toISOString(), skill_count: 0, skills: [], errors: [] };
      writeIndex(tmpDir, index);
      const indexPath = path.join(tmpDir, '.well-known', 'agent-skills', 'index.json');
      expect(fs.existsSync(indexPath)).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
