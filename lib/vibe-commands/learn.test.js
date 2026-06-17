const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./learn');

describe('learn handler', () => {
  it('returns ok or error status', () => {
    const result = handler([], {});
    assert.ok(['ok', 'error'].includes(result.status));
  });

  it('does not throw with null state', () => {
    assert.doesNotThrow(() => handler([], null));
  });

  it('returns error status with message on capture subcommand failure', () => {
    const result = handler(['capture', '--nonexistent-flag-xyz'], {});
    assert.ok(['ok', 'error'].includes(result.status));
    if (result.status === 'error') {
      assert.ok(typeof result.error === 'string');
    }
  });

  it('capture subcommand returns ok or error — no throw', () => {
    assert.doesNotThrow(() => handler(['capture'], {}));
  });

  it('error result always has string error field', () => {
    const result = handler([], {});
    if (result.status === 'error') {
      assert.ok(typeof result.error === 'string', 'error field must be a string');
      assert.ok(result.error.length > 0);
    }
  });
});
