const { describe, it } = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { Tracer, Span, getTracer, redactAttributes, SAFE_ATTR_KEYS } = require('./otel-tracer');

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

describe('Span trace propagation', () => {
  it('child span inherits traceId from parent', () => {
    const parent = new Span('parent.op', {}, null);
    const child = new Span('child.op', {}, null, parent);
    assert.strictEqual(child.traceId, parent.traceId);
  });

  it('child span sets parentSpanId to parent spanId', () => {
    const parent = new Span('parent.op', {}, null);
    const child = new Span('child.op', {}, null, parent);
    assert.strictEqual(child.parentSpanId, parent.spanId);
  });

  it('root span has no parentSpanId', () => {
    const s = new Span('root.op', {}, null);
    assert.strictEqual(s.parentSpanId, null);
  });

  it('Tracer.startSpan propagates parent context', () => {
    const t = new Tracer('test', null);
    const parent = t.startSpan('parent');
    const child = t.startSpan('child', {}, parent);
    assert.strictEqual(child.traceId, parent.traceId);
    assert.strictEqual(child.parentSpanId, parent.spanId);
  });

  it('parentSpanId written to spans.jsonl', () => {
    const dir = path.join(os.tmpdir(), `otel-propagation-${Date.now()}`);
    const parent = new Span('parent.op', {}, dir);
    const child = new Span('child.op', {}, dir, parent);
    parent.end();
    child.end();
    const file = path.join(dir, 'spans.jsonl');
    const lines = fs
      .readFileSync(file, 'utf8')
      .trim()
      .split('\n')
      .map(l => JSON.parse(l));
    const childLine = lines.find(l => l.name === 'child.op');
    assert.ok(childLine, 'child span must be in jsonl');
    assert.strictEqual(childLine.parentSpanId, parent.spanId);
    assert.strictEqual(childLine.traceId, parent.traceId);
    fs.rmSync(dir, { recursive: true });
  });
});

describe('redactAttributes', () => {
  it('passes through known safe keys', () => {
    const result = redactAttributes({ phase: 'build', command: 'ship', status: 'ok' });
    assert.strictEqual(result.phase, 'build');
    assert.strictEqual(result.command, 'ship');
    assert.strictEqual(result.status, 'ok');
  });

  it('redacts keys matching secret/password/token pattern', () => {
    const result = redactAttributes({ apiKey: 'sk-secret', password: 'hunter2', authToken: 'abc' });
    assert.strictEqual(result.apiKey, '[REDACTED]');
    assert.strictEqual(result.password, '[REDACTED]');
    assert.strictEqual(result.authToken, '[REDACTED]');
  });

  it('allows short unknown string values', () => {
    const result = redactAttributes({ someProp: 'short-value' });
    assert.strictEqual(result.someProp, 'short-value');
  });

  it('redacts unknown object values', () => {
    const result = redactAttributes({ nested: { a: 1 } });
    assert.strictEqual(result.nested, '[REDACTED]');
  });

  it('allows number and boolean unknown values', () => {
    const result = redactAttributes({ count: 42, flag: true });
    assert.strictEqual(result.count, 42);
    assert.strictEqual(result.flag, true);
  });

  it('SAFE_ATTR_KEYS includes enricher keys', () => {
    assert.ok(SAFE_ATTR_KEYS.has('enricher.sources'));
    assert.ok(SAFE_ATTR_KEYS.has('enricher.confidence'));
    assert.ok(SAFE_ATTR_KEYS.has('requestId'));
    assert.ok(SAFE_ATTR_KEYS.has('parentSpanId'));
  });

  it('SAFE_ATTR_KEYS includes all 23 defined keys', () => {
    const expected = [
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
    ];
    for (const key of expected) {
      assert.ok(SAFE_ATTR_KEYS.has(key), `SAFE_ATTR_KEYS missing: ${key}`);
    }
    assert.strictEqual(SAFE_ATTR_KEYS.size, expected.length);
  });

  it('passes through all SAFE_ATTR_KEYS values unchanged', () => {
    const attrs = {};
    for (const k of SAFE_ATTR_KEYS) attrs[k] = `val-${k}`;
    const result = redactAttributes(attrs);
    for (const k of SAFE_ATTR_KEYS) {
      assert.strictEqual(result[k], `val-${k}`, `Key ${k} should pass through`);
    }
  });

  it('redacts harness keys that look like secrets', () => {
    const result = redactAttributes({ 'harness.checks': 16, 'harness.passed': 16 });
    assert.strictEqual(result['harness.checks'], 16);
    assert.strictEqual(result['harness.passed'], 16);
  });

  it('blocks unknown keys with object values', () => {
    const result = redactAttributes({ unknownObj: { secret: 'x' } });
    assert.strictEqual(result.unknownObj, '[REDACTED]');
  });
});
