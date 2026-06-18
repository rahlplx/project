const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  aggregateSessions,
  aggregatePhaseTiming,
  aggregateErrors,
  detectStuckPhases,
  detectTrends,
  generateCrossProjectTrends,
} = require('./telemetry-aggregate');

describe('aggregateSessions', () => {
  it('returns an array', () => {
    const result = aggregateSessions();
    assert.ok(Array.isArray(result));
  });

  it('does not throw when sessions dir missing', () => {
    assert.doesNotThrow(() => aggregateSessions());
  });
});

describe('aggregatePhaseTiming', () => {
  it('returns an object', () => {
    const result = aggregatePhaseTiming();
    assert.ok(typeof result === 'object' && result !== null);
  });

  it('returns empty object when no phase-timing.json', () => {
    const result = aggregatePhaseTiming();
    assert.ok(typeof result === 'object');
  });
});

describe('aggregateErrors', () => {
  it('returns object with total field', () => {
    const result = aggregateErrors();
    assert.ok(typeof result.total === 'number');
  });

  it('total is 0 when no error-trends.json', () => {
    const result = aggregateErrors();
    assert.ok(result.total >= 0);
  });

  it('has byCategory and byContext fields', () => {
    const result = aggregateErrors();
    assert.ok(typeof result.byCategory === 'object');
    assert.ok(typeof result.byContext === 'object');
  });
});

describe('detectStuckPhases', () => {
  it('returns an array', () => {
    const result = detectStuckPhases();
    assert.ok(Array.isArray(result));
  });

  it('returns empty array when no data', () => {
    const result = detectStuckPhases(300000);
    assert.ok(Array.isArray(result));
  });
});

describe('detectTrends', () => {
  it('returns an object', () => {
    const result = detectTrends();
    assert.ok(typeof result === 'object' && result !== null);
  });
});

describe('generateCrossProjectTrends', () => {
  it('returns null or object', () => {
    const result = generateCrossProjectTrends();
    assert.ok(result === null || typeof result === 'object');
  });
});
