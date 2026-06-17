/**
 * Lightweight OTel-compatible span tracer
 *
 * Based on open-telemetry/opentelemetry-js (2.5k⭐) concepts
 * and traceloop/openllmetry (3k⭐) LLM-specific tracing patterns.
 *
 * No runtime deps — writes spans to .vibe/telemetry/otel/spans.jsonl.
 * Drop-in replacement shim: same API as @opentelemetry/api Tracer/Span.
 */

const fs = require('fs');
const path = require('path');

function randomHex(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

class Span {
  constructor(name, attributes, exportDir) {
    this.name = name;
    this.traceId = randomHex(32);
    this.spanId = randomHex(16);
    this.startTime = Date.now();
    this.attributes = { ...attributes };
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
        startTime: this.startTime,
        endTime: this.endTime,
        duration: this.duration,
        status: this.status,
        attributes: this.attributes,
        events: this.events,
      });
      fs.appendFileSync(path.join(this._exportDir, 'spans.jsonl'), line + '\n');
    } catch { /* never throw from telemetry */ }
  }
}

class Tracer {
  constructor(name, exportDir) {
    this.name = name;
    this.exportDir = exportDir || null;
  }

  startSpan(name, attributes = {}) {
    return new Span(name, { tracer: this.name, ...attributes }, this.exportDir);
  }

  // Convenience: run fn inside a span, auto-end on return/throw
  trace(name, fn, attributes = {}) {
    const span = this.startSpan(name, attributes);
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

module.exports = { Tracer, Span, getTracer };
