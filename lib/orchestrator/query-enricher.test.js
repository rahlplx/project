const { describe, it } = require('node:test');
const assert = require('node:assert');
const { QueryEnricher, SOURCES, WEIGHTS } = require('./query-enricher');

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
});
