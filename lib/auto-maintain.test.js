const { runHarness } = require('../.vibe/lifecycle/auto-maintain.js');

describe('auto-maintain harness checks', () => {
  let results;

  beforeAll(() => {
    results = runHarness(false);
  });

  test('handoff-templates check exists and passes', () => {
    const check = results.find(r => r.check === 'handoff-templates');
    expect(check).toBeDefined();
    expect(check.pass).toBe(true);
    expect(check.data.total).toBe(8);
    expect(check.data.missing).toEqual([]);
  });

  test('phase-gates-doc check exists and passes', () => {
    const check = results.find(r => r.check === 'phase-gates-doc');
    expect(check).toBeDefined();
    expect(check.pass).toBe(true);
    expect(check.data.size).toBeGreaterThan(1000);
  });

  test('all 5 harness checks are present', () => {
    const expected = [
      'catalog-yaml-valid',
      'catalog-category-count',
      'handoff-templates',
      'phase-gates-doc',
      'test-suite'
    ];
    const checkNames = results.map(r => r.check);
    expected.forEach(e => expect(checkNames).toContain(e));
    expect(results.length).toBe(5);
  });
});
