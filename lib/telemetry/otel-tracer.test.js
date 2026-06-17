const { describe, it } = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { Tracer, Span, getTracer } = require('./otel-tracer');

describe('Span', () => {
  it('has required fields after construction', () => {
    const s = new Span('test.op', { key: 'val' }, null);
    assert.strictEqual(s.name, 'test.op');
    assert.strictEqual(typeof s.traceId, 'string');
    assert.strictEqual(typeof s.spanId, 'string');
    assert.strictEqual(s.status, 'ok');
  });

  it('setAttribute chains', () => {
    const s = new Span('x', {}, null);
    const ret = s.setAttribute('foo', 'bar');
    assert.strictEqual(ret, s);
    assert.strictEqual(s.attributes.foo, 'bar');
  });

  it('addEvent records events', () => {
    const s = new Span('x', {}, null);
    s.addEvent('cache.hit', { key: 'abc' });
    assert.strictEqual(s.events.length, 1);
    assert.strictEqual(s.events[0].name, 'cache.hit');
  });

  it('end sets duration', () => {
    const s = new Span('x', {}, null);
    s.end();
    assert.ok(typeof s.duration === 'number');
    assert.ok(s.duration >= 0);
  });

  it('writes spans.jsonl when exportDir set', () => {
    const dir = path.join(os.tmpdir(), `otel-test-${Date.now()}`);
    const s = new Span('write.test', { a: 1 }, dir);
    s.end();
    const file = path.join(dir, 'spans.jsonl');
    assert.ok(fs.existsSync(file));
    const line = JSON.parse(fs.readFileSync(file, 'utf8').trim());
    assert.strictEqual(line.name, 'write.test');
    fs.rmSync(dir, { recursive: true });
  });
});

describe('Tracer', () => {
  it('startSpan returns a Span', () => {
    const t = new Tracer('test', null);
    const s = t.startSpan('op');
    assert.ok(s instanceof Span);
  });

  it('trace runs fn and ends span', () => {
    const t = new Tracer('test', null);
    let called = false;
    t.trace('op', span => {
      called = true;
      span.setAttribute('x', 1);
    });
    assert.ok(called);
  });

  it('trace re-throws and sets error status', () => {
    const t = new Tracer('test', null);
    assert.throws(
      () =>
        t.trace('op', () => {
          throw new Error('boom');
        }),
      /boom/
    );
  });
});

describe('getTracer', () => {
  it('returns a Tracer instance', () => {
    const t = getTracer('vibe-stack');
    assert.ok(t instanceof Tracer);
  });
});
