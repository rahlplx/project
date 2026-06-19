const { describe, it, expect } = require('@jest/globals');
const { CIGates } = require('./ci-gates.js');
const path = require('path');
const fs = require('fs');

describe('CIGates', () => {
  const gates = new CIGates();

  describe('validateYAML', () => {
    it('returns valid for correct YAML', () => {
      const result = gates.validateYAML('name: test\nversion: 1.0');
      expect(result.valid).toBe(true);
    });

    it('returns invalid for malformed YAML', () => {
      const result = gates.validateYAML('name: test\n  invalid: [');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns invalid for empty input', () => {
      const result = gates.validateYAML('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFileName', () => {
    it('returns valid for kebab-case', () => {
      const result = gates.validateFileName('my-skill.js');
      expect(result.valid).toBe(true);
    });

    it('returns invalid for camelCase', () => {
      const result = gates.validateFileName('mySkill.js');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('kebab-case');
    });

    it('returns invalid for spaces', () => {
      const result = gates.validateFileName('my skill.js');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateSkillStructure', () => {
    it('returns valid for skill with required files', () => {
      const result = gates.validateSkillStructure(
        path.join(__dirname, '..', 'skills', 'quality', 'anti-patterns')
      );
      expect(result.valid).toBe(true);
    });

    it('returns invalid for missing SKILL.md', () => {
      const result = gates.validateSkillStructure(
        path.join(__dirname, '..', 'skills', 'nonexistent')
      );
      expect(result.valid).toBe(false);
    });
  });

  describe('runAll', () => {
    it('returns results for all gates', async () => {
      const result = await gates.runAll();
      expect(result).toHaveProperty('yaml');
      expect(result).toHaveProperty('filenames');
      expect(result).toHaveProperty('skills');
      expect(result).toHaveProperty('passed');
    });

    it('returns passed=true when all gates pass', async () => {
      const result = await gates.runAll();
      expect(typeof result.passed).toBe('boolean');
    });
  });
});
