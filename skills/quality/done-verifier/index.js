'use strict';

const DONE_CRITERIA = [
  {
    id: 'spec_met',
    category: 'spec',
    name: 'Spec requirements met',
    question: 'Does the implementation match all requirements in the spec?',
    blocking: true,
  },
  {
    id: 'no_console_logs',
    category: 'code',
    name: 'No debug logs',
    question: 'Are all console.log() debug statements removed?',
    blocking: true,
  },
  {
    id: 'error_handling',
    category: 'code',
    name: 'Error states handled',
    question: 'Do all forms and API calls handle error states gracefully?',
    blocking: true,
  },
  {
    id: 'loading_states',
    category: 'ux',
    name: 'Loading states',
    question: 'Do async operations show loading indicators?',
    blocking: false,
  },
  {
    id: 'mobile_responsive',
    category: 'ux',
    name: 'Mobile responsive',
    question: 'Does the UI work on a 375px wide screen?',
    blocking: true,
  },
  {
    id: 'no_broken_links',
    category: 'ux',
    name: 'No broken links/buttons',
    question: 'Do all links and buttons work as expected?',
    blocking: true,
  },
  {
    id: 'env_vars_set',
    category: 'deploy',
    name: 'Env vars configured',
    question: 'Are all required environment variables set in the deployment?',
    blocking: true,
  },
  {
    id: 'tests_pass',
    category: 'quality',
    name: 'Tests pass',
    question: 'Do all automated tests pass?',
    blocking: true,
  },
  {
    id: 'no_placeholder_text',
    category: 'content',
    name: 'No placeholder content',
    question: 'Is all Lorem Ipsum and placeholder text replaced with real content?',
    blocking: true,
  },
  {
    id: 'images_load',
    category: 'content',
    name: 'Images load',
    question: 'Do all images load correctly (not 404)?',
    blocking: true,
  },
  {
    id: 'auth_works',
    category: 'security',
    name: 'Auth works',
    question: 'Can users sign up, log in, and log out?',
    blocking: true,
  },
  {
    id: 'data_persists',
    category: 'data',
    name: 'Data persists',
    question: 'Does data survive page refresh?',
    blocking: true,
  },
  {
    id: 'no_secret_in_code',
    category: 'security',
    name: 'No secrets in code',
    question: 'Are there no API keys or passwords hardcoded in the frontend?',
    blocking: true,
  },
  {
    id: 'performance_ok',
    category: 'performance',
    name: 'Acceptable performance',
    question: 'Does the page load in under 5 seconds on a normal connection?',
    blocking: false,
  },
];

class DoneVerifier {
  constructor(options = {}) {
    this.name = 'done-verifier';
    this.description =
      '14-point checklist verifying a feature is truly production-ready before shipping';
    this.options = options;
    this.sessions = [];
  }

  _ts() {
    return new Date().toISOString();
  }

  startVerification(projectName) {
    const session = {
      id: Date.now().toString(36),
      projectName,
      startedAt: this._ts(),
      responses: {},
    };
    this.sessions.push(session);
    return {
      type: 'verification_started',
      timestamp: this._ts(),
      sessionId: session.id,
      projectName,
      totalChecks: DONE_CRITERIA.length,
      blockingChecks: DONE_CRITERIA.filter(c => c.blocking).length,
      categories: [...new Set(DONE_CRITERIA.map(c => c.category))],
      firstQuestion: DONE_CRITERIA[0],
      message: 'Starting done verification. Answer each question honestly.',
    };
  }

  respond(sessionId, criterionId, passed, note) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      return { type: 'error', timestamp: this._ts(), message: `Session ${sessionId} not found` };
    }
    session.responses[criterionId] = { passed, note, answeredAt: this._ts() };
    const remaining = DONE_CRITERIA.filter(c => !session.responses[c.id]);
    return {
      type: 'response_recorded',
      timestamp: this._ts(),
      sessionId,
      criterionId,
      passed,
      remaining: remaining.length,
      nextQuestion: remaining[0] || null,
    };
  }

  getReport(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      return { type: 'error', timestamp: this._ts(), message: `Session ${sessionId} not found` };
    }
    const failed = DONE_CRITERIA.filter(
      c => session.responses[c.id] && !session.responses[c.id].passed
    );
    const blockingFailed = failed.filter(c => c.blocking);
    const unanswered = DONE_CRITERIA.filter(c => !session.responses[c.id]);
    const passed = DONE_CRITERIA.filter(
      c => session.responses[c.id] && session.responses[c.id].passed
    );
    return {
      type: 'done_report',
      timestamp: this._ts(),
      sessionId,
      projectName: session.projectName,
      readyToShip: blockingFailed.length === 0 && unanswered.length === 0,
      passedCount: passed.length,
      failedCount: failed.length,
      unansweredCount: unanswered.length,
      blockingIssues: blockingFailed.map(c => ({
        id: c.id,
        name: c.name,
        note: session.responses[c.id]?.note,
      })),
      unanswered: unanswered.map(c => ({ id: c.id, name: c.name, question: c.question })),
      score: Math.round((passed.length / DONE_CRITERIA.length) * 100),
      verdict:
        blockingFailed.length === 0 && unanswered.length === 0
          ? '✅ Ready to ship!'
          : `❌ Not ready — fix ${blockingFailed.length} blocking issue(s) first`,
    };
  }

  quickCheck(answers) {
    // answers = { criterionId: boolean }
    const failed = DONE_CRITERIA.filter(c => answers[c.id] === false && c.blocking);
    const unanswered = DONE_CRITERIA.filter(c => answers[c.id] === undefined);
    return {
      type: 'quick_check',
      timestamp: this._ts(),
      readyToShip: failed.length === 0 && unanswered.length === 0,
      blockingIssues: failed.map(c => c.name),
      unanswered: unanswered.map(c => c.name),
      score: Math.round(
        (Object.values(answers).filter(Boolean).length / DONE_CRITERIA.length) * 100
      ),
    };
  }

  getCriteria(category) {
    const criteria = category ? DONE_CRITERIA.filter(c => c.category === category) : DONE_CRITERIA;
    return { type: 'criteria_list', timestamp: this._ts(), criteria };
  }

  toMarkdown() {
    const lines = ['# Done Checklist', ''];
    const byCategory = {};
    for (const c of DONE_CRITERIA) {
      if (!byCategory[c.category]) byCategory[c.category] = [];
      byCategory[c.category].push(c);
    }
    for (const [cat, items] of Object.entries(byCategory)) {
      lines.push(`## ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
      for (const item of items) {
        const badge = item.blocking ? ' ⚠️ blocking' : '';
        lines.push(`- [ ] **${item.name}**${badge}: ${item.question}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }

  toJSON() {
    return { criteria: DONE_CRITERIA };
  }
}

module.exports = DoneVerifier;
