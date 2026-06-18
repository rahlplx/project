const { generateResearchMd } = require('./template');

describe('research template', () => {
  test('generates research doc with all sections', () => {
    const data = {
      projectName: 'TestApp',
      researchDate: '2026-06-14',
      marketOverview: 'Test market overview',
      competitors: [
        {
          name: 'Comp A',
          url: 'https://compA.com',
          strengths: ['Feature 1'],
          weaknesses: ['Limitation 1'],
        },
      ],
      openSourceTools: [
        {
          name: 'Tool A',
          repo: 'https://github.com/toolA',
          stars: 1000,
          license: 'MIT',
          description: 'Test tool',
        },
      ],
      recommendations: ['Use Tool A for auth'],
      risks: ['Risk 1'],
      nextSteps: ['Build prototype'],
    };
    const md = generateResearchMd(data);
    expect(md).toContain('# Market Research: TestApp');
    expect(md).toContain('## Market Overview');
    expect(md).toContain('## Competitor Analysis');
    expect(md).toContain('Comp A');
    expect(md).toContain('## Open Source Tools');
    expect(md).toContain('Tool A');
    expect(md).toContain('## Recommendations');
    expect(md).toContain('Use Tool A for auth');
    expect(md).toContain('## Risks');
    expect(md).toContain('## Next Steps');
  });

  test('handles empty competitors', () => {
    const data = {
      projectName: 'TestApp',
      researchDate: '2026-06-14',
      marketOverview: 'Test',
      competitors: [],
      openSourceTools: [],
      recommendations: [],
      risks: [],
      nextSteps: [],
    };
    const md = generateResearchMd(data);
    expect(md).toContain('No competitors analyzed');
  });

  test('handles empty tools', () => {
    const data = {
      projectName: 'TestApp',
      researchDate: '2026-06-14',
      marketOverview: 'Test',
      competitors: [],
      openSourceTools: [],
      recommendations: [],
      risks: [],
      nextSteps: [],
    };
    const md = generateResearchMd(data);
    expect(md).toContain('No open source tools identified');
  });
});
