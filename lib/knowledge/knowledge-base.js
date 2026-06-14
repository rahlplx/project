/**
 * Knowledge Base Module
 * Stores and retrieves patterns from completed projects
 */

class KnowledgeBase {
  constructor() {
    this.patterns = [];
    this.stats = {
      totalProjects: 0,
      totalPatterns: 0
    };
  }

  /**
   * Add a pattern to the knowledge base
   * @param {Object} pattern - Pattern object
   */
  addPattern(pattern) {
    this.patterns.push(pattern);
    this.stats.totalPatterns = this.patterns.length;
  }

  /**
   * Get patterns by category
   * @param {string} category - Category name
   * @returns {Array} Patterns in category
   */
  getPatternsByCategory(category) {
    return this.patterns.filter(p => p.category === category);
  }

  /**
   * Increment project count
   */
  incrementProjectCount() {
    this.stats.totalProjects++;
  }

  /**
   * Get statistics
   * @returns {Object} Stats
   */
  getStats() {
    return {
      totalProjects: this.stats.totalProjects,
      totalPatterns: this.stats.totalPatterns
    };
  }
}

module.exports = { KnowledgeBase };
