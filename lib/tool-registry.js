class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(name, { category, isUsable, metadata = {} }) {
    if (!name || typeof name !== 'string') {
      throw new Error('Tool name is required and must be a string');
    }
    if (!category || typeof category !== 'string') {
      throw new Error('Tool category is required and must be a string');
    }
    if (!isUsable || typeof isUsable !== 'function') {
      throw new Error('isUsable is required and must be a function');
    }

    this.tools.set(name, { name, category, isUsable, metadata });
    return this;
  }

  async findUsable(category) {
    const toolsInCategory = Array.from(this.tools.values())
      .filter(t => t.category === category);

    const results = [];
    for (const tool of toolsInCategory) {
      try {
        const usable = await this._runWithTimeout(tool.isUsable);
        if (usable) {
          results.push({ name: tool.name, metadata: tool.metadata });
        }
      } catch {
        // isUsable threw, treat as unusable
      }
    }
    return results;
  }

  findAll(category) {
    return Array.from(this.tools.values())
      .filter(t => t.category === category)
      .map(t => ({ name: t.name, metadata: t.metadata, isUsable: t.isUsable }));
  }

  async getUnusable(category) {
    const toolsInCategory = Array.from(this.tools.values())
      .filter(t => t.category === category);

    const results = [];
    for (const tool of toolsInCategory) {
      try {
        const usable = await this._runWithTimeout(tool.isUsable);
        if (!usable) {
          results.push({ name: tool.name, reason: 'isUsable returned false', metadata: tool.metadata });
        }
      } catch (e) {
        results.push({ name: tool.name, reason: e.message || 'isUsable threw', metadata: tool.metadata });
      }
    }
    return results;
  }

  async _runWithTimeout(fn, timeout = 3000) {
    return Promise.race([
      Promise.resolve(fn()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('isUsable timeout')), timeout)
      )
    ]);
  }
}

const registry = new ToolRegistry();
module.exports = { ToolRegistry, registry };