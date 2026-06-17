/**
 * Subagent Dispatch
 * Implements non-interactive subagent execution
 * From obra/superpowers with vibe-stack Q&A blocking fix
 */

const path = require('path');

class SubagentDispatch {
  constructor() {
    this.subagents = new Map();
    this.timeouts = new Map();
    this.defaultTimeout = 300000; // 5 minutes
  }

  /**
   * Create isolated subagent
   */
  create(task, context) {
    const id = this.generateId();
    const subagent = {
      id: id,
      task: task,
      context: this.isolateContext(context),
      status: 'pending',
      results: null,
      createdAt: new Date().toISOString()
    };

    this.subagents.set(id, subagent);
    return subagent;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `subagent-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Isolate context for subagent
   */
  isolateContext(context) {
    // Only include relevant context for the task
    return {
      task: context.task,
      files: context.files || [],
      constraints: context.constraints || [],
      // Exclude unnecessary context
      history: [],
      state: null
    };
  }

  /**
   * Dispatch subagent with non-interactive mode
   */
  async dispatch(subagent, prompt, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const agent = options.agent || 'opencode';

    // Build non-interactive prompt
    const fullPrompt = this.buildNonInteractivePrompt(prompt, agent);

    // Update status
    subagent.status = 'running';
    this.subagents.set(subagent.id, subagent);

    // Set timeout
    const timeoutId = setTimeout(() => {
      this.timeout(subagent.id);
    }, timeout);
    this.timeouts.set(subagent.id, timeoutId);

    try {
      const result = await this.executeWithTimeout(fullPrompt, timeout);
      
      // Update subagent with results
      subagent.status = 'completed';
      subagent.results = result;
      subagent.completedAt = new Date().toISOString();
      this.subagents.set(subagent.id, subagent);

      // Clear timeout
      clearTimeout(timeoutId);
      this.timeouts.delete(subagent.id);

      return result;
    } catch (error) {
      subagent.status = 'failed';
      subagent.error = error.message;
      subagent.failedAt = new Date().toISOString();
      this.subagents.set(subagent.id, subagent);

      // Clear timeout
      clearTimeout(timeoutId);
      this.timeouts.delete(subagent.id);

      throw error;
    }
  }

  /**
   * Build non-interactive prompt
   * From vibe-stack: Q&A Blocking Fix
   */
  buildNonInteractivePrompt(prompt, agent) {
    const nonInteractiveFlags = {
      opencode: '--no-input',
      codex: '--print',
      cursor: '--compose',
      'codex-cli': '--non-interactive'
    };

    const flag = nonInteractiveFlags[agent] || '--non-interactive';

    return `
## NON-INTERACTIVE MODE

**IMPORTANT:** Do NOT ask questions. Do NOT prompt for input. Do NOT wait for user response.

**Execute directly.** Make all decisions based on the context provided.

**Agent Flag:** ${flag}

---

${prompt}
`;
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout(prompt, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeout}ms`));
      }, timeout);

      // Simulate execution (in real implementation, this would call the agent)
      setTimeout(() => {
        clearTimeout(timeoutId);
        resolve({
          success: true,
          output: 'Execution completed',
          timestamp: new Date().toISOString()
        });
      }, 1000);
    });
  }

  /**
   * Handle timeout
   */
  timeout(subagentId) {
    const subagent = this.subagents.get(subagentId);
    if (subagent) {
      subagent.status = 'timeout';
      subagent.error = 'Execution timed out';
      subagent.timedOutAt = new Date().toISOString();
      this.subagents.set(subagentId, subagent);
    }
  }

  /**
   * Collect results from subagent
   */
  collect(subagentId) {
    const subagent = this.subagents.get(subagentId);
    if (!subagent) {
      throw new Error(`Subagent not found: ${subagentId}`);
    }

    return {
      id: subagent.id,
      task: subagent.task,
      status: subagent.status,
      results: subagent.results,
      error: subagent.error,
      createdAt: subagent.createdAt,
      completedAt: subagent.completedAt,
      failedAt: subagent.failedAt,
      timedOutAt: subagent.timedOutAt
    };
  }

  /**
   * Get all subagents
   */
  getAll() {
    return Array.from(this.subagents.values());
  }

  /**
   * Get subagent by ID
   */
  get(subagentId) {
    return this.subagents.get(subagentId);
  }

  /**
   * Cancel subagent
   */
  cancel(subagentId) {
    const subagent = this.subagents.get(subagentId);
    if (subagent && subagent.status === 'running') {
      subagent.status = 'cancelled';
      subagent.cancelledAt = new Date().toISOString();
      this.subagents.set(subagentId, subagent);

      // Clear timeout
      const timeoutId = this.timeouts.get(subagentId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.timeouts.delete(subagentId);
      }

      return true;
    }
    return false;
  }

  /**
   * Reset all subagents
   */
  reset() {
    // Clear all timeouts
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId);
    }
    
    this.subagents.clear();
    this.timeouts.clear();
  }
}

module.exports = { SubagentDispatch };
