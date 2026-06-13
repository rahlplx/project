/**
 * Tool Registry — plugable tool discovery with usability filtering.
 *
 * Tools register themselves with metadata and an optional is_usable() check.
 * Consumers query by category and get only tools available on this machine.
 *
 * @module lib/tool-registry
 */

class ToolRegistry {
  constructor() {
    this._entries = new Map();
  }

  /**
   * Register a tool.
   * @param {string} name - Unique tool name (kebab-case)
   * @param {Object} entry - Tool entry
   * @param {string} entry.category - Category name (e.g. 'deploy', 'design')
   * @param {string} entry.description - Short description
   * @param {Function} [entry.factory] - Factory function returning tool instance
   * @param {Function} [entry.isUsable] - Returns boolean, true if tool can run
   * @param {Object} [entry.metadata] - Extra metadata (stars, license, etc.)
   * @returns {ToolRegistry} this
   */
  register(name, entry) {
    if (this._entries.has(name)) {
      throw new Error(`ToolRegistry: duplicate registration '${name}'`);
    }
    if (!entry || !entry.category) {
      throw new Error(`ToolRegistry: '${name}' missing required 'category' field`);
    }
    this._entries.set(name, {
      name,
      category: entry.category,
      description: entry.description || '',
      factory: typeof entry.factory === 'function' ? entry.factory : null,
      isUsable: typeof entry.isUsable === 'function' ? entry.isUsable : () => true,
      metadata: entry.metadata || {},
    });
    return this;
  }

  /**
   * Check if a tool name has been registered.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this._entries.has(name);
  }

  /**
   * Get a single registered entry by name.
   * @param {string} name
   * @returns {Object|undefined}
   */
  get(name) {
    return this._entries.get(name);
  }

  /**
   * Return all registered entries (regardless of usability).
   * @returns {Object[]}
   */
  getAll() {
    return Array.from(this._entries.values());
  }

  /**
   * Return distinct category names, sorted alphabetically.
   * @returns {string[]}
   */
  getCategories() {
    const cats = new Set();
    for (const e of this._entries.values()) {
      cats.add(e.category);
    }
    return Array.from(cats).sort();
  }

  /**
   * Return entries whose is_usable() returns true, optionally filtered by category.
   * @param {string} [category] - If provided, only return tools in this category
   * @returns {Object[]}
   */
  findUsable(category) {
    const results = [];
    for (const e of this._entries.values()) {
      if (category && e.category !== category) continue;
      if (e.isUsable()) {
        results.push(e);
      }
    }
    return results;
  }

  /**
   * Create tool instances for all usable tools in a category.
   * Calls factory() if available, otherwise returns the entry itself.
   * @param {string} [category]
   * @returns {Object[]}
   */
  createUsable(category) {
    return this.findUsable(category).map((e) => {
      if (e.factory) return e.factory();
      return e;
    });
  }
}

const registry = new ToolRegistry();
module.exports = { ToolRegistry, registry };
