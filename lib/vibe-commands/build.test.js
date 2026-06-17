const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./build');

describe('build handler', () => {
  it('returns status with null state', () => {
    const result = handler([], null);
    assert.ok(result && typeof result.status === 'string');
  });

  it('returns status with valid state', () => {
    const result = handler([], { goal: 'build auth', phase: 'build' });
    assert.ok(result && typeof result.status === 'string');
  });

  it('accepts task filter arg', () => {
    const result = handler(['auth-service'], { goal: 'build auth' });
    assert.ok(result && typeof result.status === 'string');
  });

  it('does not throw when breakdown.md absent', () => {
    assert.doesNotThrow(() => handler([], { goal: 'build' }));
  });
});
