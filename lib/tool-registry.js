class ToolRegistry {
  /**
   * Registry for tools with isUsable() checks and timeout handling.
   * @param {Object} [options]
   * @param {number} [options.timeout=3000] - Timeout for isUsable checks in ms
   */
  constructor({ timeout = 3000 } = {}) {
    this.tools = new Map();
    this._timeout = timeout;
  }

  /**
   * Register a tool with optional isUsable check.
   * @param {string} name - Tool name
   * @param {Object} options
   * @param {string} [options.category='uncategorized'] - Tool category
   * @param {Function} [options.isUsable] - Check function, returns true/false or {usable, reason}
   * @param {string} [options.description] - Tool description
   * @param {Object} [options.metadata] - Additional metadata
   * @returns {ToolRegistry}
   */
  register(name, { category = 'uncategorized', isUsable, description, metadata = {} } = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('Tool name is required and must be a string');
    }

    const check = isUsable || (() => true);

    this.tools.set(name, {
      name,
      category,
      isUsable: check,
      description: description || '',
      metadata,
    });
    return this;
  }

  /**
   * Get all registered tools.
   * @returns {Array<{name, category, description, isUsable: true}>}
   */
  findAll() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      category: t.category,
      description: t.description,
      isUsable: true,
    }));
  }

  /**
   * Find tools that pass isUsable() check.
   * @param {string} [category='all'] - Category to filter by, or 'all'
   * @returns {Promise<Array<{name: string, category: string, isUsable: boolean}>>}
   */
  async findUsable(category) {
    const tools = this._getTools(category);
    const results = [];

    for (const tool of tools) {
      try {
        const result = await this._runCheck(tool.isUsable);
        if (result === true || (result && result.usable !== false)) {
          results.push({ name: tool.name, category: tool.category, isUsable: true });
        }
      } catch {
        // isUsable threw — treat as unusable
      }
    }
    return results;
  }

  /**
   * Find tools that fail isUsable() check.
   * @param {string} [category='all'] - Category to filter by, or 'all'
   * @returns {Promise<Array<{name: string, category: string, isUsable: boolean, reason: string}>>}
   */
  async getUnusable(category) {
    const tools = this._getTools(category);
    const results = [];

    for (const tool of tools) {
      try {
        const result = await this._runCheck(tool.isUsable);
        if (result === false || (result && result.usable === false)) {
          const reason = result && result.reason ? result.reason : 'isUsable returned false';
          results.push({ name: tool.name, category: tool.category, isUsable: false, reason });
        }
      } catch (e) {
        results.push({
          name: tool.name,
          category: tool.category,
          isUsable: false,
          reason: e.message,
        });
      }
    }
    return results;
  }

  /** @private */
  _getTools(category) {
    if (!category || category === 'all') {
      return Array.from(this.tools.values());
    }
    return Array.from(this.tools.values()).filter(t => t.category === category);
  }

  /** @private */
  async _runCheck(fn) {
    return Promise.race([
      Promise.resolve().then(() => fn()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('isUsable timeout')), this._timeout)
      ),
    ]);
  }
}

const registry = new ToolRegistry();
module.exports = { ToolRegistry, registry };
