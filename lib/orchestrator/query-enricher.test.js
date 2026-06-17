const { describe, it } = require('node:test');
const assert = require('node:assert');
const { QueryEnricher, SOURCES, WEIGHTS, SKILL_TO_TEMPLATE } = require('./query-enricher');

describe('QueryEnricher', () => {
  it('returns empty result for null/empty query', () => {
    const qe = new QueryEnricher();
    const r = qe.enrich(null);
    assert.strictEqual(r.confidence, 0);
    assert.strictEqual(r.label, 'low');
    assert.deepStrictEqual(r.skills, []);
  });

  it('routes auth query to vibe-security + vibe-tdd', () => {
    const qe = new QueryEnricher();
    const r = qe.enrich('fix the login authentication flow');
    assert.ok(r.skills.includes('vibe-security') || r.skills.includes('vibe-tdd'));
  });

  it('always includes chain-of-thought source', () => {
    const qe = new QueryEnricher();
    const r = qe.enrich('help me build something');
    const cot = r.sources.find(s => s.type === SOURCES.CHAIN_OF_THOUGHT);
    assert.ok(cot, 'CoT source should always be present');
    assert.ok(Array.isArray(cot.data.reasoning_chain));
  });

  it('enrichedContext is a string', () => {
    const qe = new QueryEnricher();
    const r = qe.enrich('deploy my app to production');
    assert.strictEqual(typeof r.enrichedContext, 'string');
  });

  it('confidence is between 0 and 1', () => {
    const qe = new QueryEnricher();
    const r = qe.enrich('add payment processing with stripe');
    assert.ok(r.confidence >= 0 && r.confidence <= 1);
  });

  it('label reflects confidence level', () => {
    const qe = new QueryEnricher();
    const r = qe.enrich('fix the login authentication and payment flow');
    assert.ok(['high', 'medium', 'low'].includes(r.label));
  });

  it('WEIGHTS sum to 1.0', () => {
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 1.0) < 0.001);
  });

  it('degrades gracefully with bad projectRoot', () => {
    const qe = new QueryEnricher('/nonexistent/path');
    assert.doesNotThrow(() => qe.enrich('build something'));
  });

  it('TTLCache: second call with same query returns cached result (same reference)', () => {
    const qe = new QueryEnricher();
    const query = `ttlcache-test-${Date.now()}`;
    const first = qe.enrich(query);
    const second = qe.enrich(query);
    // Same object reference proves the cache was hit, not recomputed
    assert.strictEqual(first, second, 'expected cache hit to return identical reference');
  });

  it('TTLCache: different queries produce independent results', () => {
    const qe = new QueryEnricher();
    const ts = Date.now();
    const a = qe.enrich(`unique-query-alpha-${ts}`);
    const b = qe.enrich(`unique-query-beta-${ts}`);
    assert.notStrictEqual(a, b, 'different queries must not share a cached result');
  });

  it('result always contains selectedTemplate field', () => {
    const qe = new QueryEnricher();
    const r = qe.enrich('build something');
    assert.ok('selectedTemplate' in r, 'selectedTemplate must be present');
  });

  it('empty result has selectedTemplate: null', () => {
    const qe = new QueryEnricher();
    const r = qe.enrich(null);
    assert.strictEqual(r.selectedTemplate, null);
  });

  it('enrich accepts parentSpan option without throwing', () => {
    const qe = new QueryEnricher();
    const fakeSpan = { traceId: 'abc123', spanId: 'def456' };
    assert.doesNotThrow(() => qe.enrich('deploy to production', { parentSpan: fakeSpan }));
  });
});

describe('QueryEnricher._selectTemplate', () => {
  it('returns full level at confidence >= 0.6', () => {
    const qe = new QueryEnricher();
    const result = qe._selectTemplate(['vibe-tdd'], 0.65);
    assert.ok(result, 'should return a template');
    assert.strictEqual(result.id, 'full');
    assert.strictEqual(result.category, 'testing');
  });

  it('returns medium level at confidence 0.35–0.59', () => {
    const qe = new QueryEnricher();
    const result = qe._selectTemplate(['vibe-security'], 0.45);
    assert.ok(result);
    assert.strictEqual(result.id, 'medium');
    assert.strictEqual(result.category, 'security');
  });

  it('returns minimal level at confidence < 0.35', () => {
    const qe = new QueryEnricher();
    const result = qe._selectTemplate(['vibe-deploy'], 0.2);
    assert.ok(result);
    assert.strictEqual(result.id, 'minimal');
    assert.strictEqual(result.category, 'devops');
  });

  it('returns null when no skill matches SKILL_TO_TEMPLATE', () => {
    const qe = new QueryEnricher();
    const result = qe._selectTemplate(['unknown-skill'], 0.8);
    assert.strictEqual(result, null);
  });

  it('returns null for empty skills array', () => {
    const qe = new QueryEnricher();
    assert.strictEqual(qe._selectTemplate([], 0.9), null);
  });

  it('picks first matching skill from array', () => {
    const qe = new QueryEnricher();
    const result = qe._selectTemplate(['unknown-skill', 'vibe-review'], 0.7);
    assert.ok(result);
    assert.strictEqual(result.category, 'refactor');
    assert.strictEqual(result.skill, 'vibe-review');
  });
});

describe('SKILL_TO_TEMPLATE', () => {
  it('exports a non-empty map', () => {
    assert.ok(typeof SKILL_TO_TEMPLATE === 'object');
    assert.ok(Object.keys(SKILL_TO_TEMPLATE).length > 0);
  });

  it('maps vibe-tdd to testing category', () => {
    assert.strictEqual(SKILL_TO_TEMPLATE['vibe-tdd'], 'testing');
  });

  it('maps vibe-security to security category', () => {
    assert.strictEqual(SKILL_TO_TEMPLATE['vibe-security'], 'security');
  });

  it('maps vibe-plan to ai-agent category', () => {
    assert.strictEqual(SKILL_TO_TEMPLATE['vibe-plan'], 'ai-agent');
  });

  it('all keys use vibe-* namespace matching SkillRouter output', () => {
    const nonVibeKeys = Object.keys(SKILL_TO_TEMPLATE).filter(k => !k.startsWith('vibe-'));
    assert.deepStrictEqual(nonVibeKeys, [], 'all keys must start with vibe-');
  });
});
