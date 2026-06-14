const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  parseVerifiedBy,
  parseDateFreshness,
  computeToolScore,
  computeAllToolScores,
  writeQualityScores,
  formatQualityReport
} = require('./quality-score');

function makeTool(overrides = {}) {
  return {
    name: 'test-tool',
    description: 'A test tool for quality scoring verification purposes across multiple dimensions',
    repo_url: 'https://github.com/test/test-tool',
    category: 'testing-qa',
    license: 'MIT',
    verified_by: 'community (5k+ stars)',
    verified_date: '2026-06-01',
    what_it_does: 'A tool that does something very useful for testing purposes with plenty of characters to meet all threshold requirements for good documentation scoring.',
    how_agent_uses: 'An agent can use this tool to accomplish various tasks during development and testing workflows with excellent results every time it runs.',
    in_skills: false,
    ...overrides
  };
}

function makeOpts(overrides = {}) {
  return { referenceDate: '2026-06-14', ...overrides };
}

describe('parseVerifiedBy', () => {
  test('tier1 official - microsoft', () => {
    expect(parseVerifiedBy('microsoft')).toEqual({ tier: 1, starCount: null });
  });

  test('tier1 official - google-labs', () => {
    expect(parseVerifiedBy('google-labs')).toEqual({ tier: 1, starCount: null });
  });

  test('tier1 official - anthropic', () => {
    expect(parseVerifiedBy('anthropic')).toEqual({ tier: 1, starCount: null });
  });

  test('tier2 community-vibe-stack', () => {
    expect(parseVerifiedBy('community-vibe-stack')).toEqual({ tier: 2, starCount: null });
  });

  test('tier3 with k-star count', () => {
    const result = parseVerifiedBy('community (172k+ stars)');
    expect(result.tier).toBe(3);
    expect(result.starCount).toBe(172000);
  });

  test('tier3 with decimal k-star count', () => {
    const result = parseVerifiedBy('community (5.4k+ stars)');
    expect(result.tier).toBe(3);
    expect(result.starCount).toBe(5400);
  });

  test('tier3 with installs count', () => {
    const result = parseVerifiedBy('community (250k+ installs)');
    expect(result.tier).toBe(3);
    expect(result.starCount).toBe(250000);
  });

  test('tier3 with comma in star description', () => {
    const result = parseVerifiedBy('community (2k+ stars, Cloudflare official)');
    expect(result.tier).toBe(3);
    expect(result.starCount).toBe(2000);
  });

  test('tier4 just community with growing', () => {
    const result = parseVerifiedBy('community (growing)');
    expect(result.tier).toBe(4);
    expect(result.starCount).toBeNull();
  });

  test('tier4 empty string', () => {
    const result = parseVerifiedBy('');
    expect(result.tier).toBe(4);
    expect(result.starCount).toBeNull();
  });

  test('tier4 community without stars', () => {
    const result = parseVerifiedBy('community');
    expect(result.tier).toBe(4);
    expect(result.starCount).toBeNull();
  });
});

describe('parseDateFreshness', () => {
  test('<= 30 days returns correct diff', () => {
    expect(parseDateFreshness('2026-06-01', '2026-06-14')).toBe(13);
  });

  test('31-90 days', () => {
    expect(parseDateFreshness('2026-03-15', '2026-06-14')).toBe(91);
  });

  test('91-180 days', () => {
    expect(parseDateFreshness('2026-01-15', '2026-06-14')).toBe(150);
  });

  test('181-365 days', () => {
    expect(parseDateFreshness('2025-12-01', '2026-06-14')).toBe(195);
  });

  test('> 365 days', () => {
    expect(parseDateFreshness('2024-01-01', '2026-06-14')).toBe(895);
  });

  test('same date returns 0', () => {
    expect(parseDateFreshness('2026-06-14', '2026-06-14')).toBe(0);
  });
});

