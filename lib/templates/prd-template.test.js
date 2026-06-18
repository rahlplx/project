const { describe, test, expect } = require('../jest-compat');

const { generatePrdMd } = require('./prd-template');

describe('generatePrdMd', () => {
  test('generates PRD.md with all sections', () => {
    const input = {
      projectName: 'My SaaS App',
      overview: 'Mobile-first ordering platform for restaurants',
      userStories: [
        { user: 'Restaurant owner', feature: 'manage menu', benefit: 'update offerings easily' },
        { user: 'Customer', feature: 'place orders', benefit: 'order food conveniently' },
      ],
      acceptanceCriteria: [
        'Owner can add/edit/delete menu items',
        'Customer can browse menu and checkout',
      ],
      techStack: 'Next.js + Supabase',
      performance: 'Page load < 2s',
      security: 'OAuth 2.0 + HTTPS',
      outOfScope: 'Delivery logistics',
    };

    const result = generatePrdMd(input);

    expect(result).toContain('# Product Requirements Document: My SaaS App');
    expect(result).toContain('## Overview');
    expect(result).toContain('Mobile-first ordering platform for restaurants');
    expect(result).toContain('## User Stories');
    expect(result).toContain(
      '- As a Restaurant owner, I want manage menu so that update offerings easily'
    );
    expect(result).toContain(
      '- As a Customer, I want place orders so that order food conveniently'
    );
    expect(result).toContain('## Acceptance Criteria');
    expect(result).toContain('- [ ] Owner can add/edit/delete menu items');
    expect(result).toContain('- [ ] Customer can browse menu and checkout');
    expect(result).toContain('## Technical Requirements');
    expect(result).toContain('Stack: Next.js + Supabase');
    expect(result).toContain('Performance: Page load < 2s');
    expect(result).toContain('Security: OAuth 2.0 + HTTPS');
    expect(result).toContain('## Out of Scope');
    expect(result).toContain('Delivery logistics');
  });

  test('handles missing fields with defaults', () => {
    const input = {
      projectName: 'Test Project',
    };

    const result = generatePrdMd(input);

    expect(result).toContain('# Product Requirements Document: Test Project');
    expect(result).toContain('## Overview');
    expect(result).toContain('Not specified');
  });

  test('handles empty user stories', () => {
    const input = {
      projectName: 'Test',
      userStories: [],
    };

    const result = generatePrdMd(input);

    expect(result).toContain('## User Stories');
    expect(result).not.toContain('- As a');
  });

  test('handles empty acceptance criteria', () => {
    const input = {
      projectName: 'Test',
      acceptanceCriteria: [],
    };

    const result = generatePrdMd(input);

    expect(result).toContain('## Acceptance Criteria');
    expect(result).not.toContain('- [ ]');
  });

  test('returns string', () => {
    const input = { projectName: 'Test' };
    const result = generatePrdMd(input);
    expect(typeof result).toBe('string');
  });

  test('generates valid markdown', () => {
    const input = {
      projectName: 'Test',
      overview: 'Overview text',
      userStories: [{ user: 'User', feature: 'Feature', benefit: 'Benefit' }],
      acceptanceCriteria: ['Criterion 1'],
      techStack: 'Stack',
      performance: 'Perf',
      security: 'Security',
      outOfScope: 'Scope',
    };

    const result = generatePrdMd(input);

    expect(result).toMatch(/^# .+$/m);
    expect(result).toContain('## Overview');
    expect(result).toContain('## User Stories');
    expect(result).toContain('## Acceptance Criteria');
    expect(result).toContain('## Technical Requirements');
    expect(result).toContain('## Out of Scope');
  });
});
