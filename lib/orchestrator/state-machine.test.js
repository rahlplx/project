const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { StateMachine, PHASES, LAYERS } = require('./state-machine');

describe('StateMachine', () => {
  let stateMachine;

  beforeEach(() => {
    stateMachine = new StateMachine();
  });

  it('should initialize with default state', () => {
    const state = stateMachine.loadState();
    assert.ok('phase' in state);
    assert.ok('step' in state);
    assert.ok('mode' in state);
  });

  it('should get current phase', () => {
    const phase = stateMachine.getCurrentPhase();
    assert.strictEqual(typeof phase, 'string');
  });

  it('should get phase info', () => {
    const phaseInfo = stateMachine.getPhaseInfo('think');
    assert.strictEqual(phaseInfo.name, 'think');
    assert.strictEqual(phaseInfo.source, 'gstack');
    assert.ok(Array.isArray(phaseInfo.roles));
  });

  it('should get layer for phase', () => {
    const layer = stateMachine.getLayerForPhase('think');
    assert.strictEqual(layer.name, 'Strategy');
    assert.strictEqual(layer.color, 'blue');
  });

  it('should validate phase transitions', () => {
    assert.strictEqual(stateMachine.canTransition('think', 'plan'), true);
    assert.strictEqual(stateMachine.canTransition('think', 'build'), false);
  });

  it('should get roles for phase', () => {
    const roles = stateMachine.getRolesForPhase('think');
    assert.ok(roles.includes('CEO'));
    assert.ok(roles.includes('Designer'));
  });

  it('should get progress', () => {
    const progress = stateMachine.getProgress();
    assert.ok('current' in progress);
    assert.ok('total' in progress);
    assert.ok('percentage' in progress);
  });
});

describe('PHASES', () => {
  it('should have all required phases', () => {
    const phaseNames = PHASES.map(p => p.name);
    assert.ok(phaseNames.includes('think'));
    assert.ok(phaseNames.includes('plan'));
    assert.ok(phaseNames.includes('break'));
    assert.ok(phaseNames.includes('build'));
    assert.ok(phaseNames.includes('harness'));
    assert.ok(phaseNames.includes('review'));
    assert.ok(phaseNames.includes('ship'));
    assert.ok(phaseNames.includes('retro'));
  });

  it('should have source for each phase', () => {
    PHASES.forEach(phase => {
      assert.ok('source' in phase);
      assert.strictEqual(typeof phase.source, 'string');
    });
  });

  it('should have roles for each phase', () => {
    PHASES.forEach(phase => {
      assert.ok('roles' in phase);
      assert.ok(Array.isArray(phase.roles));
    });
  });
});

describe('LAYERS', () => {
  it('should have all required layers', () => {
    assert.ok('strategy' in LAYERS);
    assert.ok('foundation' in LAYERS);
    assert.ok('planning' in LAYERS);
    assert.ok('execution' in LAYERS);
    assert.ok('validation' in LAYERS);
    assert.ok('delivery' in LAYERS);
    assert.ok('learning' in LAYERS);
    assert.ok('complete' in LAYERS);
  });

  it('should have name and color for each layer', () => {
    Object.values(LAYERS).forEach(layer => {
      assert.ok('name' in layer);
      assert.ok('color' in layer);
    });
  });
});
