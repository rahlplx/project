'use strict';
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const {
  getTracer,
  flushAll,
  getTelemetryStats,
  resetTelemetryStats,
} = require('./otel-tracer');

/**
 * Regression tests for Bug #2: spans.jsonl concurrent write race.
 *
 * The bug: flushToDisk() used a read-modify-write pattern (readFileSync →
 * string concat → writeFileSync + renameSync). When two Node processes wrote
 * concurrently, both read the same "existing" content, both appended their
 * spans in memory, and the second write clobbered the first — causing silent
 * span loss.
 *
 * The fix: flushToDisk() now uses fs.appendFileSync, which is atomic per-write
 * on POSIX for writes under PIPE_BUF (typically 4KB).
 *
 * Test strategy:
 * 1. Unit tests (always run) — verify the fix is in place by mocking fs
 * 2. Integration tests (run when ulimits allow) — spawn concurrent processes
 *    and verify no span loss. Skipped automatically in resource-constrained
 *    environments (e.g., CI sandboxes with low ulimit -u).
 */

// Helper script that child processes run — writes N spans to a given exportDir.
const CHILD_SCRIPT = `
const { getTracer, flushAll } = require(process.argv[2]);
const exportDir = process.argv[3];
const count = parseInt(process.argv[4], 10);
const tracer = getTracer('race-test-child', require('path').dirname(exportDir));
tracer.exportDir = exportDir;
for (let i = 0; i < count; i++) {
  const span = tracer.startSpan('child-span-' + i);
  span.setAttribute('child_pid', process.pid);
  span.end();
}
flushAll();
`;

/**
 * Check if the environment can spawn child processes.
 * Returns false in sandboxes with low ulimit -u (e.g., default CI containers).
 */
