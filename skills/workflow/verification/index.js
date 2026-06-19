#!/usr/bin/env node

const { SkillBase } = require('../../../lib/skill-base.js');

class Verification extends SkillBase {
  constructor(config = {}) {
    super();
    this.name = 'verification';
    this.version = '1.0.0';
    this.description = 'Verifies that behavior matches the project spec and requirements';
    this.strict = config.strict || false;
  }

  verify(spec, implementation) {
    if (!spec || !implementation) {
      return { success: false, error: 'Both spec and implementation required.' };
    }

    const results = [];
    const features = spec.features || spec.requirements || [];

    for (const item of features) {
      const name = typeof item === 'string' ? item : item.name || item.description || '';
      const found = implementation.toLowerCase().includes(name.toLowerCase());
      results.push({
        requirement: name,
        passed: found,
        status: found ? 'implemented' : 'missing',
        severity: found ? 'ok' : item.priority === 'high' ? 'critical' : 'warning',
      });
    }

    const passed = results.filter(r => r.passed).length;
    const missing = results.filter(r => !r.passed);

    return {
      success: true,
      summary: `${passed}/${results.length} requirements verified`,
      score: results.length > 0 ? Math.round((passed / results.length) * 100) : 100,
      results,
      missingItems: missing.map(r => ({ requirement: r.requirement, severity: r.severity })),
      verdict: missing.some(r => r.severity === 'critical')
        ? 'FAIL'
        : missing.length === 0
          ? 'PASS'
          : 'INCOMPLETE',
      strict: this.strict,
      timestamp: new Date().toISOString(),
    };
  }

  verifyAcceptanceCriteria(spec, implementation) {
    if (!spec || !implementation) return { total: 0, passed: 0, failed: 0, items: [] };

    const items = [];
    let passed = 0;
    let failed = 0;

    for (const feature of spec.features || []) {
      const criteria = feature.acceptanceCriteria || [];
      for (const criterion of criteria) {
        const isMet = implementation.toLowerCase().includes(criterion.toLowerCase());
        items.push({
          feature: feature.name,
          criterion,
          passed: isMet,
        });
        if (isMet) passed++;
        else failed++;
      }
    }

    return { total: items.length, passed, failed, items };
  }

  verifyAgainstMilestone(milestone, codebase) {
    if (!milestone) return { total: 0, passed: 0, failed: 0, items: [] };

    const items = [];
    let passed = 0;
    let failed = 0;

    for (const task of milestone.tasks || []) {
      if (task.type === 'GREEN' || task.type === 'REFACTOR' || task.type === 'VERIFY') {
        const featureName = task.featureName || '';
        const found = codebase ? codebase.toLowerCase().includes(featureName.toLowerCase()) : false;
        items.push({
          taskId: task.id,
          featureName,
          type: task.type,
          passed: found,
        });
        if (found) passed++;
        else failed++;
      }
    }

    return {
      milestone: milestone.name || 'Unnamed Milestone',
      total: items.length,
      passed,
      failed,
      items,
      verdict: failed === 0 ? 'PASS' : 'INCOMPLETE',
    };
  }

  generateSpecDriftReport(specA, specB) {
    const getFeatureNames = spec =>
      (spec.features || []).map(f => (typeof f === 'string' ? f : f.name));
    const featuresA = getFeatureNames(specA);
    const featuresB = getFeatureNames(specB);

    const added = featuresB.filter(f => !featuresA.includes(f));
    const removed = featuresA.filter(f => !featuresB.includes(f));
    const common = featuresA.filter(f => featuresB.includes(f));

    return {
      drifted: added.length > 0 || removed.length > 0,
      added,
      removed,
      common,
      summary: `+${added.length}/-${removed.length}/${common.length} common`,
    };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = Verification;