describe('maintenance scoring', () => {
  test('MIT license scores 10', () => {
    const result = computeToolScore(makeTool(), makeOpts());
    expect(result.scores.maintenance.details.license.score).toBe(10);
  });

  test('Apache 2.0 license scores 10', () => {
    const tool = makeTool({ license: 'Apache 2.0' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.maintenance.details.license.score).toBe(10);
  });

  test('Proprietary license scores 5', () => {
    const tool = makeTool({ license: 'Proprietary (free tier)' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.maintenance.details.license.score).toBe(5);
  });

  test('in_skills adds 10', () => {
    const tool = makeTool({ in_skills: true });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.maintenance.details.in_skills.score).toBe(10);
  });

  test('description quality both > 80 chars scores 5', () => {
    const result = computeToolScore(makeTool(), makeOpts());
    expect(result.scores.maintenance.details.description_quality.score).toBe(5);
  });

  test('skill_path adds 5', () => {
    const tool = makeTool({ skill_path: 'skills/deploy/one-click-vercel/' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.maintenance.details.skill_path.score).toBe(5);
  });
});

describe('docs scoring', () => {
  test('what_it_does >= 200 chars scores 10', () => {
    const tool = makeTool({
      what_it_does: 'x'.repeat(200),
      how_agent_uses: 'short'
    });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.docs.details.what_it_does.score).toBe(10);
  });

  test('what_it_does >= 100 chars scores 7', () => {
    const tool = makeTool({
      what_it_does: 'x'.repeat(100),
      how_agent_uses: 'short'
    });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.docs.details.what_it_does.score).toBe(7);
  });

  test('what_it_does >= 50 chars scores 4', () => {
    const tool = makeTool({
      what_it_does: 'x'.repeat(50),
      how_agent_uses: 'short'
    });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.docs.details.what_it_does.score).toBe(4);
  });

  test('how_agent_uses >= 200 chars scores 10', () => {
    const tool = makeTool({
      what_it_does: 'short',
      how_agent_uses: 'y'.repeat(200)
    });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.docs.details.how_agent_uses.score).toBe(10);
  });

  test('description >= 100 chars scores 5', () => {
    const tool = makeTool({ description: 'z'.repeat(100) });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.docs.details.description.score).toBe(5);
  });
});

