/**
 * TaskTracker Skill
 *
 * Tracks tasks through a visual kanban board (todo → in-progress → review → done).
 * All state is in-memory. No file I/O required.
 */

const crypto = require('crypto');

class TaskTracker {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'vibe-tracker';
    this.phases = options.phases || ['todo', 'in-progress', 'review', 'done'];
    this.tasks = [];
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  _uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return crypto.randomBytes(16).toString('hex').replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'
    );
  }

  _now() {
    return new Date().toISOString();
  }

  _find(id) {
    return this.tasks.find(t => t.id === id) || null;
  }

  _require(id) {
    const task = this._find(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    return task;
  }

  _phaseIndex(phase) {
    return this.phases.indexOf(phase);
  }

  // ─── Core task operations ─────────────────────────────────────────────────────

  /**
   * Create a new task.
   * @param {string} name
   * @param {object} options - { description, priority, phase, tags }
   * @returns task object with type and timestamp
   */
  createTask(name, options = {}) {
    const now = this._now();
    const phase = options.phase || this.phases[0];
    if (this._phaseIndex(phase) === -1) {
      throw new Error(`Unknown phase: ${phase}. Valid phases: ${this.phases.join(', ')}`);
    }
    const priorities = ['low', 'medium', 'high'];
    const priority = priorities.includes(options.priority) ? options.priority : 'medium';
    const task = {
      id: this._uuid(),
      name: String(name),
      description: options.description || '',
      status: 'open',
      phase,
      priority,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      tags: Array.isArray(options.tags) ? options.tags : [],
      checkItems: []
    };
    this.tasks.push(task);
    return { type: 'task', timestamp: now, ...task };
  }

  /**
   * Update the status string of a task (e.g. 'open', 'blocked', 'complete').
   */
  updateStatus(taskId, status) {
    const task = this._require(taskId);
    const now = this._now();
    task.status = String(status);
    task.updatedAt = now;
    if (status === 'complete' || status === 'done') {
      task.completedAt = task.completedAt || now;
    }
    return { type: 'task', timestamp: now, ...task };
  }

  /**
   * Move a task to a different phase column.
   */
  moveToPhase(taskId, phase) {
    if (this._phaseIndex(phase) === -1) {
      throw new Error(`Unknown phase: ${phase}. Valid phases: ${this.phases.join(', ')}`);
    }
    const task = this._require(taskId);
    const now = this._now();
    task.phase = phase;
    task.updatedAt = now;
    const lastPhase = this.phases[this.phases.length - 1];
    if (phase === lastPhase) {
      task.completedAt = task.completedAt || now;
    }
    return { type: 'task', timestamp: now, ...task };
  }

  // ─── Checklist items ──────────────────────────────────────────────────────────

  addCheckItem(taskId, text) {
    const task = this._require(taskId);
    const now = this._now();
    const item = { id: this._uuid(), text: String(text), done: false };
    task.checkItems.push(item);
    task.updatedAt = now;
    return { type: 'task', timestamp: now, ...task };
  }

  completeCheckItem(taskId, checkItemId) {
    const task = this._require(taskId);
    const item = task.checkItems.find(c => c.id === checkItemId);
    if (!item) throw new Error(`CheckItem not found: ${checkItemId}`);
    const now = this._now();
    item.done = true;
    task.updatedAt = now;
    return { type: 'task', timestamp: now, ...task };
  }

  // ─── Queries ──────────────────────────────────────────────────────────────────

  getTask(id) {
    const task = this._find(id);
    if (!task) return null;
    return { type: 'task', timestamp: this._now(), ...task };
  }

  /**
   * List tasks with optional filters.
   * Filters: { phase, priority, status, tag, search }
   */
  listTasks(filters = {}) {
    let result = [...this.tasks];
    if (filters.phase) result = result.filter(t => t.phase === filters.phase);
    if (filters.priority) result = result.filter(t => t.priority === filters.priority);
    if (filters.status) result = result.filter(t => t.status === filters.status);
    if (filters.tag) result = result.filter(t => t.tags.includes(filters.tag));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }

  deleteTask(id) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }

  // ─── Aggregates ───────────────────────────────────────────────────────────────

  getProgress() {
    const now = this._now();
    const total = this.tasks.length;
    const byPhase = {};
    this.phases.forEach(p => { byPhase[p] = 0; });
    this.tasks.forEach(t => {
      if (byPhase[t.phase] !== undefined) byPhase[t.phase]++;
    });
    const lastPhase = this.phases[this.phases.length - 1];
    const done = byPhase[lastPhase] || 0;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      type: 'progress',
      timestamp: now,
      total,
      byPhase,
      completionRate,
      tasks: this.tasks.map(t => ({ ...t }))
    };
  }

  getStats() {
    const now = this._now();
    const total = this.tasks.length;
    const lastPhase = this.phases[this.phases.length - 1];
    const firstPhase = this.phases[0];
    const inProgressPhases = this.phases.filter(p => p !== firstPhase && p !== lastPhase);

    const completed = this.tasks.filter(t => t.phase === lastPhase).length;
    const todo = this.tasks.filter(t => t.phase === firstPhase).length;
    const inProgress = this.tasks.filter(t => inProgressPhases.includes(t.phase)).length;

    const byPriority = { low: 0, medium: 0, high: 0 };
    this.tasks.forEach(t => {
      if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
    });

    return {
      type: 'stats',
      timestamp: now,
      total,
      completed,
      inProgress,
      todo,
      overdue: 0,
      byPriority
    };
  }

  // ─── Rendering ────────────────────────────────────────────────────────────────

  toAscii() {
    const phaseMap = {};
    this.phases.forEach(p => { phaseMap[p] = []; });
    this.tasks.forEach(t => {
      if (phaseMap[t.phase]) phaseMap[t.phase].push(t);
    });

    const lastPhase = this.phases[this.phases.length - 1];

    // Build header label for each column
    const headers = this.phases.map(p => {
      const count = phaseMap[p].length;
      return `${p.toUpperCase()} (${count})`;
    });

    // Column widths: header length + 2 padding, min 14
    const colWidths = headers.map(h => Math.max(h.length + 2, 14));

    const maxRows = Math.max(0, ...this.phases.map(p => phaseMap[p].length));

    const topBorder = '┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐';
    const midBorder = '├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤';
    const botBorder = '└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘';

    const padCell = (str, width) => {
      const maxContent = width - 2;
      const s = str.length > maxContent ? str.slice(0, maxContent - 3) + '...' : str;
      return ' ' + s + ' '.repeat(width - s.length - 1);
    };

    const headerRow = '│' + this.phases.map((p, i) => padCell(headers[i], colWidths[i])).join('│') + '│';

    const dataRows = [];
    for (let r = 0; r < maxRows; r++) {
      const cells = this.phases.map((p, i) => {
        const task = phaseMap[p][r];
        if (!task) return ' '.repeat(colWidths[i]);
        const prefix = p === lastPhase ? '✓ ' : (p.includes('progress') ? '► ' : '• ');
        return padCell(prefix + task.name, colWidths[i]);
      });
      dataRows.push('│' + cells.join('│') + '│');
    }

    const lines = [topBorder, headerRow, midBorder];
    if (maxRows === 0) {
      lines.push('│' + this.phases.map((p, i) => ' '.repeat(colWidths[i])).join('│') + '│');
    } else {
      dataRows.forEach(r => lines.push(r));
    }
    lines.push(botBorder);
    return lines.join('\n');
  }

  toJSON() {
    return JSON.stringify({
      storageKey: this.storageKey,
      phases: this.phases,
      tasks: this.tasks
    }, null, 2);
  }

  toMarkdown() {
    const lastPhase = this.phases[this.phases.length - 1];
    const lines = [`# Task Board: ${this.storageKey}`, ''];
    this.phases.forEach(phase => {
      const phaseTasks = this.tasks.filter(t => t.phase === phase);
      const heading = phase.charAt(0).toUpperCase() + phase.slice(1).replace(/-/g, ' ');
      lines.push(`## ${heading} (${phaseTasks.length})`);
      if (phaseTasks.length === 0) {
        lines.push('*(empty)*');
      } else {
        phaseTasks.forEach(t => {
          const check = t.phase === lastPhase ? '[x]' : '[ ]';
          lines.push(`- ${check} **${t.name}** *(${t.priority} priority)*`);
          if (t.description) lines.push(`  > ${t.description}`);
          t.checkItems.forEach(ci => {
            lines.push(`  - ${ci.done ? '[x]' : '[ ]'} ${ci.text}`);
          });
        });
      }
      lines.push('');
    });
    return lines.join('\n');
  }
}

module.exports = TaskTracker;
