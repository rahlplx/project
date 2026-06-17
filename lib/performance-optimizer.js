class TTLCache {
  #store = new Map();
  #defaultTTL;

  constructor(defaultTTL = 60000) {
    this.#defaultTTL = defaultTTL;
  }

  get(key) {
    const entry = this.#store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.#store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttl) {
    const ttlMs = ttl ?? this.#defaultTTL;
    this.#store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    return value;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    return this.#store.delete(key);
  }

  clear() {
    this.#store.clear();
  }

  get size() {
    this.#evictStale();
    return this.#store.size;
  }

  #evictStale() {
    const now = Date.now();
    for (const [key, entry] of this.#store) {
      if (now > entry.expiresAt) this.#store.delete(key);
    }
  }
}

class ResponseStreamer {
  constructor(streamOut) {
    this.out = streamOut;
    this.chunkIndex = 0;
    this.requestId = null;
  }

  start(requestId) {
    this.chunkIndex = 0;
    this.requestId = requestId;
  }

  write(chunk) {
    const payload = {
      jsonrpc: '2.0',
      method: 'notifications/progress',
      params: {
        requestId: this.requestId,
        chunkIndex: this.chunkIndex++,
        value: chunk,
      },
    };
    this.out.write(JSON.stringify(payload) + '\n');
  }

  end(result) {
    const payload = {
      jsonrpc: '2.0',
      id: this.requestId,
      result: {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      },
    };
    this.out.write(JSON.stringify(payload) + '\n');
  }

  error(message, code = -32603) {
    const payload = {
      jsonrpc: '2.0',
      id: this.requestId,
      error: { code, message },
    };
    this.out.write(JSON.stringify(payload) + '\n');
  }
}

class BatchProcessor {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency ?? 10;
  }

  async run(tasks) {
    const results = [];
    for (let i = 0; i < tasks.length; i += this.maxConcurrency) {
      const batch = tasks.slice(i, i + this.maxConcurrency);
      const settled = await Promise.allSettled(
        batch.map((task) => this.#executeSingle(task))
      );
      for (const outcome of settled) {
        results.push(outcome);
      }
    }
    return results;
  }

  async #executeSingle(task) {
    if (typeof task === 'function') {
      return task();
    }
    if (task && typeof task === 'object' && task.instance && typeof task.method === 'string') {
      return task.instance[task.method](...(task.args || []));
    }
    throw new Error(
      'BatchProcessor: task must be a function or {instance, method, args}'
    );
  }
}

class SkillCache {
  #cache = new TTLCache(300000);
  #loader;

  constructor(loaderFn) {
    this.#loader = loaderFn;
  }

  getAll() {
    const cached = this.#cache.get('all_skills');
    if (cached) return cached;
    const fresh = this.#loader();
    this.#cache.set('all_skills', fresh);
    return fresh;
  }

  invalidate() {
    this.#cache.delete('all_skills');
  }

  get cacheSize() {
    return this.#cache.size;
  }
}

function wrapToolCall(instance, methodName, streamer, requestId) {
  return async (...args) => {
    streamer.start(requestId);
    try {
      const result = await Promise.resolve(instance[methodName](...args));
      streamer.end(result);
      return result;
    } catch (err) {
      streamer.error(err.message);
      throw err;
    }
  };
}

module.exports = {
  TTLCache,
  ResponseStreamer,
  BatchProcessor,
  SkillCache,
  wrapToolCall,
};