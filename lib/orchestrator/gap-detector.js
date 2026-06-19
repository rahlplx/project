/**
 * Gap Detector
 * Design-spec vs implementation match-rate scoring.
 * Enhanced with VibeNexus Knowledge Mesh context.
 */

const promptEngine = require('./prompt-engine');

class GapDetector {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.9;
  }

  /**
   * Calculate match rate between spec and implementation.
   * Securely injected via PromptEngine to prevent AI slop.
   */
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
      // Use PromptEngine to sanitize and verify requirement string
      const secureNeedle = promptEngine.secureInject("{{r}}", { r: needle });

      if (haystack.includes(secureNeedle)) {
        matched.push(requirement);
      } else {
        missing.push(requirement);
      }
    }

    const rate = matched.length / requirements.length;

    return {
      rate,
      matched,
      missing,
      total: requirements.length,
      status: rate >= this.threshold ? 'pass' : 'fail'
    };
  }
}

module.exports = { GapDetector };