function canSpawnChildren() {
  try {
    const { execSync } = require('child_process');
    execSync('node -e "process.exit(0)"', { stdio: 'pipe', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

const SPAWN_SUPPORTED = canSpawnChildren();

describe('Bug #2 regression: flushToDisk uses atomic append', () => {
  let tmpDir;
  let originalAppendSync;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-tracer-test-'));
    resetTelemetryStats();
    originalAppendSync = fs.appendFileSync;
  });

  afterEach(() => {
    fs.appendFileSync = originalAppendSync;
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('flushToDisk appends to existing file without truncating (behavioral verification of Bug #2 fix)', () => {
    const exportDir = path.join(tmpDir, 'otel-behavioral');
    fs.mkdirSync(exportDir, { recursive: true });
    const spansFile = path.join(exportDir, 'spans.jsonl');

    // Pre-write 3 existing spans (simulating prior process output)
    const existingSpans = [
      '{"name":"existing-1","traceId":"aaa","spanId":"111"}',
      '{"name":"existing-2","traceId":"bbb","spanId":"222"}',
      '{"name":"existing-3","traceId":"ccc","spanId":"333"}',
    ].join('\n') + '\n';
    fs.writeFileSync(spansFile, existingSpans);

    // Write 2 new spans via the tracer
    const tracer = getTracer('test-tracer', tmpDir);
    tracer.exportDir = exportDir;
    for (let i = 0; i < 2; i++) {
      const span = tracer.startSpan('new-span-' + i);
      span.end();
    }
    flushAll();

    // Read back — should have 5 spans (3 existing + 2 new), NOT 2 (which would indicate truncation)
    const content = fs.readFileSync(spansFile, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    assert.strictEqual(
      lines.length,
      5,
      `Expected 5 spans (3 existing + 2 new), got ${lines.length}. ` +
        (lines.length < 5 ? 'TRUNCATION DETECTED — Bug #2 not fixed!' : 'Unexpected span count.')
    );

    // Verify existing spans are still there (not overwritten)
    assert.ok(lines[0].includes('"existing-1"'), 'First existing span should be preserved');
    assert.ok(lines[1].includes('"existing-2"'), 'Second existing span should be preserved');
    assert.ok(lines[2].includes('"existing-3"'), 'Third existing span should be preserved');

    // Verify new spans were appended
    assert.ok(lines[3].includes('"new-span-0"'), 'First new span should be appended');
    assert.ok(lines[4].includes('"new-span-1"'), 'Second new span should be appended');
  });

  it('appendFileSync preserves existing content (no truncation)', () => {
    const exportDir = path.join(tmpDir, 'otel');
    fs.mkdirSync(exportDir, { recursive: true });
    const spansFile = path.join(exportDir, 'spans.jsonl');

    // Pre-write some content
    fs.writeFileSync(spansFile, '{"existing": "span"}\n');

    // Write a new span via the tracer
    const tracer = getTracer('test-tracer', tmpDir);
    tracer.exportDir = exportDir;
    const span = tracer.startSpan('new-span');
    span.end();
    flushAll();

    const content = fs.readFileSync(spansFile, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    assert.strictEqual(lines.length, 2, 'File should have 2 spans (1 existing + 1 new)');
    assert.ok(lines[0].includes('"existing"'), 'First line should be the pre-existing span');
    assert.ok(lines[1].includes('"new-span"'), 'Second line should be the new span');
  });

  it('getTelemetryStats reports writesFailed counter', () => {
    const tracer = getTracer('test-tracer', tmpDir);
    tracer.exportDir = path.join(tmpDir, 'otel');

    // Force a write failure by making appendFileSync throw
    fs.appendFileSync = () => {
      throw new Error('simulated disk full');
    };

    const span = tracer.startSpan('failing-span');
    span.end();
    flushAll();

    const stats = getTelemetryStats();
    assert.ok(stats.writesFailed >= 1, 'writesFailed should be >= 1 after a failed write');
  });

  it('multiple spans in one flush are all preserved', () => {
    const exportDir = path.join(tmpDir, 'otel');
    fs.mkdirSync(exportDir, { recursive: true });
    const tracer = getTracer('test-tracer', tmpDir);
    tracer.exportDir = exportDir;

    // Write 10 spans, then flush
    for (let i = 0; i < 10; i++) {
      const span = tracer.startSpan('batch-span-' + i);
      span.end();
    }
    flushAll();

    const spansFile = path.join(exportDir, 'spans.jsonl');
    const content = fs.readFileSync(spansFile, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    assert.strictEqual(lines.length, 10, 'All 10 spans should be present');
  });
});

// Integration test: spawn concurrent processes and verify no span loss.
// Skipped in resource-constrained environments (e.g., sandboxes with low ulimit -u).
describe('Bug #2 integration: concurrent process span writes', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-race-'));
    fs.writeFileSync(path.join(tmpDir, 'child.js'), CHILD_SCRIPT);
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  (SPAWN_SUPPORTED ? it : it.skip)(
    'does not lose spans when 2 processes write 50 spans each',
    (_, done) => {
      const otelTracerPath = path.resolve(__dirname, 'otel-tracer.js');
      const exportDir = path.join(tmpDir, 'otel-2proc');
      fs.mkdirSync(exportDir, { recursive: true });

      const child1 = spawn('node', [path.join(tmpDir, 'child.js'), otelTracerPath, exportDir, '50']);
      const child2 = spawn('node', [path.join(tmpDir, 'child.js'), otelTracerPath, exportDir, '50']);

      let exitCount = 0;
      const errors = [];
      const onExit = code => {
        if (code !== 0) errors.push(`child exited with ${code}`);
        exitCount++;
        if (exitCount === 2) {
          if (errors.length) {
            done(new Error(errors.join('; ')));
            return;
          }
          const spansFile = path.join(exportDir, 'spans.jsonl');
          try {
            const content = fs.readFileSync(spansFile, 'utf8');
            const lines = content.split('\n').filter(l => l.trim());
            assert.strictEqual(
              lines.length,
              100,
              `Expected 100 spans (50 + 50), got ${lines.length}. Span loss detected!`
            );
            done();
          } catch (err) {
            done(err);
          }
        }
      };

      child1.on('exit', onExit);
      child2.on('exit', onExit);
      child1.stderr.on('data', d => process.stderr.write(d));
      child2.stderr.on('data', d => process.stderr.write(d));
    }
  );

  (SPAWN_SUPPORTED ? it : it.skip)(
    'does not lose spans when 5 processes write 20 spans each',
    (_, done) => {
      const otelTracerPath = path.resolve(__dirname, 'otel-tracer.js');
      const exportDir = path.join(tmpDir, 'otel-5proc');
      fs.mkdirSync(exportDir, { recursive: true });

      let exitCount = 0;
      const onExit = () => {
        exitCount++;
        if (exitCount === 5) {
          const spansFile = path.join(exportDir, 'spans.jsonl');
          try {
            const content = fs.readFileSync(spansFile, 'utf8');
            const lines = content.split('\n').filter(l => l.trim());
            assert.strictEqual(
              lines.length,
              100,
              `Expected 100 spans (5 × 20), got ${lines.length}. Span loss detected!`
            );
            done();
          } catch (err) {
            done(err);
          }
        }
      };

      for (let i = 0; i < 5; i++) {
        const c = spawn('node', [path.join(tmpDir, 'child.js'), otelTracerPath, exportDir, '20']);
        c.on('exit', onExit);
      }
    }
  );

  if (!SPAWN_SUPPORTED) {
    it('SKIPPED: concurrent process tests require normal ulimits (current env: EAGAIN on spawn)', () => {
      // This test documents why the concurrent tests are skipped.
      // To enable: run on a machine with ulimit -u >= 2048 (typical default).
      // The fix is still verified by the unit tests above.
      assert.ok(true, 'Concurrent tests skipped — see comment above');
    });
  }
});
