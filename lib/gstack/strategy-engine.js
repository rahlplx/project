/**
 * Strategy Engine
 * Faithful port of gstack's plan-ceo-review / plan-design-review / plan-eng-review
 * (https://github.com/garrytan/gstack)
 */

const AntiSlopSkill = require('../../skills/design/anti-slop');

const MODES = {
  SCOPE_EXPANSION: {
    name: 'SCOPE_EXPANSION',
    posture: 'Dream ambitious. Surface 10x visions individually.',
    output: 'Expanded scope via multiple user approvals.',
  },
  SELECTIVE_EXPANSION: {
    name: 'SELECTIVE_EXPANSION',
    posture: 'Hold baseline scope, cherry-pick opportunities.',
    output: 'Scope + selected expansions.',
  },
  HOLD_SCOPE: {
    name: 'HOLD_SCOPE',
    posture: 'Bulletproof the plan as-is. Maximum rigor.',
    output: 'Rigorous review findings, no scope changes.',
  },
  SCOPE_REDUCTION: {
    name: 'SCOPE_REDUCTION',
    posture: 'Ruthless minimalism. Absolute core that ships value.',
    output: 'Stripped plan, maximum focus.',
  },
};

const PRIME_DIRECTIVES = [
  'Zero silent failures — every failure mode must be visible to system, team, and user.',
  'Every error has a name — name the specific exception, trigger, handler, user impact, test status.',
  'Data flows have shadow paths — map nil input, empty/zero-length input, upstream error alongside happy path.',
  'Interactions have edge cases — double-click, navigate-away, slow connection, stale state, back button.',
  'Observability is scope — new dashboards, alerts, runbooks are first-class deliverables.',
  'Diagrams are mandatory — for every data flow, state machine, pipeline, dependency graph, decision tree.',
  "Everything deferred must be written down — vague intentions are lies; TODOS.md or it doesn't exist.",
  "Optimize for the 6-month future — solve today's problem without creating next quarter's nightmare.",
  'Permission to reject and reframe — if a fundamentally better approach exists, table it.',
];

const REVIEW_SECTIONS = [
  'System Architecture',
  'Data Model & Persistence',
  'Error & Exception Handling',
  'Security & Privacy Threat Model',
  'Performance & Scale',
  'Deployment & Operations',
  'Testing Strategy',
  'API & Contract Changes',
  'User-Facing Flows & Edge Cases',
  'Design System & Visual Consistency',
  'Documentation & Runbooks',
];

// Context-dependent mode defaults (gstack: "greenfield -> EXPANSION, bug fix -> HOLD_SCOPE")
const MODE_DEFAULTS = {
  greenfield: 'SCOPE_EXPANSION',
  feature: 'SELECTIVE_EXPANSION',
  bugfix: 'HOLD_SCOPE',
  refactor: 'HOLD_SCOPE',
  deadline: 'SCOPE_REDUCTION',
};

class StrategyEngine {
  constructor() {
    this.reviewHistory = [];
    this.antiSlop = new AntiSlopSkill();
  }

  /**
   * Recommend a review mode from project context.
   * gstack Step 0F: context-dependent defaults; user always has final say.
   */
  recommendMode(projectType) {
    const key = MODE_DEFAULTS[projectType] || 'SELECTIVE_EXPANSION';
    return MODES[key];
  }

  /**
   * CEO Review
   * From gstack: /plan-ceo-review
   */
  ceoReview(thinkDoc = {}) {
    const review = {
      type: 'ceo',
      timestamp: new Date().toISOString(),
      mode: this.recommendMode(thinkDoc.projectType),
      tenStarVersion: this.evaluateTenStar(thinkDoc),
      narrowWedge: this.identifyNarrowWedge(thinkDoc),
      outOfScope: this.identifyOutOfScope(thinkDoc),
      primeDirectiveGaps: this.checkPrimeDirectives(thinkDoc),
      recommendations: this.generateCEORecommendations(thinkDoc),
    };

    this.reviewHistory.push(review);
    return review;
  }

