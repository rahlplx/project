const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./done');

describe('done handler', () => {
  it('returns status done with null state', () => {
    const result = handler([], null);
    assert.strictEqual(result.status, 'done');
  });

  it('returns status done with valid state', () => {
    const result = handler([], { goal: 'ship product', phase: 'done' });
    assert.strictEqual(result.status, 'done');
  });

  it('prints goal from state', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    handler([], { goal: 'my project goal' });
    console.log = orig;
    assert.ok(logs.some(l => l.includes('my project goal')));
  });

  it('does not throw with empty state', () => {
    assert.doesNotThrow(() => handler([], {}));
  });
});
