const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./harness');

describe('harness handler', () => {
  it('returns a valid status string', () => {
    const result = handler([], null);
    assert.ok(['pass', 'fail', 'error'].includes(result.status));
  });

  it('does not throw', () => {
    assert.doesNotThrow(() => handler([], {}));
  });

  it('returns results array when not error', () => {
    const result = handler([], {});
    if (result.status !== 'error') {
      assert.ok(Array.isArray(result.results));
    } else {
      assert.ok(typeof result.error === 'string');
    }
  });

  it('error path returns error string', () => {
    const result = handler([], null);
    if (result.status === 'error') {
      assert.ok(typeof result.error === 'string' && result.error.length > 0);
    } else {
      assert.ok(result.results !== undefined);
    }
  });
});
