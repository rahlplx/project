const { describe, it } = require('node:test');
const assert = require('node:assert');
const { validatePhase, PHASE_ORDER, PHASE_TRANSITIONS, advancePhase } = require('./state-helpers');

describe('PHASE_ORDER', () => {
  it('is imported from state-machine (single source of truth)', () => {
    const { PHASE_ORDER: smOrder } = require('../orchestrator/state-machine');
    assert.deepStrictEqual(PHASE_ORDER, smOrder);
  });

  it('starts with think and ends with done', () => {
    assert.strictEqual(PHASE_ORDER[0], 'think');
    assert.strictEqual(PHASE_ORDER[PHASE_ORDER.length - 1], 'done');
  });

  it('contains all required pipeline phases', () => {
    const required = ['think', 'plan', 'break', 'build', 'harness', 'review', 'ship', 'retro', 'learn', 'evolve', 'done'];
    for (const p of required) {
      assert.ok(PHASE_ORDER.includes(p), `Missing phase: ${p}`);
    }
  });
});

describe('validatePhase', () => {
  const state = phase => ({ phase });

  it('allows running current phase', () => {
    const r = validatePhase('think', state('think'));
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.message, null);
  });

  it('allows running any previous phase (re-run)', () => {
    const r = validatePhase('think', state('build'));
    assert.strictEqual(r.valid, true);
  });

  it('allows advancing one step ahead', () => {
    const r = validatePhase('plan', state('think'));
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.nextPhase, 'plan');
  });

  it('warns on skip-ahead but still returns valid', () => {
    const r = validatePhase('build', state('think'));
    assert.strictEqual(r.valid, true);
    assert.ok(r.message && r.message.includes('⚠'));
  });

  it('allows backtrack with --backtrack flag', () => {
    const r = validatePhase('think', state('build'), { allowBacktrack: true });
    assert.strictEqual(r.valid, true);
    assert.ok(r.message && r.message.includes('↺'));
  });

  it('always allows done phase', () => {
    const r = validatePhase('done', state('think'));
    assert.strictEqual(r.valid, true);
  });
});

describe('advancePhase', () => {
  it('advances to explicit nextPhase', () => {
    const state = { phase: 'think', step: 0 };
    advancePhase(state, 'plan');
    assert.strictEqual(state.phase, 'plan');
    assert.strictEqual(state.step, 1);
  });

  it('advances to PHASE_TRANSITIONS default when no nextPhase given', () => {
    const state = { phase: 'think', step: 0 };
    advancePhase(state);
    assert.strictEqual(state.phase, PHASE_TRANSITIONS['think']);
  });

  it('does not advance past done', () => {
    const state = { phase: 'done', step: 10 };
    advancePhase(state);
    assert.strictEqual(state.phase, 'done');
  });
});
