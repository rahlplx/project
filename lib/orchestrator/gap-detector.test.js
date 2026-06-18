const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { GapDetector } = require('./gap-detector');

describe('GapDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new GapDetector();
  });

  it('should return rate 1 when spec has no requirements', () => {
    const result = detector.matchRate({}, 'anything');
    assert.strictEqual(result.rate, 1);
    assert.strictEqual(result.total, 0);
  });

  it('should match requirements found in implementation', () => {
    const spec = { requirements: ['rate limiting', 'password hashing'] };
    const impl = 'this code adds rate limiting on the login endpoint';
    const result = detector.matchRate(spec, impl);
    assert.strictEqual(result.matched.length, 1);
    assert.strictEqual(result.missing.length, 1);
    assert.strictEqual(result.rate, 0.5);
  });

  it('should be case-insensitive', () => {
    const spec = { requirements: ['Rate Limiting'] };
    const impl = 'added rate limiting middleware';
    const result = detector.matchRate(spec, impl);
    assert.strictEqual(result.rate, 1);
  });

  it('should flag repair needed below threshold', () => {
    assert.strictEqual(detector.needsRepair(0.5), true);
    assert.strictEqual(detector.needsRepair(0.95), false);
  });

  it('should respect a custom threshold per call', () => {
    assert.strictEqual(detector.needsRepair(0.95, 0.99), true);
  });

  it('should build a gap report combining match rate and repair flag', () => {
    const spec = { requirements: ['a', 'b'] };
    const report = detector.buildGapReport(spec, 'has a only');
    assert.strictEqual(report.rate, 0.5);
    assert.strictEqual(report.needsRepair, true);
    assert.strictEqual(report.threshold, 0.9);
  });

  it('should mark a feasibility probe verified when evidence is given', () => {
    const probe = detector.feasibilityProbe(
      'the API supports webhooks',
      'docs confirm webhook support'
    );
    assert.strictEqual(probe.verified, true);
    assert.match(probe.recommendation, /safe to proceed/);
  });

  it('should mark a feasibility probe unverified with no evidence', () => {
    const probe = detector.feasibilityProbe('the API supports webhooks');
    assert.strictEqual(probe.verified, false);
    assert.match(probe.recommendation, /probe it/);
  });
});
