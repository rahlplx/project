/**
 * Trust Level
 * Formalizes the reversibility/blast-radius autonomy dial (bkit-claude-code L0-L4 concept)
 * into a queryable level instead of prose-only judgment.
 */

const RISK_TIERS = ['local-reversible', 'shared-state', 'destructive', 'irreversible-external'];

const LEVELS = {
  0: {
    id: 0,
    name: 'Manual',
    description: 'Every action needs explicit confirmation, even local reversible edits.',
    autoExecute: [],
  },
  1: {
    id: 1,
    name: 'Guided',
    description: 'Local reversible actions auto-execute; everything else needs confirmation.',
    autoExecute: ['local-reversible'],
  },
  2: {
    id: 2,
    name: 'Assisted',
    description: 'Local reversible and shared-state-but-reversible actions auto-execute.',
    autoExecute: ['local-reversible', 'shared-state'],
  },
  3: {
    id: 3,
    name: 'Autonomous',
    description: 'Auto-executes everything except destructive and irreversible-external actions.',
    autoExecute: ['local-reversible', 'shared-state'],
  },
  4: {
    id: 4,
    name: 'Full Auto',
    description: 'Auto-executes everything except irreversible-external actions.',
    autoExecute: ['local-reversible', 'shared-state', 'destructive'],
  },
};

class TrustLevel {
  constructor(level = 1) {
    this.setLevel(level);
  }

  setLevel(level) {
    if (!LEVELS[level]) {
      throw new Error(`Unknown trust level: ${level}. Valid levels: 0-4.`);
    }
    this.level = level;
    return this;
  }

  getLevel() {
    return LEVELS[this.level];
  }

  requiresConfirmation(riskTier) {
    if (!RISK_TIERS.includes(riskTier)) {
      throw new Error(`Unknown risk tier: ${riskTier}. Valid tiers: ${RISK_TIERS.join(', ')}.`);
    }
    return !LEVELS[this.level].autoExecute.includes(riskTier);
  }

  describe() {
    const current = LEVELS[this.level];
    return `Trust Level ${current.id} (${current.name}): ${current.description}`;
  }

  static getAllLevels() {
    return Object.values(LEVELS);
  }

  static getRiskTiers() {
    return [...RISK_TIERS];
  }
}

module.exports = { TrustLevel, LEVELS, RISK_TIERS };