describe('community scoring', () => {
  test('>= 100k stars scores 15', () => {
    const tool = makeTool({ verified_by: 'community (100k+ stars)' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.community.details.star_count.score).toBe(15);
  });

  test('>= 5k stars scores 7', () => {
    const tool = makeTool({ verified_by: 'community (5k+ stars)' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.community.details.star_count.score).toBe(7);
  });

  test('in_skills adds 5', () => {
    const tool = makeTool({ in_skills: true });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.community.details.in_skills.score).toBe(5);
  });
});

describe('trustworthiness scoring', () => {
  test('tier1 official scores 15', () => {
    const tool = makeTool({ verified_by: 'microsoft' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.trustworthiness.score).toBe(15);
  });

  test('tier2 community-vibe-stack scores 12', () => {
    const tool = makeTool({ verified_by: 'community-vibe-stack' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.trustworthiness.score).toBe(12);
  });

  test('tier3 community stars scores 8', () => {
    const tool = makeTool({ verified_by: 'community (50k+ stars)' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.trustworthiness.score).toBe(8);
  });

  test('tier4 community (no stars) scores 5', () => {
    const tool = makeTool({ verified_by: 'community' });
    const result = computeToolScore(tool, makeOpts());
    expect(result.scores.trustworthiness.score).toBe(5);
  });
});

describe('freshness scoring', () => {
  test('<= 30 days scores 10', () => {
    const tool = makeTool({ verified_date: '2026-06-14' });
    const result = computeToolScore(tool, { referenceDate: '2026-06-14' });
    expect(result.scores.freshness.score).toBe(10);
  });

  test('31-90 days scores 8', () => {
    const tool = makeTool({ verified_date: '2026-04-01' });
    const result = computeToolScore(tool, { referenceDate: '2026-06-14' });
    expect(result.scores.freshness.score).toBe(8);
  });

  test('91-180 days scores 6', () => {
    const tool = makeTool({ verified_date: '2026-01-15' });
    const result = computeToolScore(tool, { referenceDate: '2026-06-14' });
    expect(result.scores.freshness.score).toBe(6);
  });

  test('> 365 days scores 0', () => {
    const tool = makeTool({ verified_date: '2024-01-01' });
    const result = computeToolScore(tool, { referenceDate: '2026-06-14' });
    expect(result.scores.freshness.score).toBe(0);
  });
});

describe('total aggregation', () => {
  test('full score for high-quality tool', () => {
    const tool = makeTool({
      name: 'High Quality Tool',
      license: 'MIT',
      verified_by: 'community (200k+ stars)',
      verified_date: '2026-06-14',
      in_skills: true,
      skill_path: 'skills/some-path/',
      what_it_does: 'x'.repeat(200),
      how_agent_uses: 'y'.repeat(200),
      description: 'z'.repeat(100)
    });
    const result = computeToolScore(tool, { referenceDate: '2026-06-14' });
    expect(result.total_score).toBe(93);
    expect(result.grade).toBe('A');
  });

  test('minimum score for empty tool', () => {
    const tool = {
      name: 'Empty Tool',
      description: '',
      license: '',
      verified_by: '',
      verified_date: '2024-01-01',
      what_it_does: '',
      how_agent_uses: '',
      in_skills: false
    };
    const result = computeToolScore(tool, { referenceDate: '2026-06-14' });
    expect(result.total_score).toBe(5);
    expect(result.grade).toBe('D');
  });

  test('realistic entry like OpenCode', () => {
    const tool = makeTool({
      name: 'OpenCode',
      license: 'MIT',
      verified_by: 'community (172k+ stars)',
      verified_date: '2026-06-01',
      what_it_does: 'Your AI coding partner. Describe what you want to build, and OpenCode writes the code, edits files, runs tests. Works with Claude, GPT, Gemini, or any model you choose. Free, open source, privacy-first.',
      how_agent_uses: 'Run opencode in headless/background mode. Pass the vibe coder\'s request as a task. Return the result: "Done. I built your API endpoint. Here\'s what it does and how to test it."',
      description: 'The most-starred open-source AI coding agent (172k+ stars). Terminal-native, works with any editor, supports 75+ model providers.',
      in_skills: false
    });
    const result = computeToolScore(tool, { referenceDate: '2026-06-14' });
    expect(result.name).toBe('OpenCode');
    expect(result.scores.maintenance.score).toBe(15);
    expect(result.scores.trustworthiness.score).toBe(8);
    expect(result.total_score).toBeGreaterThanOrEqual(50);
    expect(result.evidence).toBeDefined();
  });

  test('all 35 tools from catalog', () => {
    const result = computeAllToolScores(
      path.resolve(__dirname, '..', 'catalog', 'tools.yaml'),
      { referenceDate: '2026-06-14' }
    );
    expect(result.tool_count).toBe(35);
    expect(result.tools).toHaveLength(35);
    expect(result.summary.mean).toBeGreaterThan(0);
    expect(result.summary.median).toBeGreaterThan(0);
    expect(result.summary.min).toBeGreaterThanOrEqual(0);
    expect(result.summary.max).toBeLessThanOrEqual(100);
    expect(result.summary.distribution.A + result.summary.distribution.B + result.summary.distribution.C + result.summary.distribution.D).toBe(35);
  });
});

describe('formatQualityReport', () => {
  test('formats empty result', () => {
    const empty = {
      date_computed: '2026-06-14',
      tool_count: 0,
      tools: [],
      summary: { mean: 0, median: 0, min: 0, max: 0, stddev: 0, distribution: { A: 0, B: 0, C: 0, D: 0 } }
    };
    const report = formatQualityReport(empty);
    expect(report).toContain('Quality Score Report');
    expect(report).toContain('0');
  });

  test('formats result with tools', () => {
    const data = {
      date_computed: '2026-06-14',
      tool_count: 2,
      tools: [
        {
          name: 'Tool A',
          total_score: 85,
          grade: 'B',
          scores: {
            maintenance: { score: 25, max: 30 },
            docs: { score: 20, max: 25 },
            community: { score: 15, max: 20 },
            trustworthiness: { score: 15, max: 15 },
            freshness: { score: 10, max: 10 }
          }
        },
        {
          name: 'Tool B',
          total_score: 45,
          grade: 'D',
          scores: {
            maintenance: { score: 10, max: 30 },
            docs: { score: 10, max: 25 },
            community: { score: 10, max: 20 },
            trustworthiness: { score: 5, max: 15 },
            freshness: { score: 10, max: 10 }
          }
        }
      ],
      summary: { mean: 65, median: 65, min: 45, max: 85, stddev: 20, distribution: { A: 0, B: 1, C: 0, D: 1 } }
    };
    const report = formatQualityReport(data);
    expect(report).toContain('Tool A');
    expect(report).toContain('Tool B');
    expect(report).toContain('85');
    expect(report).toContain('45');
  });
});

describe('writeQualityScores', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-test-'));

  test('writes valid JSON file', () => {
    const results = {
      date_computed: '2026-06-14',
      tool_count: 1,
      tools: [{
        name: 'Test',
        total_score: 50,
        grade: 'C',
        scores: { maintenance: { score: 10, max: 30 }, docs: { score: 10, max: 25 }, community: { score: 10, max: 20 }, trustworthiness: { score: 10, max: 15 }, freshness: { score: 10, max: 10 } }
      }],
      summary: { mean: 50, median: 50, min: 50, max: 50, stddev: 0, distribution: { A: 0, B: 0, C: 1, D: 0 } }
    };
    const outPath = path.join(tmpDir, 'quality-scores.json');
    writeQualityScores(results, outPath);
    const content = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    expect(content._meta.schema_version).toBe('1.0.0');
    expect(content.tools).toHaveLength(1);
    expect(content.summary.mean).toBe(50);
  });

  test('writes to catalog/quality-scores.json', () => {
    const results = {
      date_computed: '2026-06-14',
      tool_count: 0,
      tools: [],
      summary: { mean: 0, median: 0, min: 0, max: 0, stddev: 0, distribution: { A: 0, B: 0, C: 0, D: 0 } }
    };
    const outPath = path.resolve(__dirname, '..', 'catalog', 'quality-scores.json');
    writeQualityScores(results, outPath);
    const content = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    expect(content._meta.schema_version).toBe('1.0.0');
    expect(content._meta.score_dimensions).toBeDefined();
    expect(content.tools).toEqual([]);
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
