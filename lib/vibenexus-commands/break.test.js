const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./break');

describe('break handler', () => {
  it('returns reference status', () => {
    const result = handler([], { goal: 'build auth', phase: 'break' });
    assert.ok(result && typeof result.status === 'string');
  });

  it('does not throw with null state', () => {
    assert.doesNotThrow(() => handler([], null));
  });

  it('labels GSD commands as agent-only — not bare CLI commands', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    handler([], { goal: 'build' });
    console.log = orig;
    const gsdLines = logs.filter(l => l.includes('gsd-'));
    assert.ok(
      gsdLines.every(l => l.includes('agent') || l.includes('AI') || l.includes('via')),
      `GSD command lines lack agent qualifier: ${gsdLines.join(' | ')}`
    );
  });

  it('prints task sizing guide', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    handler([], {});
    console.log = orig;
    assert.ok(logs.some(l => l.includes('S ') || l.includes('< 1 hr')));
  });
});
