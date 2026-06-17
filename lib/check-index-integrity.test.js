const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { checkIndexIntegrity, formatReport } = require('./check-index-integrity');
const { buildIndex, writeIndex, computeDigest } = require('./discovery-index');

function setupTestDir(skills) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integrity-'));
  for (const [name, content] of Object.entries(skills)) {
    const parts = name.split('/');
    const filePath = path.join(tmpDir, 'skills', parts[0], parts[1], 'index.js');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
  return tmpDir;
}

const validSkillA = `class SkillA {
  constructor() { this.name = 'skill-a'; this.description = 'Skill A'; }
}
module.exports = SkillA;`;

const validSkillB = "module.exports = { name: 'skill-b', description: 'Skill B' };";

describe('checkIndexIntegrity', () => {
  test('passes when index matches on-disk skills', () => {
    const tmpDir = setupTestDir({
      'design/skill-a': validSkillA,
      'quality/skill-b': validSkillB,
    });
    try {
      const index = buildIndex({ rootDir: tmpDir });
      writeIndex(tmpDir, index);

      const result = checkIndexIntegrity({ rootDir: tmpDir });
      expect(result.pass).toBe(true);
      expect(result.errors).toHaveLength(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('fails when index is missing', () => {
    const tmpDir = setupTestDir({});
    try {
      const result = checkIndexIntegrity({ rootDir: tmpDir });
      expect(result.pass).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('missing-index');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('fails when index has fewer skills than on disk', () => {
    const tmpDir = setupTestDir({
      'design/skill-a': validSkillA,
      'quality/skill-b': validSkillB,
    });
    try {
      const index = buildIndex({ rootDir: tmpDir });
      const trimmedIndex = { ...index, skills: [index.skills[0]], skill_count: 1 };
      writeIndex(tmpDir, trimmedIndex);

      const result = checkIndexIntegrity({ rootDir: tmpDir });
      expect(result.pass).toBe(false);
      expect(result.details.missing).toContain('skill-b');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('fails when index has extra skills not on disk', () => {
    const tmpDir = setupTestDir({
      'design/skill-a': validSkillA,
    });
    try {
      const index = buildIndex({ rootDir: tmpDir });
      const inflated = {
        ...index,
        skills: [
          ...index.skills,
          {
            name: 'phantom-skill',
            type: 'skill-md',
            category: 'fake',
            description: 'Does not exist',
            url: '/.well-known/agent-skills/phantom-skill/SKILL.md',
            digest: 'sha256-' + 'a'.repeat(64),
          },
        ],
        skill_count: 2,
      };
      writeIndex(tmpDir, inflated);

      const result = checkIndexIntegrity({ rootDir: tmpDir });
      expect(result.pass).toBe(false);
      expect(result.details.extra).toContain('phantom-skill');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('fails when digest mismatch occurs', () => {
    const tmpDir = setupTestDir({
      'design/skill-a': validSkillA,
    });
    try {
      const index = buildIndex({ rootDir: tmpDir });
      const tampered = {
        ...index,
        skills: [{ ...index.skills[0], digest: 'sha256-' + 'b'.repeat(64) }],
      };
      writeIndex(tmpDir, tampered);

      const result = checkIndexIntegrity({ rootDir: tmpDir });
      expect(result.pass).toBe(false);
      expect(result.details.mismatched.length).toBe(1);
      expect(result.details.mismatched[0].name).toBe('skill-a');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('formatReport', () => {
  test('formats passing result', () => {
    const result = {
      pass: true,
      errors: [],
      warnings: [],
      details: { existing: 2, onDisk: 2, missing: [], extra: [], mismatched: [] },
    };
    const report = formatReport(result);
    expect(report).toContain('PASS');
    expect(report).toContain('2');
  });

  test('formats failing result with all error types', () => {
    const result = {
      pass: false,
      errors: [
        { type: 'missing-skills', detail: '1 skills in index: skill-b' },
        { type: 'extra-skills', detail: '1 stale entries: phantom-skill' },
        { type: 'digest-mismatch', detail: '1 digest mismatches' },
      ],
      warnings: [],
      details: {
        existing: 3,
        onDisk: 2,
        missing: ['skill-b'],
        extra: ['phantom-skill'],
        mismatched: [{ name: 'skill-a', expected: 'sha256-abc', actual: 'sha256-xyz' }],
      },
    };
    const report = formatReport(result);
    expect(report).toContain('FAIL');
    expect(report).toContain('Missing');
    expect(report).toContain('Extra');
    expect(report).toContain('Digest mismatch');
  });
});
