const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { TrustLevel, LEVELS, RISK_TIERS } = require('./trust-level');

describe('TrustLevel', () => {
  let trustLevel;

  beforeEach(() => {
    trustLevel = new TrustLevel();
  });

  it('should default to level 1 (Guided)', () => {
    assert.strictEqual(trustLevel.getLevel().name, 'Guided');
  });

  it('should reject unknown levels', () => {
    assert.throws(() => new TrustLevel(99));
  });

  it('should allow setting a valid level', () => {
    trustLevel.setLevel(3);
    assert.strictEqual(trustLevel.getLevel().name, 'Autonomous');
  });

  it('should require confirmation for everything at level 0', () => {
    trustLevel.setLevel(0);
    for (const tier of RISK_TIERS) {
      assert.strictEqual(trustLevel.requiresConfirmation(tier), true);
    }
  });

  it('should auto-execute local-reversible at level 1 but not shared-state', () => {
    trustLevel.setLevel(1);
    assert.strictEqual(trustLevel.requiresConfirmation('local-reversible'), false);
    assert.strictEqual(trustLevel.requiresConfirmation('shared-state'), true);
  });

  it('should still require confirmation for irreversible-external at level 4', () => {
    trustLevel.setLevel(4);
    assert.strictEqual(trustLevel.requiresConfirmation('irreversible-external'), true);
    assert.strictEqual(trustLevel.requiresConfirmation('destructive'), false);
  });

  it('should reject unknown risk tiers', () => {
    assert.throws(() => trustLevel.requiresConfirmation('not-a-tier'));
  });

  it('should describe the current level as a readable string', () => {
    assert.match(trustLevel.describe(), /Trust Level 1 \(Guided\)/);
  });

  it('should list all levels', () => {
    const all = TrustLevel.getAllLevels();
    assert.strictEqual(all.length, Object.keys(LEVELS).length);
  });

  it('should list all risk tiers', () => {
    assert.deepStrictEqual(TrustLevel.getRiskTiers(), RISK_TIERS);
  });
});
