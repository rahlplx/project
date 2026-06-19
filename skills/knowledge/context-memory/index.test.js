const ContextMemory = require('./index');

describe('ContextMemory', () => {
  it('should create instance', () => {
    const s = new ContextMemory();
    expect(s.name).toBe('context-memory');
  });

  it('should remember and recall', () => {
    const s = new ContextMemory();
    s.remember('name', 'vibenexus');
    expect(s.recall('name').value).toBe('vibenexus');
  });

  it('should forget', () => {
    const s = new ContextMemory();
    s.remember('x', 1);
    s.forget('x');
    expect(s.recall('x')).toBeNull();
  });

  it('should summarize', () => {
    const s = new ContextMemory();
    s.remember('a', 1);
    s.remember('b', 2);
    const sum = s.summarize();
    expect(sum.totalEntries).toBe(2);
  });

  it('should return null for nonexistent key', () => {
    const s = new ContextMemory();
    expect(s.recall('nonexistent')).toBeNull();
  });

  it('should overwrite existing value', () => {
    const s = new ContextMemory();
    s.remember('key', 'old');
    s.remember('key', 'new');
    expect(s.recall('key').value).toBe('new');
  });

  it('should recall after multiple remembers', () => {
    const s = new ContextMemory();
    s.remember('a', 1);
    s.remember('b', 2);
    s.remember('c', 3);
    expect(s.recall('a').value).toBe(1);
    expect(s.recall('b').value).toBe(2);
    expect(s.recall('c').value).toBe(3);
  });

  it('should safely forget nonexistent key', () => {
    const s = new ContextMemory();
    const result = s.forget('never-added');
    expect(result).toEqual({ forgotten: true, key: 'never-added' });
  });

  it('should summarize with zero entries', () => {
    const s = new ContextMemory();
    const sum = s.summarize();
    expect(sum.totalEntries).toBe(0);
    expect(sum.recentEntries).toEqual([]);
    expect(sum.timestamp).toBeTruthy();
  });

  it('should handle large number of entries in recallAll', () => {
    const s = new ContextMemory();
    for (let i = 0; i < 100; i++) {
      s.remember(`key${i}`, i);
    }
    const all = s.recallAll();
    expect(all.length).toBe(100);
    expect(all[0]).toHaveProperty('key');
    expect(all[0]).toHaveProperty('value');
    expect(all[0]).toHaveProperty('savedAt');
    const sum = s.summarize();
    expect(sum.totalEntries).toBe(100);
    expect(sum.recentEntries.length).toBe(5);
  });
});
