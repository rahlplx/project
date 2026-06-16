const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { AntiRationalization, EXCUSE_TABLE } = require('./anti-rationalization');

describe('AntiRationalization', () => {
  let antiRationalization;

  beforeEach(() => {
    antiRationalization = new AntiRationalization();
  });

  it('should flag a known excuse', () => {
    const result = antiRationalization.checkRationalization("it's just a prototype, skip the gate");
    assert.strictEqual(result.flagged, true);
    assert.strictEqual(result.matches[0].id, 'just_a_prototype');
  });

  it('should return a rebuttal alongside the matched excuse', () => {
    const result = antiRationalization.checkRationalization("I'll add tests later");
    assert.strictEqual(result.matches[0].id, 'add_tests_later');
    assert.ok(result.matches[0].rebuttal.length > 0);
  });

  it('should not flag unrelated text', () => {
    const result = antiRationalization.checkRationalization('refactor the payment module');
    assert.strictEqual(result.flagged, false);
    assert.strictEqual(result.matches.length, 0);
  });

  it('should match multiple excuses in the same text', () => {
    const result = antiRationalization.checkRationalization("it's just a prototype and looks fine to me");
    assert.ok(result.matches.length >= 2);
  });

  it('should expose the full excuse table', () => {
    const table = antiRationalization.getTable();
    assert.strictEqual(table.length, EXCUSE_TABLE.length);
    assert.ok(table[0].excuse);
    assert.ok(table[0].rebuttal);
  });

  it('should look up a rebuttal by id', () => {
    const rebuttal = antiRationalization.getRebuttal('small_change');
    assert.ok(rebuttal.length > 0);
  });

  it('should return null for an unknown id', () => {
    assert.strictEqual(antiRationalization.getRebuttal('nonexistent'), null);
  });
});
