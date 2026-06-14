const { describe, it } = require('node:test');
const assert = require('assert');
const fs = require('fs');

const AGENTS_FILES = [
  { path: 'catalog/AGENTS.md', requiredSections: ['Purpose', 'How to Add', 'Cross-Reference'] },
  { path: 'skills/AGENTS.md', requiredSections: ['Purpose', 'Structure', 'Cross-Reference'] },
  { path: 'references/AGENTS.md', requiredSections: ['Purpose', 'File Map', 'Cross-References'] },
  { path: '.vibe/AGENTS.md', requiredSections: ['Purpose', 'File Index', 'Cross-References'] },
];

describe('AGENTS.md per section', () => {
  for (const { path: filePath, requiredSections } of AGENTS_FILES) {
    it(`${filePath} exists with required sections`, () => {
      assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
      const content = fs.readFileSync(filePath, 'utf8');
      for (const section of requiredSections) {
        assert.ok(content.includes(`## ${section}`), `${filePath} should have section "${section}"`);
      }
    });
  }
});
