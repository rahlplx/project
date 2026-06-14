const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const TELEMETRY_DIR = path.resolve(__dirname, '..', '.vibe', 'telemetry');
const SESSIONS_DIR = path.join(TELEMETRY_DIR, 'sessions');
const PHASE_TIMING_PATH = path.join(TELEMETRY_DIR, 'phase-timing.json');
const ERROR_TRENDS_PATH = path.join(TELEMETRY_DIR, 'error-trends.json');

const hasPhaseTiming = fs.existsSync(PHASE_TIMING_PATH);
const hasErrorTrends = fs.existsSync(ERROR_TRENDS_PATH);

describe('telemetry-aggregate', () => {
  const { aggregatePhaseTiming, aggregateErrors, detectStuckPhases, detectTrends, generateCrossProjectTrends } = require('../lib/telemetry-aggregate');

  it('aggregatePhaseTiming returns object', () => {
    const result = aggregatePhaseTiming();
    assert.strictEqual(typeof result, 'object');
    if (hasPhaseTiming) {
      assert(Object.keys(result).length > 0);
    }
  });

  it('aggregateErrors returns object with total and byCategory', () => {
    const result = aggregateErrors();
    assert.strictEqual(typeof result, 'object');
    assert.strictEqual(typeof result.total, 'number');
    assert.strictEqual(typeof result.byCategory, 'object');
  });

  it('detectStuckPhases returns array', () => {
    const result = detectStuckPhases();
    assert(Array.isArray(result));
  });

  it('detectTrends returns object', () => {
    const result = detectTrends();
    assert.strictEqual(typeof result, 'object');
  });

  it('detectStuckPhases filters by threshold', () => {
    const result = detectStuckPhases(1000);
    assert(Array.isArray(result));
  });

  it('generateCrossProjectTrends returns null or object with suggestions', () => {
    const result = generateCrossProjectTrends();
    if (result === null) {
      assert.strictEqual(result, null);
    } else {
      assert.strictEqual(typeof result, 'object');
      assert.ok(Array.isArray(result.suggestions));
      assert.strictEqual(typeof result.totalSessions, 'number');
    }
  });
});

describe('telemetry-status', () => {
  const { getTelemetryEnabled, getSessionCount, formatDuration, detectCompactionSignals, getHarnessSummary, getLatestSession } = require('../lib/telemetry-status');

  it('getTelemetryEnabled returns boolean', () => {
    const result = getTelemetryEnabled();
    assert.strictEqual(typeof result, 'boolean');
  });

  it('getSessionCount returns number', () => {
    const result = getSessionCount();
    assert.strictEqual(typeof result, 'number');
    assert(result >= 0);
  });

  it('formatDuration formats milliseconds', () => {
    assert.strictEqual(formatDuration(500), '500ms');
    assert.strictEqual(formatDuration(1500), '1.5s');
    assert.strictEqual(formatDuration(90000), '1m 30s');
    assert.strictEqual(formatDuration(3661000), '1h 1m');
  });

  it('detectCompactionSignals returns array', () => {
    const result = detectCompactionSignals();
    assert(Array.isArray(result));
  });

  it('getHarnessSummary returns null or object', () => {
    const result = getHarnessSummary();
    if (result === null) {
      assert.strictEqual(result, null);
    } else {
      assert.strictEqual(typeof result.checksRun, 'number');
      assert.strictEqual(typeof result.checksPassed, 'number');
    }
  });

  it('getLatestSession returns null or object', () => {
    const result = getLatestSession();
    if (result === null) {
      assert.strictEqual(result, null);
    } else {
      assert.strictEqual(typeof result, 'object');
    }
  });
});
