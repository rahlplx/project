#!/usr/bin/env node
/**
 * Faithful port of the GSD (Get Shit Done) Define -> Build -> Ship lifecycle
 * (https://github.com/gsd-build/get-shit-done) into this project's milestone ->
 * phase -> task structure. Composes with the existing .gsd/ milestone files
 * rather than reimplementing them.
 */

const STAGES = {
  define: {
    name: 'define',
    commands: ['gsd-new-project', 'gsd-discuss-phase', 'gsd-ui-phase'],
    description:
      'Intake, requirements extraction, roadmap approval; lock implementation preferences before coding.',
  },
  build: {
    name: 'build',
    commands: ['gsd-plan-phase', 'gsd-execute-phase', 'gsd-verify-work'],
    description: 'Atomic task plans, wave-grouped execution, structured manual UAT.',
  },
  ship: {
    name: 'ship',
    commands: ['gsd-ship', 'gsd-audit-milestone', 'gsd-complete-milestone'],
    description: 'PR creation, requirement-coverage audit, archive and tag release.',
  },
};

const AUXILIARY_COMMANDS = ['gsd-quick', 'gsd-progress', 'gsd-spike', 'gsd-sketch'];

class GSDWorkflow {
  constructor() {
    this.name = 'gsd-workflow';
    this.version = '1.0.0';
    this.description =
      'Define -> Build -> Ship milestone lifecycle with atomic-commit task tracking, ported from GSD.';
    this.stages = STAGES;
  }

  /**
   * Recommend the next GSD command given the current stage and phase state.
   */
  nextCommand(stage, phaseState = {}) {
    const def = STAGES[stage];
    if (!def) {
      return { error: `Unknown stage: ${stage}. Valid stages: ${Object.keys(STAGES).join(', ')}` };
    }

    if (stage === 'define') {
      if (!phaseState.requirementsLocked) return 'gsd-discuss-phase';
      if (phaseState.hasUI && !phaseState.designContractApproved) return 'gsd-ui-phase';
      return 'gsd-plan-phase';
    }
    if (stage === 'build') {
      if (!phaseState.plansApproved) return 'gsd-plan-phase';
      if (!phaseState.executed) return 'gsd-execute-phase';
      return 'gsd-verify-work';
    }
    if (stage === 'ship') {
      if (!phaseState.verified) return 'gsd-verify-work';
      if (!phaseState.shipped) return 'gsd-ship';
      return 'gsd-audit-milestone';
    }
    return null;
  }

  /**
   * Validate the atomic-commit guarantee for a completed task: one isolated
   * commit, a *-SUMMARY.md, and a VERIFICATION.md cross-check.
   */
  validateAtomicCommit(task = {}) {
    const checks = [
      { id: 'commit', label: 'One isolated git commit', passed: !!task.commitSha },
      {
        id: 'summary',
        label: 'SUMMARY.md documenting decisions and outcomes',
        passed: !!task.summaryPath,
      },
      {
        id: 'verification',
        label: 'VERIFICATION.md cross-check against phase requirements',
        passed: !!task.verificationPath,
      },
    ];
    const failed = checks.filter(c => !c.passed);
    return { atomic: failed.length === 0, checks, missing: failed.map(c => c.label) };
  }

  /**
   * Audit a milestone: have all declared requirements been shipped?
   * Maps to /gsd-audit-milestone.
   */
  auditMilestone(requirements = [], shipped = []) {
    const shippedSet = new Set(shipped);
    const missing = requirements.filter(r => !shippedSet.has(r));
    return {
      complete: missing.length === 0,
      total: requirements.length,
      shipped: requirements.length - missing.length,
      missing,
    };
  }

  /**
   * If a wave (group of independently executable tasks) partially fails,
   * GSD guarantees prior waves remain committed/verifiable and only the
   * failed task needs re-planning.
   */
  resumeAfterFailure(waves = []) {
    const completed = [];
    let failedTask = null;

    for (const wave of waves) {
      const failures = (wave.tasks || []).filter(t => t.status === 'failed');
      if (failures.length) {
        failedTask = failures[0];
        break;
      }
      completed.push(...(wave.tasks || []).map(t => t.id));
    }

    return {
      preservedTasks: completed,
      failedTask: failedTask ? failedTask.id : null,
      action: failedTask
        ? `Re-plan and re-execute ${failedTask.id} independently.`
        : 'All waves completed.',
    };
  }

  getStage(name) {
    return STAGES[name] || null;
  }

  getStages() {
    return Object.values(STAGES);
  }

  getAuxiliaryCommands() {
    return AUXILIARY_COMMANDS;
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      stages: Object.keys(STAGES),
    };
  }
}

module.exports = GSDWorkflow;
