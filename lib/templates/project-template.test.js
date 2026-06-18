const { generateProjectMd } = require('./project-template');

describe('generateProjectMd', () => {
  test('generates PROJECT.md with all sections', () => {
    const input = {
      projectName: 'My SaaS App',
      problem: 'Small restaurants need online ordering',
      users: 'Restaurant owners',
      stakes: 'Losing customers to competitors',
      solution: 'Mobile-first ordering platform',
      mvp: 'Basic menu + ordering + payment',
      outOfScope: 'Delivery logistics',
      successMetrics: '100 orders/day in 3 months',
      techStack: 'Next.js + Supabase',
      timeline: '2 weeks',
    };

    const result = generateProjectMd(input);

    expect(result).toContain('# My SaaS App');
    expect(result).toContain('## Problem');
    expect(result).toContain('Small restaurants need online ordering');
    expect(result).toContain('## Users');
    expect(result).toContain('Restaurant owners');
    expect(result).toContain('## Stakes');
    expect(result).toContain('Losing customers to competitors');
    expect(result).toContain('## Solution');
    expect(result).toContain('Mobile-first ordering platform');
    expect(result).toContain('## MVP');
    expect(result).toContain('Basic menu + ordering + payment');
    expect(result).toContain('## Out of Scope');
    expect(result).toContain('Delivery logistics');
    expect(result).toContain('## Success Metrics');
    expect(result).toContain('100 orders/day in 3 months');
    expect(result).toContain('## Tech Stack');
    expect(result).toContain('Next.js + Supabase');
    expect(result).toContain('## Timeline');
    expect(result).toContain('2 weeks');
  });

  test('handles missing fields with defaults', () => {
    const input = {
      projectName: 'Test Project',
    };

    const result = generateProjectMd(input);

    expect(result).toContain('# Test Project');
    expect(result).toContain('## Problem');
    expect(result).toContain('Not specified');
    expect(result).toContain('## Users');
    expect(result).toContain('Not specified');
  });

  test('handles empty input', () => {
    const input = {};

    const result = generateProjectMd(input);

    expect(result).toContain('# Untitled Project');
    expect(result).toContain('## Problem');
  });

  test('returns string', () => {
    const input = { projectName: 'Test' };
    const result = generateProjectMd(input);
    expect(typeof result).toBe('string');
  });

  test('generates valid markdown', () => {
    const input = {
      projectName: 'Test',
      problem: 'Problem text',
      users: 'User text',
      stakes: 'Stakes text',
      solution: 'Solution text',
      mvp: 'MVP text',
      outOfScope: 'Scope text',
      successMetrics: 'Metrics text',
      techStack: 'Stack text',
      timeline: 'Timeline text',
    };

    const result = generateProjectMd(input);

    expect(result).toMatch(/^# .+$/m);
    expect(result).toContain('## Problem');
    expect(result).toContain('## Users');
    expect(result).toContain('## Stakes');
    expect(result).toContain('## Solution');
    expect(result).toContain('## MVP');
    expect(result).toContain('## Out of Scope');
    expect(result).toContain('## Success Metrics');
    expect(result).toContain('## Tech Stack');
    expect(result).toContain('## Timeline');
  });
});
