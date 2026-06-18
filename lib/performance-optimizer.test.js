const { describe, it, beforeEach } = require('node:test');
const assert = require('assert');
const {
  TTLCache,
  ResponseStreamer,
  BatchProcessor,
  SkillCache,
  wrapToolCall,
} = require('./performance-optimizer');

describe('TTLCache', () => {
  let cache;

  beforeEach(() => {
    cache = new TTLCache(100);
  });

  it('sets and gets values', () => {
    cache.set('key1', 'value1');
    assert.strictEqual(cache.get('key1'), 'value1');
  });

  it('returns undefined for missing keys', () => {
    assert.strictEqual(cache.get('missing'), undefined);
  });

  it('respects TTL expiration', async () => {
    cache.set('key1', 'value1', 50);
    assert.strictEqual(cache.get('key1'), 'value1');
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(cache.get('key1'), undefined);
  });

  it('uses custom TTL per entry', () => {
    cache.set('key1', 'value1', 200);
    cache.set('key2', 'value2', 50);
    assert.strictEqual(cache.get('key1'), 'value1');
    assert.strictEqual(cache.get('key2'), 'value2');
  });

  it('has returns true for existing non-expired keys', () => {
    cache.set('key1', 'value1');
    assert.strictEqual(cache.has('key1'), true);
    assert.strictEqual(cache.has('missing'), false);
  });

  it('deletes keys', () => {
    cache.set('key1', 'value1');
    assert.strictEqual(cache.delete('key1'), true);
    assert.strictEqual(cache.get('key1'), undefined);
    assert.strictEqual(cache.delete('key1'), false);
  });

  it('clears all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    assert.strictEqual(cache.size, 0);
  });

  it('reports size correctly', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    assert.strictEqual(cache.size, 2);
  });

  it('evicts stale entries on size check', async () => {
    cache.set('key1', 'value1', 50);
    cache.set('key2', 'value2', 500);
    await new Promise(r => setTimeout(r, 70));
    assert.strictEqual(cache.size, 1);
  });
});

describe('ResponseStreamer', () => {
  let output = [];
  let streamer;

  beforeEach(() => {
    output = [];
    streamer = new ResponseStreamer({ write: data => output.push(data) });
  });

  it('starts with requestId', () => {
    streamer.start('req-123');
    assert.strictEqual(streamer.requestId, 'req-123');
    assert.strictEqual(streamer.chunkIndex, 0);
  });

  it('writes progress chunks', () => {
    streamer.start('req-123');
    streamer.write('chunk 1');
    streamer.write('chunk 2');
    assert.strictEqual(output.length, 2);
    assert.ok(output[0].includes('chunkIndex":0'));
    assert.ok(output[1].includes('chunkIndex":1'));
    assert.ok(output[0].includes('notifications/progress'));
  });

  it('ends with result', () => {
    streamer.start('req-123');
    streamer.end({ success: true });
    const last = output[output.length - 1];
    assert.ok(last.includes('result'));
    assert.ok(last.includes('success'));
  });

  it('outputs error', () => {
    streamer.start('req-123');
    streamer.error('Something failed', -32603);
    const last = output[output.length - 1];
    assert.ok(last.includes('error'));
    assert.ok(last.includes('Something failed'));
  });
});

describe('BatchProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new BatchProcessor({ maxConcurrency: 3 });
  });

  it('runs functions in batches', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
      () => Promise.resolve(4),
    ];
    const results = await processor.run(tasks);
    assert.strictEqual(results.length, 4);
    assert.ok(results.every(r => r.status === 'fulfilled'));
    assert.deepStrictEqual(
      results.map(r => r.value),
      [1, 2, 3, 4]
    );
  });

  it('handles rejected promises', async () => {
    const tasks = [() => Promise.resolve('ok'), () => Promise.reject(new Error('fail'))];
    const results = await processor.run(tasks);
    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].status, 'fulfilled');
    assert.strictEqual(results[1].status, 'rejected');
  });

  it('runs instance methods', async () => {
    const instance = {
      add: (a, b) => a + b,
      multiply: (a, b) => a * b,
    };
    const tasks = [
      { instance, method: 'add', args: [2, 3] },
      { instance, method: 'multiply', args: [4, 5] },
    ];
    const results = await processor.run(tasks);
    assert.strictEqual(results[0].value, 5);
    assert.strictEqual(results[1].value, 20);
  });

  it('respects maxConcurrency', async () => {
    const order = [];
    const tasks = [
      () => {
        order.push(1);
        return Promise.resolve(1);
      },
      () => {
        order.push(2);
        return Promise.resolve(2);
      },
      () => {
        order.push(3);
        return Promise.resolve(3);
      },
      () => {
        order.push(4);
        return Promise.resolve(4);
      },
    ];
    await processor.run(tasks);
  });

  it('rejects on invalid task', async () => {
    const tasks = [null];
    const results = await processor.run(tasks);
    assert.strictEqual(results[0].status, 'rejected');
    assert.ok(results[0].reason.message.includes('task must be a function'));
  });
});

describe('SkillCache', () => {
  let loadCount = 0;
  const loader = () => {
    loadCount++;
    return { skill1: { name: 'skill1' } };
  };
  let skillCache;

  beforeEach(() => {
    loadCount = 0;
    skillCache = new SkillCache(loader);
  });

  it('loads on first call', () => {
    const skills = skillCache.getAll();
    assert.strictEqual(loadCount, 1);
    assert.ok(skills.skill1);
  });

  it('returns cached on subsequent calls', () => {
    skillCache.getAll();
    skillCache.getAll();
    assert.strictEqual(loadCount, 1);
  });

  it('invalidates cache', () => {
    skillCache.getAll();
    skillCache.invalidate();
    skillCache.getAll();
    assert.strictEqual(loadCount, 2);
  });

  it('reports cache size', () => {
    skillCache.getAll();
    assert.strictEqual(skillCache.cacheSize, 1);
  });
});

describe('wrapToolCall', () => {
  let output = [];
  let streamer;
  let instance;

  beforeEach(() => {
    output = [];
    streamer = new ResponseStreamer({ write: data => output.push(data) });
    instance = {
      greet: name => `Hello, ${name}!`,
      fail: () => {
        throw new Error('boom');
      },
    };
  });

  it('wraps successful call', async () => {
    const wrapped = wrapToolCall(instance, 'greet', streamer, 'req-1');
    const result = await wrapped('World');
    assert.strictEqual(result, 'Hello, World!');
    assert.ok(output[0].includes('result'));
    assert.ok(output[0].includes('Hello, World!'));
  });

  it('wraps failed call with error', async () => {
    const wrapped = wrapToolCall(instance, 'fail', streamer, 'req-2');
    await assert.rejects(() => wrapped(), /boom/);
    assert.ok(output[0].includes('error'));
    assert.ok(output[0].includes('boom'));
  });
});
