const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./evolve');

describe('evolve handler', () => {
  it('returns a valid status string', () => {
    const result = handler([], null);
    assert.ok(['ok', 'error'].includes(result.status));
  });

  it('does not throw', () => {
    assert.doesNotThrow(() => handler([], {}));
  });

  it('returns proposals array when status ok', () => {
    const result = handler([], {});
    if (result.status === 'ok') {
      assert.ok(Array.isArray(result.proposals));
    } else {
      assert.ok(typeof result.error === 'string');
    }
  });

  it('error path returns error string', () => {
    const result = handler([], null);
    if (result.status === 'error') {
      assert.ok(typeof result.error === 'string' && result.error.length > 0);
    } else {
      assert.strictEqual(result.status, 'ok');
    }
  });
});
