#!/usr/bin/env node

class PlanningAgent {
  constructor() {
    this.name = 'planning-agent';
    this.version = '1.0.0';
    this.description = 'Breaks project descriptions into actionable task plans';
  }

  plan(description) {
    if (!description) return { success: false, error: 'No project description provided.' };

    const lower = description.toLowerCase();
    const type = this._detectType(lower);
    const tasks = this._generateTasks(type, description);
    const phases = this._organizePhases(tasks);

    return {
      success: true,
      projectType: type,
      summary: `Plan generated: ${tasks.length} tasks across ${phases.length} phases.`,
      phases,
      tasks,
      totalTasks: tasks.length,
      estimatedEffort: this._estimateEffort(tasks),
      timestamp: new Date().toISOString(),
    };
  }

  _detectType(lower) {
    if (/website|landing|page|site/i.test(lower)) return 'website';
    if (/api|backend|server|service/i.test(lower)) return 'api';
    if (/dashboard/i.test(lower)) return 'dashboard';
    if (/mobile|app|ios|android/i.test(lower)) return 'mobile-app';
    if (/ecommerce|shop|store/i.test(lower)) return 'ecommerce';
    if (/cli|tool|command/i.test(lower)) return 'cli-tool';
    return 'web-application';
  }

  _generateTasks(type, desc) {
    const common = [
      { id: 'T01', phase: 'setup', title: 'Initialize project structure', effort: 'small' },
      { id: 'T02', phase: 'setup', title: 'Configure development environment', effort: 'small' },
      { id: 'T03', phase: 'setup', title: 'Set up version control (git)', effort: 'small' },
      { id: 'T04', phase: 'setup', title: 'Create project documentation', effort: 'small' },
      { id: 'T05', phase: 'core', title: 'Implement core functionality', effort: 'large' },
      { id: 'T06', phase: 'core', title: 'Set up routing/navigation', effort: 'medium' },
      { id: 'T07', phase: 'data', title: 'Design data model / schema', effort: 'medium' },
      { id: 'T08', phase: 'data', title: 'Implement data storage', effort: 'medium' },
      { id: 'T09', phase: 'ui', title: 'Build user interface', effort: 'large' },
      { id: 'T10', phase: 'ui', title: 'Implement responsive design', effort: 'medium' },
      { id: 'T11', phase: 'testing', title: 'Write unit tests', effort: 'medium' },
      { id: 'T12', phase: 'testing', title: 'Write integration tests', effort: 'medium' },
      { id: 'T13', phase: 'quality', title: 'Code review and refactor', effort: 'medium' },
      { id: 'T14', phase: 'quality', title: 'Security audit', effort: 'medium' },
      { id: 'T15', phase: 'deploy', title: 'Set up CI/CD pipeline', effort: 'medium' },
      { id: 'T16', phase: 'deploy', title: 'Deploy to production', effort: 'small' },
    ];

    if (/auth|login|signup|user/i.test(desc)) {
      common.push({ id: 'T17', phase: 'core', title: 'Implement authentication', effort: 'large' });
    }
    if (/payment|stripe|checkout/i.test(desc)) {
      common.push({
        id: 'T18',
        phase: 'core',
        title: 'Implement payment processing',
        effort: 'large',
      });
    }
    if (/email|notif/i.test(desc)) {
      common.push({
        id: 'T19',
        phase: 'core',
        title: 'Set up email notifications',
        effort: 'medium',
      });
    }
    if (/api|integration|third.?party/i.test(desc)) {
      common.push({ id: 'T20', phase: 'core', title: 'Integrate external APIs', effort: 'medium' });
    }

    return common;
  }

  _organizePhases(tasks) {
    const phaseMap = {};
    tasks.forEach(t => {
      if (!phaseMap[t.phase]) phaseMap[t.phase] = [];
      phaseMap[t.phase].push(t.id);
    });
    return Object.entries(phaseMap).map(([name, taskIds]) => ({
      name,
      taskCount: taskIds.length,
      tasks: taskIds,
    }));
  }

  _estimateEffort(tasks) {
    const map = { small: 1, medium: 3, large: 5 };
    const total = tasks.reduce((sum, t) => sum + (map[t.effort] || 1), 0);
    return `${total} story points (${Math.ceil(total / 3)} day${Math.ceil(total / 3) !== 1 ? 's' : ''} estimated)`;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = PlanningAgent;