  /**
   * Evaluate 10-star version — derived from what's actually present/missing in thinkDoc.
   */
  evaluateTenStar(thinkDoc) {
    const gaps = [];
    if (!thinkDoc.successMetrics) gaps.push('No success metrics defined');
    if (!thinkDoc.userJourney) gaps.push('No user journey mapped');
    if (!thinkDoc.delightMoments) gaps.push('No delight/exceeds-expectations moments identified');

    return {
      description: 'What does the 10-star version look like?',
      current: thinkDoc.solution || 'Not defined',
      gap: gaps.length ? gaps : ['Solution is well-specified toward a 10-star outcome'],
      suggestions: gaps,
    };
  }

  /**
   * Identify narrow wedge — flags missing MVP definition rather than inventing one.
   */
  identifyNarrowWedge(thinkDoc) {
    const criteria = [
      { check: 'Can be built in 1-2 weeks', met: !!thinkDoc.timeboxed },
      { check: 'Solves a real problem', met: !!thinkDoc.problem },
      { check: 'Has measurable success metrics', met: !!thinkDoc.successMetrics },
      { check: 'Can be iterated based on feedback', met: !!thinkDoc.feedbackLoop },
    ];

    return {
      description: 'What is the narrowest wedge that proves demand?',
      current: thinkDoc.mvp || 'Not defined',
      criteria,
      metCount: criteria.filter(c => c.met).length,
      recommendation: thinkDoc.mvp
        ? 'MVP defined — verify it against the criteria above before building.'
        : 'Define a narrow MVP before proceeding to plan/break.',
    };
  }

  /**
   * Identify out of scope — surfaces explicit scope.outOfScope if present,
   * otherwise flags that scope was never made explicit (gstack: "silent scope drift" is the failure mode).
   */
  identifyOutOfScope(thinkDoc) {
    const declared = Array.isArray(thinkDoc.outOfScope) ? thinkDoc.outOfScope : [];
    return {
      description: 'What is definitely OUT of scope for this version?',
      declared,
      explicit: declared.length > 0,
      rationale: declared.length
        ? 'Deferred items are written down — no silent scope drift.'
        : 'No out-of-scope items declared. Per gstack Prime Directive 7, undeclared deferrals are a violation.',
    };
  }

  /**
   * Check thinkDoc against the Nine Prime Directives, returning which are unmet.
   */
  checkPrimeDirectives(thinkDoc) {
    const checks = [
      {
        directive: PRIME_DIRECTIVES[0],
        met: Array.isArray(thinkDoc.failureModes) && thinkDoc.failureModes.length > 0,
      },
      { directive: PRIME_DIRECTIVES[2], met: !!thinkDoc.shadowPaths },
      { directive: PRIME_DIRECTIVES[4], met: !!thinkDoc.observability },
      {
        directive: PRIME_DIRECTIVES[6],
        met: Array.isArray(thinkDoc.outOfScope) && thinkDoc.outOfScope.length > 0,
      },
    ];
    return checks.filter(c => !c.met).map(c => c.directive);
  }

  generateCEORecommendations(thinkDoc) {
    const recs = [];
    if (!thinkDoc.mvp) recs.push('Define a narrow MVP wedge before planning.');
    if (!Array.isArray(thinkDoc.outOfScope) || !thinkDoc.outOfScope.length) {
      recs.push('Explicitly declare what is out of scope to prevent silent drift.');
    }
    if (!thinkDoc.successMetrics) recs.push('Define measurable success metrics.');
    if (!recs.length) recs.push('Plan is well-formed — proceed to mode selection (Step 0F).');
    return recs;
  }

  /**
   * Designer Review
   * From gstack: /plan-design-review
   * AI-slop detection composes with the anti-slop skill instead of re-implementing it.
   */
  designReview(designDoc = {}) {
    const review = {
      type: 'designer',
      timestamp: new Date().toISOString(),
      aiSlop: this.detectAISlop(designDoc),
      improvements: this.suggestImprovements(designDoc),
      recommendations: this.generateDesignerRecommendations(designDoc),
    };

    this.reviewHistory.push(review);
    return review;
  }

