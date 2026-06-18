'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  captureIntent,
  SMART_DEFAULTS,
  validateInput,
  sanitizeText,
  sanitizeProjectName,
  intentConfidence,
  detectProjectType,
} = require('./intent-capture');

describe('captureIntent', () => {
  it('returns PROJECT.md and PRD.md for complete input', () => {
    const result = captureIntent({
      projectName: 'My SaaS',
      problem: 'Problem text',
      users: 'User text',
      stakes: 'Stakes text',
      solution: 'Solution text',
      mvp: 'MVP text',
      outOfScope: 'Scope text',
      successMetrics: 'Metrics text',
      techStack: 'Stack text',
      timeline: 'Timeline text',
    });
    assert.ok(result.projectMd.includes('# My SaaS'));
    assert.ok(result.prdMd.includes('My SaaS'));
  });

  it('applies smart defaults for missing fields', () => {
    const result = captureIntent({ projectName: 'Test Project' });
    assert.ok(result.projectMd.includes('# Test Project'));
    assert.ok(result.projectMd.includes('Not specified'));
  });

  it('detects SaaS project type and applies defaults', () => {
    const result = captureIntent({ projectName: 'My SaaS App' });
    assert.strictEqual(result.projectType, 'saas');
    assert.strictEqual(result.defaults.techStack, 'Next.js + Supabase');
  });

  it('detects API project type', () => {
    const result = captureIntent({ projectName: 'My API Service' });
    assert.strictEqual(result.projectType, 'api');
    assert.strictEqual(result.defaults.techStack, 'Node.js + PostgreSQL');
  });

  it('detects CLI project type', () => {
    const result = captureIntent({ projectName: 'My CLI Tool' });
    assert.strictEqual(result.projectType, 'cli');
  });

  it('returns projectType and defaults properties', () => {
    const result = captureIntent({ projectName: 'Test' });
    assert.ok('projectType' in result);
    assert.ok('defaults' in result);
  });
});

describe('SMART_DEFAULTS', () => {
  it('has defaults for all project types', () => {
    for (const t of ['saas', 'api', 'cli', 'extension', 'mobile', 'agent']) {
      assert.ok(t in SMART_DEFAULTS, `missing type: ${t}`);
    }
  });

  it('each type has techStack, timeline, and mvp', () => {
    for (const d of Object.values(SMART_DEFAULTS)) {
      assert.ok('techStack' in d);
      assert.ok('timeline' in d);
      assert.ok('mvp' in d);
    }
  });
});

describe('validateInput', () => {
  it('rejects empty project name', () => {
    const r = validateInput({ projectName: '' });
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.includes('Project name is required'));
  });

  it('rejects missing project name', () => {
    const r = validateInput({ problem: 'text' });
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.includes('Project name is required'));
  });

  it('rejects special characters in project name', () => {
    const r = validateInput({ projectName: 'Bad!@#' });
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('only contain letters')));
  });

  it('rejects project name longer than 100 chars', () => {
    const r = validateInput({ projectName: 'A'.repeat(101) });
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('100 characters')));
  });

  it('rejects long text fields', () => {
    const r = validateInput({ projectName: 'Test', problem: 'A'.repeat(2001) });
    assert.strictEqual(r.valid, false);
  });

  it('accepts valid complete input', () => {
    const r = validateInput({ projectName: 'My SaaS App - v2', problem: 'Valid' });
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.errors.length, 0);
  });

  it('allows spaces and hyphens in project name', () => {
    const r = validateInput({ projectName: 'My App - v2' });
    assert.strictEqual(r.valid, true);
  });
});

describe('sanitizeText', () => {
  it('strips control characters', () => {
    assert.strictEqual(sanitizeText('Hello\x00World\x1F'), 'HelloWorld');
  });

  it('trims and truncates to maxLength', () => {
    const result = sanitizeText('  ' + 'A'.repeat(2100) + '  ');
    assert.strictEqual(result.length, 2000);
  });

  it('returns empty string for non-string input', () => {
    assert.strictEqual(sanitizeText(null), '');
    assert.strictEqual(sanitizeText(42), '');
  });
});

describe('sanitizeProjectName', () => {
  it('trims whitespace', () => {
    assert.strictEqual(sanitizeProjectName('  My App  '), 'My App');
  });

  it('removes special characters', () => {
    assert.strictEqual(sanitizeProjectName('My App!@#$%'), 'My App');
  });

  it('truncates to 100 characters', () => {
    assert.strictEqual(sanitizeProjectName('A'.repeat(150)).length, 100);
  });

  it('handles empty string', () => {
    assert.strictEqual(sanitizeProjectName(''), '');
  });
});

describe('intentConfidence', () => {
  it('empty object returns score < 0.3', () => {
    const r = intentConfidence({});
    assert.ok(r.score < 0.3, `score was ${r.score}`);
  });

  it('fully specified object returns score > 0.7', () => {
    const r = intentConfidence({
      problem: 'Real problem',
      users: 'Real users',
      solution: 'Real solution',
      mvp: 'Real MVP',
      outOfScope: 'Real out of scope',
      successMetrics: 'Real metrics',
      techStack: 'Next.js',
    });
    assert.ok(r.score > 0.7, `score was ${r.score}`);
  });

  it('returns score, specified, missing, label fields', () => {
    const r = intentConfidence({ problem: 'x' });
    assert.ok('score' in r);
    assert.ok('specified' in r);
    assert.ok('missing' in r);
    assert.ok('label' in r);
  });

  it('label is "low" for empty input', () => {
    assert.strictEqual(intentConfidence({}).label, 'low');
  });

  it('label is "high" for fully specified input', () => {
    const r = intentConfidence({
      problem: 'p',
      users: 'u',
      solution: 's',
      mvp: 'm',
      successMetrics: 'sm',
      techStack: 'ts',
    });
    assert.strictEqual(r.label, 'high');
  });
});

describe('detectProjectType', () => {
  it('defaults to "saas" for no matching keywords', () => {
    assert.strictEqual(detectProjectType('unknown project xyz'), 'saas');
  });

  it('returns "api" for "api" keyword', () => {
    assert.strictEqual(detectProjectType('REST api gateway'), 'api');
  });

  it('returns "cli" for "cli" keyword', () => {
    assert.strictEqual(detectProjectType('cli command runner'), 'cli');
  });

  it('returns "agent" for "agent" keyword', () => {
    assert.strictEqual(detectProjectType('my agent'), 'agent');
  });

  it('returns "extension" for "extension" keyword', () => {
    assert.strictEqual(detectProjectType('browser extension'), 'extension');
  });
});
