/**
 * Gap Detector
 * Design-spec vs implementation match-rate scoring (bkit-claude-code concept), plus
 * pre-implementation feasibility probes (vibecode-pro-max-kit concept) — same shape,
 * run at different points in the lifecycle.
 */

class GapDetector {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.9;
  }

  matchRate(designSpec, implementation) {
    const requirements = Array.isArray(designSpec.requirements) ? designSpec.requirements : [];
    if (requirements.length === 0) {
      return { rate: 1, matched: [], missing: [], total: 0 };
    }

    const haystack = String(implementation || '').toLowerCase();
    const matched = [];
    const missing = [];

    for (const requirement of requirements) {
      const needle = String(requirement).toLowerCase();
      if (haystack.includes(needle)) {
        matched.push(requirement);
      } else {
        missing.push(requirement);
      }
    }

    return {
      rate: matched.length / requirements.length,
      matched,
      missing,
      total: requirements.length
    };
  }

  needsRepair(rate, threshold = this.threshold) {
    return rate < threshold;
  }

  buildGapReport(designSpec, implementation) {
    const result = this.matchRate(designSpec, implementation);
    return {
      ...result,
      threshold: this.threshold,
      needsRepair: this.needsRepair(result.rate, this.threshold)
    };
  }

  feasibilityProbe(assumption, evidence) {
    const hasEvidence = evidence !== undefined && evidence !== null && String(evidence).trim() !== '';
    return {
      assumption,
      evidence: evidence || null,
      verified: hasEvidence,
      recommendation: hasEvidence
        ? 'Assumption has supporting evidence — safe to proceed.'
        : 'No evidence for this assumption yet — probe it before committing implementation effort.'
    };
  }
}

module.exports = { GapDetector };