  /**
   * Detect AI slop by delegating to the anti-slop skill (composition, not duplication).
   */
  detectAISlop(designDoc) {
    const result = this.antiSlop.analyze(designDoc);
    return {
      detected: !result.passed,
      violations: result.violations,
      warnings: result.warnings,
      severity:
        result.violations.length > 0 ? 'high' : result.warnings.length > 0 ? 'medium' : 'none',
    };
  }

  suggestImprovements(designDoc) {
    const slop = this.detectAISlop(designDoc);
    return [...slop.violations, ...slop.warnings].map(v => v.fix).filter(Boolean);
  }

  generateDesignerRecommendations(designDoc) {
    const slop = this.detectAISlop(designDoc);
    if (slop.detected) {
      return [
        'Resolve anti-slop findings before shipping.',
        'Test with real users.',
        'Iterate based on feedback.',
      ];
    }
    return [
      'Design passes anti-slop checks.',
      'Test with real users.',
      'Iterate based on feedback.',
    ];
  }

  /**
   * Engineer Review
   * From gstack: /plan-eng-review
   */
  engineerReview(designDoc = {}) {
    const review = {
      type: 'engineer',
      timestamp: new Date().toISOString(),
      failureModes: this.identifyFailureModes(designDoc),
      testCoverageGap: this.evaluateTestCoverage(designDoc),
      recommendations: this.generateEngineerRecommendations(designDoc),
    };

    this.reviewHistory.push(review);
    return review;
  }

  /**
   * Identify failure modes — uses declared failureModes if present (Prime Directive 1/2:
   * "every error has a name"), otherwise flags the gap rather than inventing examples.
   */
  identifyFailureModes(designDoc) {
    if (Array.isArray(designDoc.failureModes) && designDoc.failureModes.length) {
      return designDoc.failureModes.map(mode => ({
        mode: mode.name || mode,
        named: !!mode.name,
        mitigation:
          mode.mitigation || 'Not specified — violates Prime Directive 2 (every error has a name).',
      }));
    }
    return [
      {
        mode: 'UNNAMED',
        named: false,
        mitigation:
          'No failure modes declared — violates Prime Directive 1 (zero silent failures).',
      },
    ];
  }

  evaluateTestCoverage(designDoc) {
    const target = designDoc.testCoverageTarget || 80;
    const current = typeof designDoc.testCoverage === 'number' ? designDoc.testCoverage : 0;
    return { target, current, gap: Math.max(0, target - current), meetsTarget: current >= target };
  }

  generateEngineerRecommendations(designDoc) {
    const recs = [];
    const coverage = this.evaluateTestCoverage(designDoc);
    if (!coverage.meetsTarget) {
      recs.push(
        `Increase test coverage by ${coverage.gap} points to meet the ${coverage.target}% target.`
      );
    }
    if (!Array.isArray(designDoc.failureModes) || !designDoc.failureModes.length) {
      recs.push('Name every failure mode explicitly (Prime Directive 2).');
    }
    if (!recs.length) recs.push('Architecture meets test coverage and failure-mode-naming bars.');
    return recs;
  }

  /**
   * Build the terminal "GSTACK REVIEW REPORT" with a findings table and verdict,
   * matching gstack's required output format.
   */
  buildReviewReport(findings = []) {
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const f of findings) {
      if (bySeverity[f.severity] !== undefined) bySeverity[f.severity]++;
    }

    let verdict = 'APPROVE';
    if (bySeverity.critical > 0 || bySeverity.high > 0) verdict = 'REQUEST_CHANGES';
    else if (bySeverity.medium > 0) verdict = 'APPROVE_WITH_CONCERNS';

    return {
      status:
        verdict === 'APPROVE' ? 'PASS' : verdict === 'REQUEST_CHANGES' ? 'BLOCKED' : 'CONCERNS',
      findings,
      verdict,
      unresolvedDecisions: findings.filter(f => f.severity === 'critical' || f.severity === 'high'),
    };
  }

  /**
   * Get review history
   */
  getReviewHistory() {
    return this.reviewHistory;
  }

  /**
   * Get latest review
   */
  getLatestReview() {
    return this.reviewHistory[this.reviewHistory.length - 1];
  }
}

module.exports = { StrategyEngine, MODES, PRIME_DIRECTIVES, REVIEW_SECTIONS };
