const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  trackPhaseTiming,
  getPhaseStats,
  getAllTimingSummary,
  setTelemetryDir,
} = require('./phase-timing');

function withIsolatedDir(fn) {
  return () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pt-'));
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

describe('phase-timing', () => {
  it(
    'creates file on first call',
    withIsolatedDir(dir => {
      const start = new Date('2026-06-14T10:00:00Z');
      const end = new Date('2026-06-14T10:00:30Z');
      trackPhaseTiming('build', start, end);
      const raw = JSON.parse(fs.readFileSync(path.join(dir, 'phase-timing.json'), 'utf8'));
      assert.strictEqual(raw.version, '1.0.0');
      assert.strictEqual(raw.records.length, 1);
    })
  );

  it(
    'appends records',
    withIsolatedDir(dir => {
      const start = new Date('2026-06-14T10:00:00Z');
      const end = new Date('2026-06-14T10:00:30Z');
      trackPhaseTiming('build', start, end);
      trackPhaseTiming('test', start, end);
      const raw = JSON.parse(fs.readFileSync(path.join(dir, 'phase-timing.json'), 'utf8'));
      assert.strictEqual(raw.records.length, 2);
    })
  );

  it(
    'computes durationMs',
    withIsolatedDir(dir => {
      const start = new Date('2026-06-14T12:00:00Z');
      const end = new Date('2026-06-14T12:00:05Z');
      trackPhaseTiming('harness', start, end);
      const raw = JSON.parse(fs.readFileSync(path.join(dir, 'phase-timing.json'), 'utf8'));
      const record = raw.records[raw.records.length - 1];
      assert.strictEqual(record.durationMs, 5000);
    })
  );

  it(
    'records ISO string timestamps',
    withIsolatedDir(dir => {
      trackPhaseTiming('build', new Date('2026-06-14T10:00:00Z'), new Date('2026-06-14T10:00:30Z'));
      const raw = JSON.parse(fs.readFileSync(path.join(dir, 'phase-timing.json'), 'utf8'));
      for (const r of raw.records) {
        assert.ok(Date.parse(r.startTime), `Invalid startTime: ${r.startTime}`);
        assert.ok(Date.parse(r.endTime), `Invalid endTime: ${r.endTime}`);
        assert.ok(Date.parse(r.recordedAt), `Invalid recordedAt: ${r.recordedAt}`);
      }
    })
  );

  it(
    'getPhaseStats returns correct shape',
    withIsolatedDir(dir => {
      trackPhaseTiming('build', new Date('2026-06-14T10:00:00Z'), new Date('2026-06-14T10:00:30Z'));
      const stats = getPhaseStats('build');
      assert.ok(Object.prototype.hasOwnProperty.call(stats, 'phase'));
      assert.ok(Object.prototype.hasOwnProperty.call(stats, 'count'));
      assert.ok(Object.prototype.hasOwnProperty.call(stats, 'minMs'));
      assert.ok(Object.prototype.hasOwnProperty.call(stats, 'maxMs'));
      assert.ok(Object.prototype.hasOwnProperty.call(stats, 'avgMs'));
      assert.ok(Object.prototype.hasOwnProperty.call(stats, 'medianMs'));
      assert.ok(Object.prototype.hasOwnProperty.call(stats, 'totalMs'));
    })
  );

  it(
    'getPhaseStats computes min/max/avg/median',
    withIsolatedDir(dir => {
      trackPhaseTiming(
        'stats-test',
        new Date('2026-06-14T13:00:00Z'),
        new Date('2026-06-14T13:00:10Z')
      );
      trackPhaseTiming(
        'stats-test',
        new Date('2026-06-14T13:01:00Z'),
        new Date('2026-06-14T13:01:20Z')
      );
      trackPhaseTiming(
        'stats-test',
        new Date('2026-06-14T13:02:00Z'),
        new Date('2026-06-14T13:02:30Z')
      );
      const stats = getPhaseStats('stats-test');
      assert.strictEqual(stats.count, 3);
      assert.strictEqual(stats.minMs, 10000);
      assert.strictEqual(stats.maxMs, 30000);
      assert.strictEqual(stats.avgMs, 20000);
      assert.strictEqual(stats.medianMs, 20000);
      assert.strictEqual(stats.totalMs, 60000);
    })
  );

  it(
    'getPhaseStats returns zeroed stats for unknown phase',
    withIsolatedDir(dir => {
      const stats = getPhaseStats('nonexistent');
      assert.strictEqual(stats.phase, 'nonexistent');
      assert.strictEqual(stats.count, 0);
      assert.strictEqual(stats.minMs, 0);
      assert.strictEqual(stats.maxMs, 0);
      assert.strictEqual(stats.avgMs, 0);
      assert.strictEqual(stats.medianMs, 0);
      assert.strictEqual(stats.totalMs, 0);
    })
  );

  it(
    'getAllTimingSummary includes all phases combined',
    withIsolatedDir(dir => {
      trackPhaseTiming('build', new Date('2026-06-14T10:00:00Z'), new Date('2026-06-14T10:00:30Z'));
      trackPhaseTiming('test', new Date('2026-06-14T11:00:00Z'), new Date('2026-06-14T11:01:00Z'));
      const summary = getAllTimingSummary();
      assert.strictEqual(summary.phases.length, 2);
      assert.ok(Object.prototype.hasOwnProperty.call(summary, 'overall'));
      assert.ok(summary.overall.totalMs > 0);
    })
  );

  it(
    'handles empty file gracefully',
    withIsolatedDir(dir => {
      const stats = getPhaseStats('any');
      assert.strictEqual(stats.count, 0);
    })
  );

  it(
    'handles corrupt JSON by backing up and starting fresh',
    withIsolatedDir(dir => {
      const dataFile = path.join(dir, 'phase-timing.json');
      fs.writeFileSync(dataFile, 'this is not json');
      const stats = getPhaseStats('any');
      assert.strictEqual(stats.count, 0);
      const files = fs.readdirSync(dir);
      const hasBackup = files.some(f => f.startsWith('phase-timing-backup-'));
      assert.ok(hasBackup, 'Expected a backup file to exist');
      const newFile = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      assert.strictEqual(newFile.version, '1.0.0');
      assert.deepStrictEqual(newFile.records, []);
    })
  );

  it(
    'invalid timestamp throws TIMING_PARSE_ERROR',
    withIsolatedDir(dir => {
      assert.throws(() => {
        trackPhaseTiming('bad', 'not-a-date', new Date());
      }, /TIMING_PARSE_ERROR/);
    })
  );
});
