const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./plan');

describe('plan handler', () => {
  it('returns reference status with empty state', () => {
    const result = handler([], {});
    assert.strictEqual(result.status, 'reference');
  });

  it('includes mode name in result', () => {
    const result = handler([], { projectType: 'saas' });
    assert.ok(typeof result.mode === 'string' && result.mode.length > 0);
  });

  it('accepts undefined projectType without throwing', () => {
    assert.doesNotThrow(() => handler([], {}));
  });

  it('accepts projectType arg', () => {
    const result = handler([], { projectType: 'api' });
    assert.ok(result && typeof result.status === 'string');
  });
});
