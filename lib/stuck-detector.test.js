const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { checkStuck, getStuckAlerts, setTelemetryDir, trackPhase } = require('./stuck-detector');

function withIsolatedDir(fn) {
  return () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sd-'));
    const telemetryDir = path.join(tmpDir, 'telemetry');
    fs.mkdirSync(telemetryDir, { recursive: true });
    setTelemetryDir(telemetryDir);
    try {
      fn(telemetryDir);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  };
}

describe('stuck-detector', () => {
  it('not stuck at 3 consecutive cycles', () => {
    const history = [{ phase: 'build' }, { phase: 'build' }, { phase: 'build' }];
    const result = checkStuck('build', history);
    assert.strictEqual(result.isStuck, false);
    assert.strictEqual(result.consecutiveCycles, 3);
    assert.strictEqual(result.alert, null);
  });

  it('stuck at 4 consecutive cycles', () => {
    const history = [
      { phase: 'build' },
      { phase: 'build' },
      { phase: 'build' },
      { phase: 'build' },
    ];
    const result = checkStuck('build', history);
    assert.strictEqual(result.isStuck, true);
    assert.strictEqual(result.consecutiveCycles, 4);
    assert.ok(result.alert !== null);
  });

  it('stuck at 5+ consecutive cycles', () => {
    const history = [
      { phase: 'test' },
      { phase: 'test' },
      { phase: 'test' },
      { phase: 'test' },
      { phase: 'test' },
    ];
    const result = checkStuck('test', history);
    assert.strictEqual(result.isStuck, true);
    assert.strictEqual(result.consecutiveCycles, 5);
  });

  it('interleaved patterns are not stuck', () => {
    const history = [
      { phase: 'build' },
      { phase: 'test' },
      { phase: 'build' },
      { phase: 'test' },
      { phase: 'build' },
    ];
    const result = checkStuck('build', history);
    assert.strictEqual(result.isStuck, false);
    assert.strictEqual(result.consecutiveCycles, 1);
  });

  it('explicit history param is used', () => {
    const history = [
      { phase: 'stuck-phase' },
      { phase: 'stuck-phase' },
      { phase: 'stuck-phase' },
      { phase: 'stuck-phase' },
    ];
    const result = checkStuck('stuck-phase', history);
    assert.strictEqual(result.isStuck, true);
    assert.strictEqual(result.consecutiveCycles, 4);
  });

  it(
    'checkStuck reads from file when no history given',
    withIsolatedDir(dir => {
      trackPhase('review');
      trackPhase('review');
      trackPhase('review');
      trackPhase('review');
      const result = checkStuck('review');
      assert.strictEqual(result.isStuck, true);
      assert.strictEqual(result.consecutiveCycles, 4);
    })
  );

  it('alert message format is descriptive', () => {
    const history = [
      { phase: 'alert-test' },
      { phase: 'alert-test' },
      { phase: 'alert-test' },
      { phase: 'alert-test' },
    ];
    const result = checkStuck('alert-test', history);
    assert.ok(result.alert.includes('alert-test'));
    assert.ok(result.alert.includes('4'));
  });

  it(
    'getStuckAlerts returns empty when none stuck',
    withIsolatedDir(dir => {
      trackPhase('fast-phase');
      const alerts = getStuckAlerts();
      assert.ok(Array.isArray(alerts.alerts));
      assert.strictEqual(alerts.totalStuck, 0);
    })
  );

  it(
    'getStuckAlerts detects multiple stuck phases',
    withIsolatedDir(dir => {
      for (let i = 0; i < 4; i++) trackPhase('multi-stuck-a');
      for (let i = 0; i < 4; i++) trackPhase('multi-stuck-b');

      const alerts = getStuckAlerts();
      const stuckPhases = alerts.alerts.map(a => a.phase);
      assert.ok(stuckPhases.includes('multi-stuck-a'));
      assert.ok(stuckPhases.includes('multi-stuck-b'));
      assert.strictEqual(alerts.totalStuck, 2);
    })
  );
});
