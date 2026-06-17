const { describe, it } = require('node:test');
const assert = require('node:assert');
const { Signature, ChainOfThought, SIGNATURES } = require('./chain-of-thought');

describe('Signature', () => {
  it('validates present fields', () => {
    const sig = new Signature('test', ['a', 'b'], ['c']);
    assert.deepStrictEqual(sig.validate({ a: 1, b: 2 }), { valid: true, missing: [] });
  });

  it('reports missing fields', () => {
    const sig = new Signature('test', ['a', 'b'], ['c']);
    const r = sig.validate({ a: 1 });
    assert.strictEqual(r.valid, false);
    assert.deepStrictEqual(r.missing, ['b']);
  });

  it('scaffold returns error on missing input', () => {
    const sig = new Signature('test', ['query'], ['answer']);
    const r = sig.scaffold({});
    assert.ok(r.error);
  });

  it('scaffold merges input with metadata', () => {
    const sig = new Signature('desc', ['query'], ['answer']);
    const r = sig.scaffold({ query: 'hello' });
    assert.strictEqual(r._signature, 'desc');
    assert.deepStrictEqual(r._outputFields, ['answer']);
  });
});

describe('ChainOfThought', () => {
  it('throws on non-Signature argument', () => {
    assert.throws(() => new ChainOfThought({}), TypeError);
  });

  it('returns reasoning_chain array', () => {
    const cot = new ChainOfThought(SIGNATURES.CONTEXT_ENRICH);
    const r = cot.forward({ query: 'fix auth', goal: 'build login', recentCommits: '' });
    assert.ok(Array.isArray(r.reasoning_chain));
    assert.ok(r.reasoning_chain.length >= 3);
  });

  it('includes prompt_prefix string', () => {
    const cot = new ChainOfThought(SIGNATURES.CONTEXT_ENRICH);
    const r = cot.forward({ query: 'deploy', goal: '', recentCommits: '' });
    assert.strictEqual(typeof r.prompt_prefix, 'string');
    assert.ok(r.prompt_prefix.includes('[THINK]'));
  });

  it('returns error on missing fields', () => {
    const cot = new ChainOfThought(SIGNATURES.CONTEXT_ENRICH);
    const r = cot.forward({ query: 'test' }); // missing goal, recentCommits
    assert.ok(r.error);
  });

  it('SIGNATURES object has all expected keys', () => {
    const keys = ['INTENT_CLASSIFY', 'CONTEXT_ENRICH', 'GAP_DETECT', 'TASK_DECOMPOSE', 'SECURITY_AUDIT'];
    keys.forEach(k => assert.ok(k in SIGNATURES, `Missing SIGNATURES.${k}`));
  });

  it('TASK_DECOMPOSE signature validates correctly', () => {
    const cot = new ChainOfThought(SIGNATURES.TASK_DECOMPOSE);
    const r = cot.forward({ milestone: 'build auth', constraints: 'no external deps' });
    assert.ok(Array.isArray(r.reasoning_chain));
    assert.ok(!r.error);
  });
});
