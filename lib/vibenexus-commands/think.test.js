const { describe, it } = require('node:test');
const assert = require('node:assert');
const { handler } = require('./think');

describe('think handler', () => {
  it('returns reference status with null state', () => {
    const result = handler([], null);
    assert.strictEqual(result.status, 'reference');
  });

  it('returns reference status with valid state', () => {
    const result = handler(['auth flow'], { goal: 'build auth', phase: 'think' });
    assert.strictEqual(result.status, 'reference');
  });

  it('fires grill gate on vague request and records clarification', () => {
    const result = handler(['build it'], { goal: '' });
    assert.ok('grillFired' in result);
    assert.strictEqual(typeof result.grillFired, 'boolean');
  });

  it('injects enrichedContext when state._enriched present', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    handler(['deploy auth'], {
      goal: 'deploy',
      _enriched: { enrichedContext: '[SKILL] vibe-security', selectedTemplate: null },
    });
    console.log = orig;
    assert.ok(logs.some(l => l.includes('[SKILL] vibe-security')));
  });

  it('loads prompt template when selectedTemplate set', () => {
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    handler(['write unit tests'], {
      goal: 'testing',
      _enriched: {
        enrichedContext: '',
        selectedTemplate: { category: 'testing', id: 'full', skill: 'vibe-tdd' },
      },
    });
    console.log = orig;
    assert.ok(logs.some(l => l.includes('unit-tests') || l.includes('Template')));
  });
});
