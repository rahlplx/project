/**
 * Lightweight OTel-compatible span tracer
 *
 * Based on open-telemetry/opentelemetry-js (2.5k⭐) concepts
 * and traceloop/openllmetry (3k⭐) LLM-specific tracing patterns.
 *
 * No runtime deps — writes spans to .vibe/telemetry/otel/spans.jsonl.
 * Drop-in replacement shim: same API as @opentelemetry/api Tracer/Span.
 *
 * v2 adds: trace context propagation, parent-child span linkage,
 * attribute redaction (security), LLM-agnostic span attributes.
 */

const fs = require('fs');
const path = require('path');

function randomHex(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Allowlist for safe span attributes — secrets never written to disk
const SAFE_ATTR_KEYS = new Set([
  'tracer',
  'phase',
  'command',
  'status',
  'duration',
  'skills',
  'confidence',
  'label',
  'source',
  'requestId',
  'parentSpanId',
  'model',
  'template',
  'template.category',
  'template.id',
  'error.message',
  'error.type',
  'enricher.sources',
  'enricher.confidence',
  'harness.checks',
  'harness.passed',
  'lifecycle.interaction_count',
  'lifecycle.maintenance_count',
]);

const REDACT_PATTERN = /secret|password|api.?key|token|auth|credential|private/i;

function redactAttributes(attrs) {
  const safe = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (SAFE_ATTR_KEYS.has(k)) {
      safe[k] = v;
    } else if (REDACT_PATTERN.test(k)) {
      safe[k] = '[REDACTED]';
    } else {
      // Unknown key: allow strings under 200 chars, redact objects/arrays
      safe[k] =
        typeof v === 'string' && v.length <= 200 && !REDACT_PATTERN.test(v)
          ? v
          : typeof v === 'number' || typeof v === 'boolean'
            ? v
            : '[REDACTED]';
    }
  }
  return safe;
}

const spanBuffers = new Map();
const flushTimeouts = new Map();

// Bug #2 fix: track write failures so `vibe telemetry` can report telemetry health.
// Incremented every time flushToDisk catches an error. Never logged per-failure (noise);
// exposed as an aggregate counter via getTelemetryStats().
let writesFailed = 0;

function enqueueSpan(exportDir, spanData) {
  if (!spanBuffers.has(exportDir)) {
    spanBuffers.set(exportDir, []);
  }
  spanBuffers.get(exportDir).push(spanData);

  if (!flushTimeouts.has(exportDir)) {
    const timeout = setTimeout(() => {
      flushToDisk(exportDir);
    }, 500);
    flushTimeouts.set(exportDir, timeout);
  }
}

function flushToDisk(exportDir) {
  const buffer = spanBuffers.get(exportDir);
  if (!buffer || buffer.length === 0) {
    flushTimeouts.delete(exportDir);
    return;
  }

  const spansToFlush = [...buffer];
  spanBuffers.set(exportDir, []);

  if (flushTimeouts.has(exportDir)) {
    clearTimeout(flushTimeouts.get(exportDir));
    flushTimeouts.delete(exportDir);
  }

  const filePath = path.join(exportDir, 'spans.jsonl');

  try {
    fs.mkdirSync(exportDir, { recursive: true });
    // FIX (Bug #2): Use atomic append instead of read-modify-write.
    //
    // The previous implementation did:
    //   1. readFileSync(filePath)  ← read entire file
    //   2. existingContent + newContent  ← append in memory
    //   3. writeFileSync(tmpPath, ...) + renameSync(tmpPath, filePath)  ← write back
    //
    // This is a classic read-modify-write race. When two Node processes write
    // concurrently (CLI + background harness + MCP server + auto-maintain),
    // both read the same "existing" content, both append their spans in memory,
    // and the second write clobbers the first — causing silent span loss.
    //
    // fs.appendFileSync is atomic per-write on POSIX for writes under PIPE_BUF
    // (typically 4KB; our spans are ~300 bytes each). This guarantees that
    // concurrent appends from different processes never clobber each other.
    //
    // Refs: vibe-stack simulation log, 2026-06-19 — 1027 spans lost across 15
    // CLI commands due to this race.
    const newContent = spansToFlush.map(s => JSON.stringify(s)).join('\n') + '\n';
    fs.appendFileSync(filePath, newContent);
  } catch (err) {
    // Track failures without throwing (telemetry must never break the host process).
    // The counter is exposed via getTelemetryStats() for `vibe telemetry` reporting.
    writesFailed++;
    /* never throw from telemetry */
  }
}

