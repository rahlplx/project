const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./status');

describe('status handler', () => {
  it('returns ok status', () => {
    const result = handler([], {});
    assert.strictEqual(result.status, 'ok');
  });

  it('does not throw with null state', () => {
    assert.doesNotThrow(() => handler([], null));
  });

  it('result contains info object', () => {
    const result = handler([], {});
    assert.ok(result.info && typeof result.info === 'object');
  });

  it('info has phase and version fields', () => {
    const result = handler([], {});
    assert.ok(typeof result.info.phase === 'string');
    assert.ok(typeof result.info.version === 'string');
  });

  it('prints pipeline sequence in output', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    try {
      handler([], {});
    } finally {
      console.log = orig;
    }
    assert.ok(logs.some(l => l.includes('→') || l.includes('Pipeline')));
  });
});
