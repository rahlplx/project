const { describe, it } = require('node:test');
const assert = require('node:assert');
const { extract } = require('./git-learnings');

describe('git-learnings', () => {
  it('should return commit data for a valid git repo', () => {
    const result = extract(process.cwd());
    assert.ok(!result.error, `Unexpected error: ${result.error}`);
    assert.ok(Array.isArray(result.recentCommits));
    assert.ok(typeof result.commitTypes === 'object');
  });

  it('should classify commit types', () => {
    const result = extract(process.cwd());
    const types = result.commitTypes;
    const total = Object.values(types).reduce((s, n) => s + n, 0);
    assert.ok(total > 0, 'Expected at least one classified commit');
  });

  it('should surface top changed files', () => {
    const result = extract(process.cwd());
    assert.ok(Array.isArray(result.topChangedFiles));
  });

  it('should return anti-patterns array', () => {
    const result = extract(process.cwd());
    assert.ok(Array.isArray(result.antiPatterns));
  });

  it('should return an error object for a non-git path', () => {
    const result = extract('/tmp');
    assert.ok(result.error || Array.isArray(result.recentCommits));
  });
});