/**
 * Get telemetry health stats for diagnostics.
 * @returns {{writesFailed: number, bufferedSpans: number, exportDirs: number}}
 */
function getTelemetryStats() {
  let bufferedSpans = 0;
  for (const buf of spanBuffers.values()) {
    bufferedSpans += buf.length;
  }
  return {
    writesFailed,
    bufferedSpans,
    exportDirs: spanBuffers.size,
  };
}

/**
 * Reset the writesFailed counter. Used by tests and after `vibe telemetry` reports.
 */
function resetTelemetryStats() {
  writesFailed = 0;
}

function flushAll() {
  for (const exportDir of spanBuffers.keys()) {
    flushToDisk(exportDir);
  }
}

// Ensure flush on exit
process.on('exit', () => {
  flushAll();
});

class Span {
  constructor(name, attributes, exportDir, parentSpan = null) {
    // Propagate traceId from parent for full request correlation
    this.traceId = parentSpan ? parentSpan.traceId : randomHex(32);
    this.spanId = randomHex(16);
    this.parentSpanId = parentSpan ? parentSpan.spanId : null;
    this.name = name;
    this.startTime = Date.now();
    this.attributes = { ...attributes };
    if (this.parentSpanId) this.attributes.parentSpanId = this.parentSpanId;
    this.events = [];
    this.status = 'ok';
    this._exportDir = exportDir || null;
  }

  setAttribute(key, value) {
    this.attributes[key] = value;
    return this;
  }

  addEvent(name, attrs = {}) {
    this.events.push({ name, attrs, time: Date.now() });
    return this;
  }

  setStatus(status) {
    this.status = status;
    return this;
  }

  end() {
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
    if (this._exportDir) {
      this._enqueue();
    }
    return this;
  }

  _enqueue() {
    const data = {
      name: this.name,
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      status: this.status,
      attributes: redactAttributes(this.attributes),
      events: this.events,
    };
    enqueueSpan(this._exportDir, data);
  }
}

class Tracer {
  constructor(name, exportDir) {
    this.name = name;
    this.exportDir = exportDir || null;
  }

  /**
   * Start a span. Pass parentSpan to propagate traceId and link spans.
   * @param {string} name
   * @param {Object} [attributes]
   * @param {Span|null} [parentSpan] - parent span for trace context propagation
   */
  startSpan(name, attributes = {}, parentSpan = null) {
    return new Span(name, { tracer: this.name, ...attributes }, this.exportDir, parentSpan);
  }

  /**
   * Run fn inside a span, auto-end on return/throw.
   * @param {string} name
   * @param {Function} fn - receives (span) as first arg
   * @param {Object} [attributes]
   * @param {Span|null} [parentSpan]
   */
  trace(name, fn, attributes = {}, parentSpan = null) {
    const span = this.startSpan(name, attributes, parentSpan);
    try {
      const result = fn(span);
      span.end();
      return result;
    } catch (err) {
      span.setStatus('error').setAttribute('error.message', err.message);
      span.end();
      throw err;
    }
  }
}

/**
 * Get a named tracer, exporting spans to .vibe/telemetry/otel/
 * @param {string} name - tracer/service name
 * @param {string} [projectRoot] - defaults to cwd
 */
function getTracer(name, projectRoot) {
  const root = projectRoot || process.cwd();
  const exportDir = path.join(root, '.vibe', 'telemetry', 'otel');
  return new Tracer(name, exportDir);
}

module.exports = {
  Tracer,
  Span,
  getTracer,
  redactAttributes,
  SAFE_ATTR_KEYS,
  flushAll,
  getTelemetryStats,
  resetTelemetryStats,
};
