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

  test('skill-originality check exists and passes', () => {
    const check = results.find(r => r.check === 'skill-originality');
    expect(check).toBeDefined();
    expect(check.pass).toBe(true);
    expect(check.data.files).toBeGreaterThanOrEqual(47);
    expect(check.data.worst).toBeGreaterThanOrEqual(0);
  });

  test('skill-lint check exists and passes', () => {
    const check = results.find(r => r.check === 'skill-lint');
    expect(check).toBeDefined();
    expect(check.pass).toBe(true);
    expect(check.data.files).toBeGreaterThanOrEqual(47);
  });

  test('index-json-integrity check exists and reports data', () => {
    const check = results.find(r => r.check === 'index-json-integrity');
    expect(check).toBeDefined();
    expect(check.data.existing).toBeGreaterThanOrEqual(47);
    expect(check.data.onDisk).toBeGreaterThanOrEqual(47);
  });

  test('quality-scores check exists and reports data', () => {
    const check = results.find(r => r.check === 'quality-scores');
    expect(check).toBeDefined();
    expect(check.data.toolCount).toBeGreaterThanOrEqual(35);
    expect(typeof check.data.dCount).toBe('number');
  });

  test('security-scan check exists and reports data', () => {
    const check = results.find(r => r.check === 'security-scan');
    expect(check).toBeDefined();
    expect(check.data.skillsScanned).toBeGreaterThanOrEqual(47);
  });

  test('spec-gates check exists', () => {
    const check = results.find(r => r.check === 'spec-gates');
    expect(check).toBeDefined();
    expect(check.data.gates).toBeGreaterThanOrEqual(14);
  });

  test('node-test-suite check exists (skipped in test mode)', () => {
    const check = results.find(r => r.check === 'node-test-suite');
    expect(check).toBeDefined();
    expect(check.data.skipped).toBe(true);
  });

  test('all 18 harness checks are present', () => {
    const expected = [
      'catalog-yaml-valid',
      'catalog-category-count',
      'handoff-templates',
      'phase-gates-doc',
      'test-suite',
      'skill-originality',
      'skill-lint',
      'index-json-integrity',
      'agents-md-exists',
      'quality-scores',
      'security-scan',
      'spec-gates',
      'node-test-suite',
      'coverage-gate',
      'eslint-lint-pass',
      'typecheck-gate',
      'tools-discovered-count',
      'state-machine-valid',
      'enricher-smoke',
    ];
    const checkNames = results.map(r => r.check);
    expected.forEach(e => expect(checkNames).toContain(e));
    expect(results.length).toBe(19);
  });
});
