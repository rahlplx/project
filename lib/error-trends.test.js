const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { recordError, getErrorTrends, getErrorSummary, setTelemetryDir } = require('./error-trends');

function withIsolatedDir(fn) {
  return () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'et-'));
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

describe('error-trends', () => {
  it(
    'creates file on first call',
    withIsolatedDir(dir => {
      recordError('first-call', new Error('something broke'));
      const file = path.join(dir, 'error-trends.json');
      assert.ok(fs.existsSync(file));
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
      assert.strictEqual(raw.version, '1.0.0');
      assert.strictEqual(raw.errors.length, 1);
    })
  );

  it(
    'appends errors',
    withIsolatedDir(dir => {
      recordError('first-call', new Error('one'));
      recordError('second-call', new Error('two'));
      const file = path.join(dir, 'error-trends.json');
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
      assert.strictEqual(raw.errors.length, 2);
    })
  );

  it(
    'categorizes system errors (ENOENT)',
    withIsolatedDir(dir => {
      recordError('fs-op', Object.assign(new Error('file not found'), { code: 'ENOENT' }));
      const trends = getErrorTrends();
      assert.strictEqual(trends.byCategory.system, 1);
    })
  );

  it(
    'categorizes system errors (EINVAL)',
    withIsolatedDir(dir => {
      recordError('fs-op', Object.assign(new Error('invalid argument'), { code: 'EINVAL' }));
      const trends = getErrorTrends();
      assert.strictEqual(trends.byCategory.system, 1);
    })
  );

  it(
    'categorizes harness errors (catalog-*)',
    withIsolatedDir(dir => {
      recordError('catalog-loader', new Error('failed to load'));
      const trends = getErrorTrends();
      assert.strictEqual(trends.byCategory.harness, 1);
    })
  );

  it(
    'categorizes timeout errors',
    withIsolatedDir(dir => {
      recordError('network', new Error('operation timed out'));
      const trends = getErrorTrends();
      assert.strictEqual(trends.byCategory.timeout, 1);
    })
  );

  it(
    'categorizes syntax errors',
    withIsolatedDir(dir => {
      recordError('parser', new SyntaxError('unexpected token'));
      const trends = getErrorTrends();
      assert.strictEqual(trends.byCategory.syntax, 1);
    })
  );

  it(
    'categorizes test errors',
    withIsolatedDir(dir => {
      recordError('test-suite', new Error('test failed'));
      const trends = getErrorTrends();
      assert.strictEqual(trends.byCategory.test, 1);
    })
  );

  it(
    'categorizes unknown errors',
    withIsolatedDir(dir => {
      recordError('weird-module', new Error('something strange'));
      const trends = getErrorTrends();
      assert.strictEqual(trends.byCategory.unknown, 1);
    })
  );

  it(
    'handles Error objects and string messages',
    withIsolatedDir(dir => {
      recordError('string-test', 'plain string error');
      const trends = getErrorTrends();
      assert.strictEqual(trends.total, 1);
    })
  );

  it(
    'getErrorTrends returns all fields',
    withIsolatedDir(dir => {
      recordError('some-op', new Error('test'));
      const trends = getErrorTrends();
      assert.ok(Object.prototype.hasOwnProperty.call(trends, 'total'));
      assert.ok(Object.prototype.hasOwnProperty.call(trends, 'byCategory'));
      assert.ok(Object.prototype.hasOwnProperty.call(trends, 'byContext'));
      assert.ok(Object.prototype.hasOwnProperty.call(trends, 'recentErrors'));
    })
  );

  it(
    'getErrorTrends recentErrors is capped at 20',
    withIsolatedDir(dir => {
      for (let i = 0; i < 25; i++) {
        recordError('flood', new Error(`error ${i}`));
      }
      const trends = getErrorTrends();
      assert.ok(trends.recentErrors.length <= 20);
    })
  );

  it(
    'getErrorSummary returns correct structure',
    withIsolatedDir(dir => {
      recordError('test-op', new Error('some error'));
      const summary = getErrorSummary();
      assert.ok(Object.prototype.hasOwnProperty.call(summary, 'totalErrors'));
      assert.ok(Object.prototype.hasOwnProperty.call(summary, 'categories'));
      assert.ok(Object.prototype.hasOwnProperty.call(summary, 'topContexts'));
      assert.ok(Object.prototype.hasOwnProperty.call(summary, 'firstRecorded'));
      assert.ok(Object.prototype.hasOwnProperty.call(summary, 'lastRecorded'));
    })
  );

  it(
    'getErrorSummary categories have percentages',
    withIsolatedDir(dir => {
      recordError('op-a', Object.assign(new Error('sys'), { code: 'ENOENT' }));
      recordError('op-b', new Error('timed out'));
      const summary = getErrorSummary();
      for (const cat of summary.categories) {
        assert.ok(Object.prototype.hasOwnProperty.call(cat, 'category'));
        assert.ok(Object.prototype.hasOwnProperty.call(cat, 'count'));
        assert.ok(Object.prototype.hasOwnProperty.call(cat, 'pct'));
        assert.ok(cat.pct >= 0 && cat.pct <= 100);
      }
      const totalPct = summary.categories.reduce((s, c) => s + c.pct, 0);
      assert.strictEqual(totalPct, 100);
    })
  );

  it(
    'getErrorSummary tracks firstRecorded and lastRecorded',
    withIsolatedDir(dir => {
      recordError('op', new Error('first'));
      recordError('op', new Error('last'));
      const summary = getErrorSummary();
      assert.ok(Date.parse(summary.firstRecorded));
      assert.ok(Date.parse(summary.lastRecorded));
      assert.ok(new Date(summary.lastRecorded) >= new Date(summary.firstRecorded));
    })
  );
});
