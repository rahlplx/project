/**
 * Knowledge Base Module
 * Stores and retrieves patterns from completed projects, with disk persistence
 * so patterns survive process restarts (closes the in-memory-only gap).
 */

const fs = require('fs');
const path = require('path');

class KnowledgeBase {
  constructor() {
    this.patterns = [];
    this.stats = {
      totalProjects: 0,
      totalPatterns: 0
    };
  }

  addPattern(pattern) {
    this.patterns.push(pattern);
    this.stats.totalPatterns = this.patterns.length;
  }

  getPatternsByCategory(category) {
    return this.patterns.filter(p => p.category === category);
  }

  incrementProjectCount() {
    this.stats.totalProjects++;
  }

  getStats() {
    return {
      totalProjects: this.stats.totalProjects,
      totalPatterns: this.stats.totalPatterns
    };
  }

  save(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ patterns: this.patterns, stats: this.stats }, null, 2), 'utf8');
    return filePath;
  }

  load(filePath) {
    if (!fs.existsSync(filePath)) return false;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    this.patterns = data.patterns || [];
    this.stats = data.stats || { totalProjects: 0, totalPatterns: this.patterns.length };
    return true;
  }

  autoSave(vibeDir = path.join(process.cwd(), '.vibe')) {
    return this.save(path.join(vibeDir, 'knowledge-base.json'));
  }

  autoLoad(vibeDir = path.join(process.cwd(), '.vibe')) {
    return this.load(path.join(vibeDir, 'knowledge-base.json'));
  }
}

module.exports = { KnowledgeBase };
