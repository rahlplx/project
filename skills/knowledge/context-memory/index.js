#!/usr/bin/env node
const { SkillBase } = require('../../../lib/skill-base.js');

class ContextMemory extends SkillBase {
  constructor() {
    super();
    this.name = 'context-memory';
    this.version = '1.0.0';
    this.description = 'Persistent context across sessions — remembers preferences and decisions';
    this._store = Object.create(null);
  }

  remember(key, value) {
    this._store[key] = { value, savedAt: new Date().toISOString() };
    return { saved: true, key };
  }

  recall(key) {
    return this._store[key] || null;
  }

  recallAll() {
    return Object.entries(this._store).map(([k, v]) => ({
      key: k,
      value: v.value,
      savedAt: v.savedAt,
    }));
  }

  forget(key) {
    delete this._store[key];
    return { forgotten: true, key };
  }

  summarize() {
    const entries = Object.entries(this._store);
    return {
      totalEntries: entries.length,
      recentEntries: entries.slice(-5).map(([k, v]) => ({ key: k, savedAt: v.savedAt })),
      timestamp: new Date().toISOString(),
    };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = ContextMemory;
