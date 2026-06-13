const ContextMemory = require('./index');

describe('ContextMemory', () => {
  it('should create instance', () => {
    const s = new ContextMemory();
    expect(s.name).toBe('context-memory');
  });

  it('should remember and recall', () => {
    const s = new ContextMemory();
    s.remember('name', 'vibe-stack');
    expect(s.recall('name').value).toBe('vibe-stack');
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
});
