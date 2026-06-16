/**
 * Role Loader
 * Implements lazy role loading from gstack to prevent token bloat
 */

const fs = require('fs');
const path = require('path');

const ROLES = {
  CEO: {
    name: 'CEO',
    description: 'Strategy, market fit, business decisions',
    tokenCost: 2000,
    phases: ['think']
  },
  Designer: {
    name: 'Designer',
    description: 'User experience, journey mapping, visual design',
    tokenCost: 1500,
    phases: ['think', 'design']
  },
  Engineer: {
    name: 'Engineer',
    description: 'Technical architecture, implementation details',
    tokenCost: 1800,
    phases: ['plan', 'break']
  },
  Architect: {
    name: 'Architect',
    description: 'System design, component structure, data flow',
    tokenCost: 2200,
    phases: ['break']
  },
  Reviewer: {
    name: 'Reviewer',
    description: 'Code review, security audit, quality assurance',
    tokenCost: 1600,
    phases: ['plan', 'review']
  },
  QA: {
    name: 'QA',
    description: 'Testing, bug detection, regression testing',
    tokenCost: 1400,
    phases: ['qa']
  },
  DevOps: {
    name: 'DevOps',
    description: 'Deployment, CI/CD, infrastructure',
    tokenCost: 1200,
    phases: ['ship']
  }
};

const PHASE_ROLES = {
  think: ['CEO', 'Designer'],
  plan: ['Engineer', 'Reviewer'],
  detect: [],
  break: ['Architect'],
  design: ['Designer'],
  build: [], // No roles during build phase
  harness: [],
  review: ['Reviewer'],
  qa: ['QA'],
  ship: ['DevOps'],
  retro: ['CEO', 'Engineer'],
  learn: [],
  evolve: ['CEO'],
  done: []
};

class RoleLoader {
  constructor() {
    this.roles = ROLES;
    this.phaseRoles = PHASE_ROLES;
    this.loadedRoles = new Set();
    this.tokenBudget = 10000; // Maximum tokens for roles
    this.usedTokens = 0;
  }

  /**
   * Load roles for specific phase
   * From gstack: Token bloat prevention
   */
  loadForPhase(phase) {
    const roleNames = this.phaseRoles[phase] || [];
    const loadedRoles = [];

    for (const roleName of roleNames) {
      const role = this.roles[roleName];
      if (role && !this.loadedRoles.has(roleName)) {
        if (this.usedTokens + role.tokenCost <= this.tokenBudget) {
          this.loadedRoles.add(roleName);
          this.usedTokens += role.tokenCost;
          loadedRoles.push(role);
        } else {
          console.warn(`Token budget exceeded for role ${roleName}`);
        }
      }
    }

    return loadedRoles;
  }

  /**
   * Unload roles when not needed
   */
  unload(roleNames) {
    for (const roleName of roleNames) {
      if (this.loadedRoles.has(roleName)) {
        this.loadedRoles.delete(roleName);
        this.usedTokens -= this.roles[roleName].tokenCost;
      }
    }
  }

  /**
   * Unload all roles
   */
  unloadAll() {
    this.loadedRoles.clear();
    this.usedTokens = 0;
  }

  /**
   * Get loaded roles
   */
  getLoadedRoles() {
    return Array.from(this.loadedRoles).map(name => this.roles[name]);
  }

  /**
   * Get token usage
   */
  getTokenUsage() {
    return {
      used: this.usedTokens,
      budget: this.tokenBudget,
      remaining: this.tokenBudget - this.usedTokens,
      percentage: Math.round((this.usedTokens / this.tokenBudget) * 100)
    };
  }

  /**
   * Get role by name
   */
  getRole(name) {
    return this.roles[name];
  }

  /**
   * Get all roles
   */
  getAllRoles() {
    return Object.values(this.roles);
  }

  /**
   * Get roles for phase
   */
  getRolesForPhase(phase) {
    return this.phaseRoles[phase] || [];
  }

  /**
   * Estimate token count from raw text (~4 chars per token).
   * Makes the tokenBudget gate measurable against real content.
   */
  estimateTokens(text) {
    return Math.ceil(String(text || '').length / 4);
  }

  /**
   * Check whether a set of texts fits within the remaining token budget.
   */
  checkContextBudget(texts = []) {
    const estimated = texts.reduce((sum, t) => sum + this.estimateTokens(t), 0);
    const remaining = this.tokenBudget - this.usedTokens;
    return {
      estimated,
      used: this.usedTokens,
      budget: this.tokenBudget,
      remaining,
      fits: estimated <= remaining
    };
  }

  /**
   * Check if role is loaded
   */
  isRoleLoaded(roleName) {
    return this.loadedRoles.has(roleName);
  }

  /**
   * Get role context for prompt
   */
  getRoleContext(roleName) {
    const role = this.roles[roleName];
    if (!role) return '';

    return `
## Role: ${role.name}

**Description:** ${role.description}

**Responsibilities:**
- Focus on ${role.description.toLowerCase()}
- Make decisions within your domain
- Escalate conflicts to orchestrator
- Provide evidence for all recommendations

**Constraints:**
- Stay within your role boundaries
- Do not implement code directly
- Provide guidance and recommendations only
`;
  }

  /**
   * Get all loaded role contexts
   */
  getLoadedRoleContexts() {
    return Array.from(this.loadedRoles)
      .map(name => this.getRoleContext(name))
      .join('\n');
  }
}

module.exports = { RoleLoader, ROLES, PHASE_ROLES };
