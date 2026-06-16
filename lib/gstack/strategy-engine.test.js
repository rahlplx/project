const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { StrategyEngine } = require('./strategy-engine');

describe('StrategyEngine', () => {
  let strategyEngine;

  beforeEach(() => {
    strategyEngine = new StrategyEngine();
  });

  it('should initialize with empty review history', () => {
    assert.deepStrictEqual(strategyEngine.reviewHistory, []);
  });

  it('should perform CEO review', () => {
    const thinkDoc = {
      problem: 'Test problem',
      users: ['User 1'],
      solution: 'Test solution',
      mvp: 'MVP scope',
      scope: 'Project scope'
    };

    const review = strategyEngine.ceoReview(thinkDoc);
    assert.strictEqual(review.type, 'ceo');
    assert.ok('timestamp' in review);
    assert.ok('tenStarVersion' in review);
    assert.ok('narrowWedge' in review);
    assert.ok('outOfScope' in review);
    assert.ok('recommendations' in review);
  });

  it('should evaluate 10-star version', () => {
    const thinkDoc = { solution: 'Current solution' };
    const tenStar = strategyEngine.evaluateTenStar(thinkDoc);

    assert.ok('description' in tenStar);
    assert.ok('current' in tenStar);
    assert.ok('tenStar' in tenStar);
    assert.ok('gap' in tenStar);
    assert.ok('suggestions' in tenStar);
  });

  it('should identify narrow wedge', () => {
    const thinkDoc = { mvp: 'Current MVP' };
    const wedge = strategyEngine.identifyNarrowWedge(thinkDoc);

    assert.ok('description' in wedge);
    assert.ok('current' in wedge);
    assert.ok('wedge' in wedge);
    assert.ok('criteria' in wedge);
    assert.ok('recommendation' in wedge);
  });

  it('should identify out of scope', () => {
    const thinkDoc = { scope: 'Current scope' };
    const outOfScope = strategyEngine.identifyOutOfScope(thinkDoc);

    assert.ok('description' in outOfScope);
    assert.ok('current' in outOfScope);
    assert.ok('outOfScope' in outOfScope);
    assert.ok('rationale' in outOfScope);
  });

  it('should generate CEO recommendations', () => {
    const thinkDoc = {};
    const recommendations = strategyEngine.generateCEORecommendations(thinkDoc);

    assert.ok(Array.isArray(recommendations));
    assert.ok(recommendations.length > 0);
  });

  it('should perform designer review', () => {
    const designDoc = {
      typography: { fontSize: 16 },
      color: { contrast: 7 },
      layout: { components: ['comp1'] },
      accessibility: { ariaLabels: true },
      performance: { loadTime: 2 }
    };

    const review = strategyEngine.designReview(designDoc);
    assert.strictEqual(review.type, 'designer');
    assert.ok('timestamp' in review);
    assert.ok('dimensions' in review);
    assert.ok('aiSlop' in review);
    assert.ok('improvements' in review);
    assert.ok('recommendations' in review);
  });

  it('should score design dimensions', () => {
    const designDoc = {};
    const dimensions = strategyEngine.scoreDesignDimensions(designDoc);

    assert.ok('typography' in dimensions);
    assert.ok('color' in dimensions);
    assert.ok('layout' in dimensions);
    assert.ok('accessibility' in dimensions);
    assert.ok('performance' in dimensions);
    assert.ok('overall' in dimensions);
  });

  it('should detect AI slop', () => {
    const designDoc = {};
    const aiSlop = strategyEngine.detectAISlop(designDoc);

    assert.ok('detected' in aiSlop);
    assert.ok('patterns' in aiSlop);
    assert.ok('severity' in aiSlop);
    assert.ok('suggestions' in aiSlop);
  });

  it('should suggest improvements', () => {
    const designDoc = {};
    const improvements = strategyEngine.suggestImprovements(designDoc);

    assert.ok(Array.isArray(improvements));
    assert.ok(improvements.length > 0);
  });

  it('should perform engineer review', () => {
    const designDoc = {};
    const review = strategyEngine.engineerReview(designDoc);

    assert.strictEqual(review.type, 'engineer');
    assert.ok('timestamp' in review);
    assert.ok('architecture' in review);
    assert.ok('testMatrix' in review);
    assert.ok('failureModes' in review);
    assert.ok('recommendations' in review);
  });

  it('should evaluate architecture', () => {
    const designDoc = {};
    const architecture = strategyEngine.evaluateArchitecture(designDoc);

    assert.ok('score' in architecture);
    assert.ok('maxScore' in architecture);
    assert.ok('strengths' in architecture);
    assert.ok('weaknesses' in architecture);
    assert.ok('suggestions' in architecture);
  });

  it('should define test matrix', () => {
    const designDoc = {};
    const testMatrix = strategyEngine.defineTestMatrix(designDoc);

    assert.ok('unitTests' in testMatrix);
    assert.ok('integrationTests' in testMatrix);
    assert.ok('e2eTests' in testMatrix);
    assert.ok('coverage' in testMatrix);
  });

  it('should identify failure modes', () => {
    const designDoc = {};
    const failureModes = strategyEngine.identifyFailureModes(designDoc);

    assert.ok(Array.isArray(failureModes));
    assert.ok(failureModes.length > 0);
    assert.ok('mode' in failureModes[0]);
    assert.ok('impact' in failureModes[0]);
    assert.ok('mitigation' in failureModes[0]);
  });

  it('should get review history', () => {
    const history = strategyEngine.getReviewHistory();
    assert.ok(Array.isArray(history));
  });

  it('should get latest review', () => {
    const thinkDoc = {};
    strategyEngine.ceoReview(thinkDoc);

    const latest = strategyEngine.getLatestReview();
    assert.strictEqual(latest.type, 'ceo');
  });
});
