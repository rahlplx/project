const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./review');

describe('review handler', () => {
  it('returns reference status with null state', () => {
    const result = handler([], null);
    assert.strictEqual(result.status, 'reference');
  });

  it('returns reference status with valid state', () => {
    const result = handler([], { goal: 'review auth code', phase: 'review' });
    assert.strictEqual(result.status, 'reference');
  });

  it('does not throw with empty args', () => {
    assert.doesNotThrow(() => handler([], {}));
  });

  it('prints OWASP mention in output', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    handler([], {});
    console.log = orig;
    assert.ok(logs.some(l => l.toLowerCase().includes('security') || l.toLowerCase().includes('owasp')));
  });
});
