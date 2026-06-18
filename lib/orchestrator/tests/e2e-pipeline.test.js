const assert = require('node:assert');
const { test, describe } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { StateMachine } = require('../state-machine');

describe('E2E Pipeline Audit', () => {
  test('Full Think-to-Done transition cycle', () => {
    const sm = new StateMachine();
    const phases = [
      'think', 'plan', 'break', 'build', 'harness', 'review', 'ship', 'retro', 'learn', 'evolve', 'done'
    ];

    // Reset to start
    sm.state.phase = 'think';
    sm.state.step = 0;
    sm.state.completed = [];

    for (let i = 0; i < phases.length - 1; i++) {
      const current = phases[i];
      const next = phases[i+1];

      assert.strictEqual(sm.getCurrentPhase(), current, `Should be in ${current} phase`);
      sm.transition(next);
      assert.strictEqual(sm.getCurrentPhase(), next, `Should transition to ${next} phase`);
    }

    assert.strictEqual(sm.getCurrentPhase(), 'done');
    assert.ok(sm.state.completed.length >= 10);
  });

  test('Layer transition requires handoff', () => {
    const sm = new StateMachine();

    // Strategy -> Planning (think -> break)
    assert.ok(sm.needsHandoff('think', 'break'), 'think -> break should need handoff (Strategy -> Planning)');

    // Within Strategy (think -> plan)
    assert.ok(!sm.needsHandoff('think', 'plan'), 'think -> plan should NOT need handoff (same layer)');
  });
});
