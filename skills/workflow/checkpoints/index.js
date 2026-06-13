#!/usr/bin/env node

class Checkpoints {
  constructor() {
    this.name = 'checkpoints';
    this.version = '1.0.0';
    this.description = 'Milestone-based progress tracking with checkpoints';
    this.checkpoints = [];
  }

  define(name, tasks = []) {
    const cp = {
      id: `CP-${String(this.checkpoints.length + 1).padStart(3, '0')}`,
      name,
      tasks: tasks.map(t => ({ description: t, done: false })),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.checkpoints.push(cp);
    return cp;
  }

  complete(id) {
    const cp = this.checkpoints.find(c => c.id === id);
    if (!cp) return { error: `Checkpoint ${id} not found.` };
    cp.status = 'completed';
    cp.completedAt = new Date().toISOString();
    return cp;
  }

  progress() {
    const total = this.checkpoints.length;
    const done = this.checkpoints.filter(c => c.status === 'completed').length;
    const taskTotal = this.checkpoints.reduce((s, c) => s + c.tasks.length, 0);
    const taskDone = this.checkpoints.reduce((s, c) => s + c.tasks.filter(t => t.done).length, 0);

    return {
      checkpoints: { total, completed: done, pct: total > 0 ? Math.round((done / total) * 100) : 0 },
      tasks: { total: taskTotal, completed: taskDone, pct: taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0 },
      checkpoints: this.checkpoints,
      timestamp: new Date().toISOString()
    };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = Checkpoints;
