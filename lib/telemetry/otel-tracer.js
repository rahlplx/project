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
        typeof v === 'string' && v.length <= 200
          ? v
          : typeof v === 'number' || typeof v === 'boolean'
            ? v
            : '[REDACTED]';
    }
  }
  return safe;
}

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
    if (this._exportDir) this._flush();
    return this;
  }

  _flush() {
    try {
      fs.mkdirSync(this._exportDir, { recursive: true });
      const line = JSON.stringify({
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
      });
      fs.appendFileSync(path.join(this._exportDir, 'spans.jsonl'), line + '\n');
    } catch {
      /* never throw from telemetry */
    }
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

module.exports = { Tracer, Span, getTracer, redactAttributes, SAFE_ATTR_KEYS };
