const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./telemetry');

describe('telemetry handler', () => {
  it('returns ok or error status', () => {
    const result = handler([], {});
    assert.ok(['ok', 'error'].includes(result.status));
  });

  it('does not throw with null state', () => {
    assert.doesNotThrow(() => handler([], null));
  });

  it('does not throw with custom subcommand', () => {
    assert.doesNotThrow(() => handler(['summary'], {}));
  });

  it('error result has string error field', () => {
    const result = handler([], {});
    if (result.status === 'error') {
      assert.ok(typeof result.error === 'string');
    }
  });
});
