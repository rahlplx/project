const { KnowledgeBase } = require('./knowledge-base');

describe('knowledge base', () => {
  test('creates empty knowledge base', () => {
    const kb = new KnowledgeBase();
    expect(kb.patterns).toEqual([]);
    expect(kb.stats.totalProjects).toBe(0);
  });

  test('adds a pattern', () => {
    const kb = new KnowledgeBase();
    kb.addPattern({
      name: 'Auth Pattern',
      category: 'auth',
      description: 'Use NextAuth.js for authentication',
      confidence: 0.8,
    });
    expect(kb.patterns.length).toBe(1);
    expect(kb.patterns[0].name).toBe('Auth Pattern');
  });

  test('retrieves patterns by category', () => {
    const kb = new KnowledgeBase();
    kb.addPattern({ name: 'Auth 1', category: 'auth', description: 'Desc 1', confidence: 0.8 });
    kb.addPattern({ name: 'API 1', category: 'api', description: 'Desc 2', confidence: 0.7 });
    kb.addPattern({ name: 'Auth 2', category: 'auth', description: 'Desc 3', confidence: 0.9 });
    const authPatterns = kb.getPatternsByCategory('auth');
    expect(authPatterns.length).toBe(2);
  });

  test('returns empty for unknown category', () => {
    const kb = new KnowledgeBase();
    const patterns = kb.getPatternsByCategory('unknown');
    expect(patterns).toEqual([]);
  });

  test('increments total projects', () => {
    const kb = new KnowledgeBase();
    kb.incrementProjectCount();
    expect(kb.stats.totalProjects).toBe(1);
  });

  test('returns stats', () => {
    const kb = new KnowledgeBase();
    const stats = kb.getStats();
    expect(stats).toHaveProperty('totalProjects');
    expect(stats).toHaveProperty('totalPatterns');
  });
});
