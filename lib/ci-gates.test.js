const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { CIGates } = require('./ci-gates.js');
const path = require('path');

describe('CIGates', () => {
  const gates = new CIGates();

  describe('validateYAML', () => {
    it('returns valid for correct YAML', () => {
      const result = gates.validateYAML('name: test\nversion: 1.0');
      assert.equal(result.valid, true);
    });

    it('returns invalid for malformed YAML', () => {
      const result = gates.validateYAML('name: test\n  invalid: [');
      assert.equal(result.valid, false);
      assert.ok(result.error);
    });

    it('returns invalid for empty input', () => {
      const result = gates.validateYAML('');
      assert.equal(result.valid, false);
    });
  });

  describe('validateFileName', () => {
    it('returns valid for kebab-case files', () => {
      assert.equal(gates.validateFileName('my-skill.js').valid, true);
      assert.equal(gates.validateFileName('index.js').valid, true);
    });

    it('returns valid for test files with dots', () => {
      assert.equal(gates.validateFileName('index.test.js').valid, true);
      assert.equal(gates.validateFileName('my-skill.test.js').valid, true);
    });

    it('returns invalid for camelCase', () => {
      const result = gates.validateFileName('mySkill.js');
      assert.equal(result.valid, false);
    });
  });

  describe('validateSkillStructure', () => {
    it('returns valid for skill with SKILL.md', () => {
      const result = gates.validateSkillStructure(
        path.join(__dirname, '..', 'skills', 'quality', 'anti-patterns')
      );
      assert.equal(result.valid, true);
    });

    it('returns invalid for missing directory', () => {
      const result = gates.validateSkillStructure(
        path.join(__dirname, '..', 'skills', 'nonexistent')
      );
      assert.equal(result.valid, false);
    });
  });

  describe('runAll', () => {
    it('returns results for all gates', async () => {
      const result = await gates.runAll();
      assert.ok('yaml' in result);
      assert.ok('filenames' in result);
      assert.ok('skills' in result);
      assert.ok('passed' in result);
      assert.equal(typeof result.passed, 'boolean');
    });
  });
});
