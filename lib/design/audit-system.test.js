const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { DesignAudit } = require('./audit-system');

describe('DesignAudit', () => {
  let designAudit;

  beforeEach(() => {
    designAudit = new DesignAudit();
  });

  it('should initialize with anti-patterns list', () => {
    assert.ok(designAudit.antiPatterns.includes('generic-layouts'));
    assert.ok(designAudit.antiPatterns.includes('placeholder-content'));
    assert.ok(designAudit.antiPatterns.includes('ai-slop'));
  });

  it('should initialize with empty audit history', () => {
    assert.deepStrictEqual(designAudit.auditHistory, []);
  });

  it('should run full audit', async () => {
    const design = {
      layout: 'grid',
      content: 'lorem ipsum',
      style: 'gradient',
      typography: { fontSize: 14 },
      color: { contrast: 3 },
      components: ['comp1', 'comp2', 'comp3', 'comp4', 'comp5', 'comp6', 'comp7', 'comp8', 'comp9', 'comp10', 'comp11'],
      accessibility: { score: 5 },
      performance: { loadTime: 4 }
    };

    const audit = await designAudit.audit(design);
    assert.ok('timestamp' in audit);
    assert.ok('design' in audit);
    assert.ok('antiPatterns' in audit);
    assert.ok('scoring' in audit);
    assert.ok('improvements' in audit);
    assert.ok('report' in audit);
  });

  it('should detect anti-patterns', () => {
    const design = {
      layout: 'grid',
      content: 'lorem ipsum',
      style: 'gradient'
    };

    const antiPatterns = designAudit.detectAntiPatterns(design);
    assert.ok(Array.isArray(antiPatterns));
    assert.ok(antiPatterns.length > 0);
    assert.ok('pattern' in antiPatterns[0]);
    assert.ok('severity' in antiPatterns[0]);
    assert.ok('description' in antiPatterns[0]);
    assert.ok('solution' in antiPatterns[0]);
  });

  it('should get severity level', () => {
    assert.strictEqual(designAudit.getSeverity('ai-slop'), 'high');
    assert.strictEqual(designAudit.getSeverity('generic-layouts'), 'medium');
  });

  it('should get pattern description', () => {
    const description = designAudit.getPatternDescription('ai-slop');
    assert.strictEqual(typeof description, 'string');
    assert.ok(description.includes('AI-generated'));
  });

  it('should get pattern solution', () => {
    const solution = designAudit.getPatternSolution('ai-slop');
    assert.strictEqual(typeof solution, 'string');
    assert.ok(solution.includes('unique styling'));
  });

  it('should score design', () => {
    const design = {};
    const scoring = designAudit.scoreDesign(design);

    assert.ok('typography' in scoring);
    assert.ok('color' in scoring);
    assert.ok('layout' in scoring);
    assert.ok('accessibility' in scoring);
    assert.ok('performance' in scoring);
    assert.ok('overall' in scoring);
  });

  it('should score typography', () => {
    const design = { typography: { fontSize: 16, lineHeight: 1.5, fontFamily: 'Arial' } };
    const scoring = designAudit.scoreTypography(design);

    assert.ok('score' in scoring);
    assert.ok('maxScore' in scoring);
    assert.ok('issues' in scoring);
    assert.ok('suggestions' in scoring);
  });

  it('should score color', () => {
    const design = { color: { contrast: 7, colors: ['red', 'blue'] } };
    const scoring = designAudit.scoreColor(design);

    assert.ok('score' in scoring);
    assert.ok('maxScore' in scoring);
    assert.ok('issues' in scoring);
    assert.ok('suggestions' in scoring);
  });

  it('should score layout', () => {
    const design = { layout: 'grid', components: ['comp1'], whiteSpace: 20 };
    const scoring = designAudit.scoreLayout(design);

    assert.ok('score' in scoring);
    assert.ok('maxScore' in scoring);
    assert.ok('issues' in scoring);
    assert.ok('suggestions' in scoring);
  });

  it('should score accessibility', () => {
    const design = { accessibility: { ariaLabels: true, keyboardNavigation: true, score: 8 } };
    const scoring = designAudit.scoreAccessibility(design);

    assert.ok('score' in scoring);
    assert.ok('maxScore' in scoring);
    assert.ok('issues' in scoring);
    assert.ok('suggestions' in scoring);
  });

  it('should score performance', () => {
    const design = { performance: { loadTime: 2, imageSize: 500000 } };
    const scoring = designAudit.scorePerformance(design);

    assert.ok('score' in scoring);
    assert.ok('maxScore' in scoring);
    assert.ok('issues' in scoring);
    assert.ok('suggestions' in scoring);
  });

  it('should suggest improvements', () => {
    const design = {
      layout: 'grid',
      content: 'lorem ipsum',
      style: 'gradient'
    };

    const improvements = designAudit.suggestImprovements(design);
    assert.ok(Array.isArray(improvements));
    assert.ok(improvements.length > 0);
    assert.ok('issue' in improvements[0]);
    assert.ok('solution' in improvements[0]);
    assert.ok('priority' in improvements[0]);
  });

  it('should generate report', () => {
    const design = {
      layout: 'grid',
      content: 'lorem ipsum',
      style: 'gradient'
    };

    const report = designAudit.generateReport(design);
    assert.ok('summary' in report);
    assert.ok('details' in report);
    assert.ok('recommendations' in report);
    assert.ok('antiPatternsFound' in report.summary);
    assert.ok('overallScore' in report.summary);
  });

  it('should get audit history', () => {
    const history = designAudit.getAuditHistory();
    assert.ok(Array.isArray(history));
  });

  it('should get latest audit', async () => {
    const design = {};
    await designAudit.audit(design);

    const latest = designAudit.getLatestAudit();
    assert.ok('timestamp' in latest);
  });
});
