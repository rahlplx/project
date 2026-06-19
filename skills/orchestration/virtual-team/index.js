#!/usr/bin/env node
const { SkillBase } = require('../../../lib/skill-base.js');

class VirtualTeam extends SkillBase {
  constructor() {
    super();
    this.name = 'virtual-team';
    this.version = '1.0.0';
    this.description = 'Role-based specialist agents for different perspectives';
  }

  assign(role, task) {
    const roles = {
      ceo: {
        title: 'CEO',
        focus: 'Strategy, market fit, business value',
        style: 'Big picture. Asks: "Does this solve a real problem?"',
      },
      designer: {
        title: 'Designer',
        focus: 'UX, visual quality, consistency',
        style: 'Visual and user-focused. Asks: "How does this feel?"',
      },
      engineer: {
        title: 'Engineer',
        focus: 'Architecture, performance, maintainability',
        style: 'Technical and pragmatic. Asks: "Will this scale?"',
      },
      qa: {
        title: 'QA Engineer',
        focus: 'Edge cases, error handling, test coverage',
        style: 'Detail-oriented. Asks: "What could break?"',
      },
      security: {
        title: 'Security Engineer',
        focus: 'Vulnerabilities, auth, data protection',
        style: 'Cautious. Asks: "Is this safe?"',
      },
    };

    const roleInfo = roles[role];
    if (!roleInfo) {
      return { error: `Unknown role: ${role}. Available: ${Object.keys(roles).join(', ')}` };
    }

    return {
      assigned: true,
      role: roleInfo.title,
      focus: roleInfo.focus,
      style: roleInfo.style,
      task,
      response: this._generateResponse(role, task),
      timestamp: new Date().toISOString(),
    };
  }

  _generateResponse(role, task) {
    const responses = {
      ceo: `Strategy review for "${task}": Does this ship value to users? What's the simplest path to market?`,
      designer: `Design review for "${task}": Check consistency, spacing, color harmony, and user flow.`,
      engineer: `Tech review for "${task}": Consider architecture, dependencies, and performance implications.`,
      qa: `QA review for "${task}": Test happy path, error states, edge cases, and boundary conditions.`,
      security: `Security review for "${task}": Audit for OWASP Top 10, hardcoded secrets, and input validation.`,
    };
    return responses[role] || `Reviewing "${task}" from ${role} perspective.`;
  }

  brainstorm(task) {
    return Object.keys({ ceo: 1, designer: 1, engineer: 1, qa: 1, security: 1 }).map(role =>
      this.assign(role, task)
    );
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = VirtualTeam;
