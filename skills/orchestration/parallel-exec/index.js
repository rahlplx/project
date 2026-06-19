#!/usr/bin/env node
const { SkillBase } = require('../../../lib/skill-base.js');

class ParallelExec extends SkillBase {
  constructor() {
    super();
    this.name = 'parallel-exec';
    this.version = '1.0.0';
    this.description = 'Run tasks simultaneously — parallel execution coordination';
  }

  plan(tasks = []) {
    if (!tasks.length) return { success: false, error: 'No tasks to plan.' };

    const groups = this._groupIndependent(tasks);
    const totalTime = groups.length; // each group = 1 time unit

    return {
      success: true,
      groupCount: groups.length,
      taskCount: tasks.length,
      estimatedTimeUnits: totalTime,
      sequentialTime: tasks.length,
      speedup: tasks.length / totalTime,
      groups: groups.map((g, i) => ({
        step: i + 1,
        tasks: g,
        parallelCount: g.length,
      })),
      recommendation:
        groups.length < tasks.length
          ? `Run in ${groups.length} parallel groups (${Math.round((1 - groups.length / tasks.length) * 100)}% faster than sequential)`
          : 'Tasks have dependencies — mostly sequential execution.',
      timestamp: new Date().toISOString(),
    };
  }

  _groupIndependent(tasks) {
    const groups = [];
    const remaining = [...tasks];

    while (remaining.length > 0) {
      const group = [];
      const taken = new Set();

      for (let i = 0; i < remaining.length; i++) {
        const task = remaining[i];
        const deps = task.dependsOn || [];
        const depInGroup = deps.some(d => taken.has(d) || group.some(g => g.id === d));
        const depInRemaining = deps.some(d => remaining.some(r => r.id === d));

        if (!depInGroup && !depInRemaining) {
          group.push(task);
          taken.add(task.id);
        }
      }

      if (group.length === 0) {
        throw new Error('Circular or unresolvable dependency detected in task graph');
      }
      groups.push(group.map(t => t.id));
      group.forEach(t => {
        const idx = remaining.findIndex(r => r.id === t.id);
        if (idx >= 0) remaining.splice(idx, 1);
      });
    }

    return groups;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = ParallelExec;
