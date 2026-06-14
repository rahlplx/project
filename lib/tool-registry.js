class ToolRegistry {
  #tools = new Map();

  register(name, { isUsable, category, metadata = {} }) {
    this.#tools.set(name, { isUsable, category, metadata: { ...metadata, name } });
  }

  findAll() {
    return Array.from(this.#tools.values()).map(t => ({
      name: t.metadata.name,
      category: t.category,
      metadata: t.metadata,
    }));
  }

  getAll() {
    return this.findAll();
  }

  findUsable(category) {
    const results = [];
    for (const [name, tool] of this.#tools) {
      if (tool.category !== category) continue;
      if (typeof tool.isUsable === 'function') {
        try {
          if (tool.isUsable()) {
            results.push({ name, metadata: tool.metadata });
          }
        } catch {
          continue;
        }
      }
    }
    return results;
  }

  getUnusable(category) {
    const results = [];
    for (const [name, tool] of this.#tools) {
      if (tool.category !== category) continue;
      if (typeof tool.isUsable === 'function') {
        try {
          if (!tool.isUsable()) {
            results.push({ name, metadata: tool.metadata, reason: 'isUsable returned false' });
          }
        } catch (e) {
          results.push({ name, metadata: tool.metadata, reason: `Error: ${e.message}` });
        }
      }
    }
    return results;
  }
}

const registry = new ToolRegistry();
module.exports = { ToolRegistry, registry };
