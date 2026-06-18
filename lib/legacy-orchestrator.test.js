const { Orchestrator } = require('./legacy-orchestrator');

describe('orchestrator', () => {
  test('creates orchestrator with all modules', () => {
    const orch = new Orchestrator();
    expect(orch).toHaveProperty('knowledgeBase');
    expect(orch).toHaveProperty('feedbackLoop');
  });

  test('runs full pipeline', async () => {
    const orch = new Orchestrator();
    const result = await orch.run({
      projectName: 'TestApp',
      problem: 'Test problem',
      users: 'Test users',
      stakes: 'Test stakes',
      solution: 'Test solution',
      mvp: 'Test MVP',
    });
    expect(result).toHaveProperty('projectMd');
    expect(result).toHaveProperty('prdMd');
    expect(result).toHaveProperty('marketResearchMd');
  });

  test('captures feedback', () => {
    const orch = new Orchestrator();
    orch.captureFeedback({
      projectName: 'TestApp',
      patterns: [
        { name: 'Auth Pattern', category: 'auth', description: 'Use NextAuth.js', confidence: 0.8 },
      ],
      lessons: ['Use TypeScript'],
    });
    const stats = orch.getStats();
    expect(stats.totalProjects).toBe(1);
  });

  test('returns stats', () => {
    const orch = new Orchestrator();
    const stats = orch.getStats();
    expect(stats).toHaveProperty('totalProjects');
    expect(stats).toHaveProperty('totalPatterns');
  });
});
