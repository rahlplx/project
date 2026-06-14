const { captureIntent, SMART_DEFAULTS } = require('./intent-capture');

describe('captureIntent', () => {
  test('returns PROJECT.md and PRD.md for complete input', () => {
    const input = {
      projectName: 'My SaaS',
      problem: 'Problem text',
      users: 'User text',
      stakes: 'Stakes text',
      solution: 'Solution text',
      mvp: 'MVP text',
      outOfScope: 'Scope text',
      successMetrics: 'Metrics text',
      techStack: 'Stack text',
      timeline: 'Timeline text'
    };

    const result = captureIntent(input);

    expect(result.projectMd).toContain('# My SaaS');
    expect(result.projectMd).toContain('## Problem');
    expect(result.prdMd).toContain('# Product Requirements Document: My SaaS');
    expect(result.prdMd).toContain('## Overview');
  });

  test('applies smart defaults for missing fields', () => {
    const input = {
      projectName: 'Test Project'
    };

    const result = captureIntent(input);

    expect(result.projectMd).toContain('# Test Project');
    expect(result.projectMd).toContain('Not specified');
    expect(result.prdMd).toContain('# Product Requirements Document: Test Project');
  });

  test('detects SaaS project type and applies defaults', () => {
    const input = {
      projectName: 'My SaaS App'
    };

    const result = captureIntent(input);

    expect(result.projectType).toBe('saas');
    expect(result.defaults.techStack).toBe('Next.js + Supabase');
    expect(result.defaults.timeline).toBe('2 weeks');
  });

  test('detects API project type', () => {
    const input = {
      projectName: 'My API Service'
    };

    const result = captureIntent(input);

    expect(result.projectType).toBe('api');
    expect(result.defaults.techStack).toBe('Node.js + PostgreSQL');
  });

  test('detects CLI project type', () => {
    const input = {
      projectName: 'My CLI Tool'
    };

    const result = captureIntent(input);

    expect(result.projectType).toBe('cli');
    expect(result.defaults.techStack).toBe('Node.js + oclif');
  });

  test('handles skip for all fields', () => {
    const input = {
      projectName: 'Skipped Project',
      skip: true
    };

    const result = captureIntent(input);

    expect(result.projectMd).toContain('# Skipped Project');
    expect(result.projectMd).toContain('Not specified');
    expect(result.prdMd).toContain('# Product Requirements Document: Skipped Project');
  });

  test('returns project type and defaults', () => {
    const input = { projectName: 'Test' };
    const result = captureIntent(input);
    expect(result).toHaveProperty('projectType');
    expect(result).toHaveProperty('defaults');
  });

  test('returns valid markdown', () => {
    const input = { projectName: 'Test' };
    const result = captureIntent(input);
    expect(result.projectMd).toMatch(/^# .+$/m);
    expect(result.prdMd).toMatch(/^# .+$/m);
  });
});

describe('SMART_DEFAULTS', () => {
  test('has defaults for all project types', () => {
    expect(SMART_DEFAULTS).toHaveProperty('saas');
    expect(SMART_DEFAULTS).toHaveProperty('api');
    expect(SMART_DEFAULTS).toHaveProperty('cli');
    expect(SMART_DEFAULTS).toHaveProperty('extension');
    expect(SMART_DEFAULTS).toHaveProperty('mobile');
    expect(SMART_DEFAULTS).toHaveProperty('agent');
  });

  test('each type has techStack, timeline, and mvp', () => {
    Object.values(SMART_DEFAULTS).forEach(defaults => {
      expect(defaults).toHaveProperty('techStack');
      expect(defaults).toHaveProperty('timeline');
      expect(defaults).toHaveProperty('mvp');
    });
  });
});
