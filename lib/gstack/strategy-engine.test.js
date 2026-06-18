const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { StrategyEngine, MODES, PRIME_DIRECTIVES, REVIEW_SECTIONS } = require('./strategy-engine');

describe('StrategyEngine', () => {
  let strategyEngine;

  beforeEach(() => {
    strategyEngine = new StrategyEngine();
  });

  it('should initialize with empty review history', () => {
    assert.deepStrictEqual(strategyEngine.reviewHistory, []);
  });

  it('should expose the four gstack review modes', () => {
    assert.ok(MODES.SCOPE_EXPANSION);
    assert.ok(MODES.SELECTIVE_EXPANSION);
    assert.ok(MODES.HOLD_SCOPE);
    assert.ok(MODES.SCOPE_REDUCTION);
  });

  it('should expose the nine prime directives and eleven review sections', () => {
    assert.strictEqual(PRIME_DIRECTIVES.length, 9);
    assert.strictEqual(REVIEW_SECTIONS.length, 11);
  });

  it('should recommend SCOPE_EXPANSION for greenfield and HOLD_SCOPE for bugfix', () => {
    assert.strictEqual(strategyEngine.recommendMode('greenfield').name, 'SCOPE_EXPANSION');
    assert.strictEqual(strategyEngine.recommendMode('bugfix').name, 'HOLD_SCOPE');
  });

  it('should perform CEO review', () => {
    const thinkDoc = {
      problem: 'Test problem',
      users: ['User 1'],
      solution: 'Test solution',
      mvp: 'MVP scope',
      outOfScope: ['Enterprise SSO'],
      projectType: 'feature',
    };

    const review = strategyEngine.ceoReview(thinkDoc);
    assert.strictEqual(review.type, 'ceo');
    assert.ok('timestamp' in review);
    assert.ok('mode' in review);
    assert.ok('tenStarVersion' in review);
    assert.ok('narrowWedge' in review);
    assert.ok('outOfScope' in review);
    assert.ok('primeDirectiveGaps' in review);
    assert.ok('recommendations' in review);
  });

  it('should flag undeclared out-of-scope as a prime directive gap', () => {
    const review = strategyEngine.ceoReview({});
    assert.ok(review.primeDirectiveGaps.length > 0);
    assert.strictEqual(review.outOfScope.explicit, false);
  });

  it('should treat declared out-of-scope as explicit, no silent drift', () => {
    const outOfScope = strategyEngine.identifyOutOfScope({ outOfScope: ['Mobile app'] });
    assert.strictEqual(outOfScope.explicit, true);
    assert.deepStrictEqual(outOfScope.declared, ['Mobile app']);
  });

  it('should score narrow wedge criteria against the thinkDoc', () => {
    const wedge = strategyEngine.identifyNarrowWedge({
      mvp: 'x',
      problem: 'y',
      successMetrics: 'DAU +10%',
    });
    assert.strictEqual(wedge.metCount, 2);
  });

  it('should generate CEO recommendations driven by missing fields', () => {
    const recommendations = strategyEngine.generateCEORecommendations({});
    assert.ok(Array.isArray(recommendations));
    assert.ok(recommendations.some(r => r.includes('MVP')));
  });

  it('should perform designer review using the anti-slop skill', () => {
    const designDoc = { style: 'linear-gradient(purple)' };
    const review = strategyEngine.designReview(designDoc);
    assert.strictEqual(review.type, 'designer');
    assert.ok('timestamp' in review);
    assert.ok('aiSlop' in review);
    assert.ok('improvements' in review);
    assert.ok('recommendations' in review);
  });

  it('should detect AI slop by delegating to anti-slop', () => {
    const aiSlop = strategyEngine.detectAISlop({ style: 'linear-gradient(purple)' });
    assert.ok('detected' in aiSlop);
    assert.ok('violations' in aiSlop);
    assert.ok('warnings' in aiSlop);
    assert.ok('severity' in aiSlop);
  });

  it('should pass a clean design with no anti-slop violations', () => {
    const aiSlop = strategyEngine.detectAISlop({
      textColor: '#1a1a1a',
      backgroundColor: '#ffffff',
      fontSizes: [14, 16, 20, 32],
    });
    assert.strictEqual(aiSlop.detected, false);
    assert.strictEqual(aiSlop.violations.length, 0);
  });

  it('should perform engineer review', () => {
    const designDoc = {
      failureModes: [{ name: 'DB timeout', mitigation: 'retry with backoff' }],
      testCoverage: 85,
    };
    const review = strategyEngine.engineerReview(designDoc);

    assert.strictEqual(review.type, 'engineer');
    assert.ok('timestamp' in review);
    assert.ok('failureModes' in review);
    assert.ok('testCoverageGap' in review);
    assert.ok('recommendations' in review);
  });

  it('should flag unnamed failure modes when none are declared', () => {
    const failureModes = strategyEngine.identifyFailureModes({});
    assert.strictEqual(failureModes[0].named, false);
  });

  it('should evaluate test coverage against an 80% default target', () => {
    const coverage = strategyEngine.evaluateTestCoverage({ testCoverage: 60 });
    assert.strictEqual(coverage.target, 80);
    assert.strictEqual(coverage.gap, 20);
    assert.strictEqual(coverage.meetsTarget, false);
  });

  it('should build a review report with APPROVE verdict when no findings', () => {
    const report = strategyEngine.buildReviewReport([]);
    assert.strictEqual(report.verdict, 'APPROVE');
    assert.strictEqual(report.status, 'PASS');
    assert.strictEqual(report.unresolvedDecisions.length, 0);
  });

  it('should build a review report with REQUEST_CHANGES verdict on a high-severity finding', () => {
    const report = strategyEngine.buildReviewReport([
      { severity: 'high', message: 'Missing auth check' },
    ]);
    assert.strictEqual(report.verdict, 'REQUEST_CHANGES');
    assert.strictEqual(report.status, 'BLOCKED');
    assert.strictEqual(report.unresolvedDecisions.length, 1);
  });

  it('should build a review report with APPROVE_WITH_CONCERNS verdict on medium-only findings', () => {
    const report = strategyEngine.buildReviewReport([
      { severity: 'medium', message: 'Minor contrast issue' },
    ]);
    assert.strictEqual(report.verdict, 'APPROVE_WITH_CONCERNS');
    assert.strictEqual(report.status, 'CONCERNS');
  });

  it('should get review history', () => {
    const history = strategyEngine.getReviewHistory();
    assert.ok(Array.isArray(history));
  });

  it('should get latest review', () => {
    strategyEngine.ceoReview({});
    const latest = strategyEngine.getLatestReview();
    assert.strictEqual(latest.type, 'ceo');
  });
});
