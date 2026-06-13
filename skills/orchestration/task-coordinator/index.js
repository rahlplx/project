#!/usr/bin/env node

class TaskCoordinator {
  constructor() {
    this.name = 'task-coordinator';
    this.version = '1.0.0';
    this.description = 'Orchestrate multi-step workflows with dependency management';
    this.workflows = [];
  }

  define(name, steps = []) {
    const wf = {
      id: `WF-${String(this.workflows.length + 1).padStart(3, '0')}`,
      name,
      steps: steps.map((s, i) => ({
        id: `S${String(i + 1).padStart(2, '0')}`,
        name: s.name || `Step ${i + 1}`,
        action: s.action || '',
        dependsOn: s.dependsOn || [],
        status: 'pending'
      })),
      status: 'defined',
      createdAt: new Date().toISOString()
    };
    this.workflows.push(wf);
    return wf;
  }

  execute(wfId) {
    const wf = this.workflows.find(w => w.id === wfId);
    if (!wf) return { error: `Workflow ${wfId} not found.` };

    const order = this._resolveOrder(wf.steps);
    wf.status = 'running';

    for (const step of order) {
      step.status = 'running';
      step.startedAt = new Date().toISOString();
      step.status = 'completed';
      step.completedAt = new Date().toISOString();
    }

    wf.status = 'completed';
    wf.completedAt = new Date().toISOString();

    return {
      workflow: wf.name,
      stepsCompleted: wf.steps.length,
      executionOrder: order.map(s => s.id),
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  _resolveOrder(steps) {
    const resolved = [];
    const visited = new Set();
    const visit = (step) => {
      if (visited.has(step.id)) return;
      step.dependsOn.forEach(depId => {
        const dep = steps.find(s => s.id === depId);
        if (dep) visit(dep);
      });
      visited.add(step.id);
      resolved.push(step);
    };
    steps.forEach(s => visit(s));
    return resolved;
  }

  status(wfId) {
    const wf = this.workflows.find(w => w.id === wfId);
    if (!wf) return { error: 'Not found' };
    return {
      id: wf.id,
      name: wf.name,
      status: wf.status,
      steps: wf.steps.map(s => ({ id: s.id, name: s.name, status: s.status })),
      progress: `${wf.steps.filter(s => s.status === 'completed').length}/${wf.steps.length}`
    };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = TaskCoordinator;
