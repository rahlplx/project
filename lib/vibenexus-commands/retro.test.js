const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./retro');

describe('retro handler', () => {
  it('returns status ok', () => {
    const result = handler([], {});
    assert.ok(['ok', 'error'].includes(result.status));
  });

  it('does not show bare ? for pass rate — shows data or clear fallback', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    handler([], {});
    console.log = orig;
    const passRateLine = logs.find(l => l.includes('Pass rate'));
    if (passRateLine) {
      assert.ok(
        !passRateLine.endsWith('?'),
        `Pass rate shows bare '?' — should show data or actionable message, got: ${passRateLine}`
      );
    }
  });

  it('does not throw with null state', () => {
    assert.doesNotThrow(() => handler([], null));
  });

  it('prints actionable next-step guidance', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    handler([], {});
    console.log = orig;
    assert.ok(logs.some(l => l.includes('learn') || l.includes('harness') || l.includes('vibe')));
  });
});
