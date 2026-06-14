const { generateDocs } = require('./doc-generator');

describe('doc generator', () => {
  test('returns generated docs with projectMd and prdMd', () => {
    const intent = {
      projectName: 'TestApp',
      problem: 'Test problem',
      users: 'Test users',
      stakes: 'Test stakes',
      solution: 'Test solution',
      mvp: 'Test MVP',
      outOfScope: 'Test out of scope',
      successMetrics: 'Test metrics',
      techStack: 'Next.js + Supabase',
      timeline: '2 weeks'
    };
    const research = {
      competitors: [{ name: 'Comp A', url: 'https://compA.com', strengths: ['Feature 1'], weaknesses: ['Limitation 1'] }],
      openSourceTools: [{ name: 'Tool A', repo: 'https://github.com/toolA', stars: 1000, license: 'MIT', description: 'Test tool' }],
      recommendations: ['Use Tool A for auth'],
      risks: ['Risk 1'],
      nextSteps: ['Build prototype']
    };
    const result = generateDocs(intent, research);
    expect(result).toHaveProperty('projectMd');
    expect(result).toHaveProperty('prdMd');
    expect(result).toHaveProperty('marketResearchMd');
  });

  test('projectMd contains project name', () => {
    const intent = { projectName: 'TestApp' };
    const research = {};
    const result = generateDocs(intent, research);
    expect(result.projectMd).toContain('TestApp');
  });

  test('prdMd contains project name', () => {
    const intent = { projectName: 'TestApp' };
    const research = {};
    const result = generateDocs(intent, research);
    expect(result.prdMd).toContain('TestApp');
  });

  test('marketResearchMd contains project name', () => {
    const intent = { projectName: 'TestApp' };
    const research = {};
    const result = generateDocs(intent, research);
    expect(result.marketResearchMd).toContain('TestApp');
  });
});
