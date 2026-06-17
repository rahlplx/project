const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { writeIndex, readIndex, buildIndex } = require('./discovery-index');

describe('writeIndex regression', () => {
  it('single-arg writeIndex(root) writes a non-empty index', () => {
    // Regression: writeIndex(root) with no index arg previously wrote undefined → 0 entries
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wi-regression-'));
    try {
      const skillDir = path.join(tmpDir, 'skills', 'quality', 'test-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(
        path.join(skillDir, 'index.js'),
        'module.exports = { name: "test-skill", description: "Test skill" };'
      );
      writeIndex(tmpDir);
      const result = readIndex(tmpDir);
      assert.ok(result !== null, 'readIndex should return non-null after writeIndex');
      assert.ok(result.skills.length > 0, 'index should contain discovered skills');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('writeIndex(root, index) still works with explicit index arg', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wi-explicit-'));
    try {
      const index = buildIndex({ rootDir: path.resolve(__dirname, '..') });
      writeIndex(tmpDir, index);
      const result = readIndex(tmpDir);
      assert.deepStrictEqual(result, index);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
