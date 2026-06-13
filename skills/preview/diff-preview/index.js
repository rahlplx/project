/**
 * Diff Preview Skill
 * Visual diff visualization for code changes
 */

class DiffPreview {
  constructor(options = {}) {
    this.name = 'diff-preview';
    this.contextLines = options.contextLines || 3;
    this.showLineNumbers = options.showLineNumbers !== false;
    this.colorize = options.colorize !== false;
    this.wordDiff = options.wordDiff || false;
  }

  /**
   * Generate a visual diff between two code versions
   * @param {string} oldCode - Original code
   * @param {string} newCode - Modified code
   * @param {Object} options - Diff options
   * @returns {Object} Diff result with visual representation
   */
  generateDiff(oldCode, newCode, options = {}) {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    
    const diff = this.computeDiff(oldLines, newLines);
    const stats = this.computeStats(diff);
    const visual = this.renderVisualDiff(diff, options);
    
    return {
      type: 'diff',
      timestamp: new Date().toISOString(),
      stats,
      hunks: this.groupIntoHunks(diff),
      visual,
      summary: this.generateSummary(diff)
    };
  }

  /**
   * Compute line-by-line diff using LCS algorithm
   */
  computeDiff(oldLines, newLines) {
    const m = oldLines.length;
    const n = newLines.length;
    
    // Build LCS matrix
    const lcs = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          lcs[i][j] = lcs[i - 1][j - 1] + 1;
        } else {
          lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
      }
    }
    
    // Backtrack to find diff
    const changes = [];
    let i = m, j = n;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        changes.unshift({ type: 'unchanged', oldLine: i, newLine: j, content: oldLines[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        changes.unshift({ type: 'added', newLine: j, content: newLines[j - 1] });
        j--;
      } else {
        changes.unshift({ type: 'removed', oldLine: i, content: oldLines[i - 1] });
        i--;
      }
    }
    
    return changes;
  }

  /**
   * Compute statistics from diff
   */
  computeStats(diff) {
    const additions = diff.filter(d => d.type === 'added').length;
    const deletions = diff.filter(d => d.type === 'removed').length;
    const unchanged = diff.filter(d => d.type === 'unchanged').length;
    
    return {
      additions,
      deletions,
      unchanged,
      totalChanges: additions + deletions
    };
  }

  /**
   * Group diff changes into hunks
   */
  groupIntoHunks(diff) {
    const hunks = [];
    let currentHunk = null;
    const hunkStart = 0;
    
    for (let i = 0; i < diff.length; i++) {
      const change = diff[i];
      
      if (change.type !== 'unchanged') {
        if (!currentHunk) {
          currentHunk = { changes: [], startIndex: i };
        }
        currentHunk.changes.push(change);
      } else if (currentHunk) {
        // Check if we should close the hunk (more than 2 context lines)
        const contextAfter = this.countContextLines(diff, i);
        if (contextAfter >= this.contextLines) {
          currentHunk.endIndex = i;
          hunks.push(currentHunk);
          currentHunk = null;
        }
      }
    }
    
    if (currentHunk) {
      currentHunk.endIndex = diff.length;
      hunks.push(currentHunk);
    }
    
    return hunks;
  }

  /**
   * Count consecutive context lines after an index
   */
  countContextLines(diff, startIndex) {
    let count = 0;
    for (let i = startIndex; i < diff.length && diff[i].type === 'unchanged'; i++) {
      count++;
    }
    return count;
  }

  /**
   * Render visual diff with ANSI colors
   */
  renderVisualDiff(diff, options = {}) {
    const lines = [];
    const showNumbers = options.showLineNumbers !== false;
    const useColor = options.colorize !== false && this.colorize;
    
    let oldLine = 1;
    let newLine = 1;
    
    for (const change of diff) {
      let prefix = ' ';
      let content = change.content;
      
      if (change.type === 'added') {
        prefix = useColor ? '\x1b[32m+\x1b[0m' : '+';
        content = change.content;
      } else if (change.type === 'removed') {
        prefix = useColor ? '\x1b[31m-\x1b[0m' : '-';
        content = change.content;
      } else {
        content = ' ' + content;
      }
      
      if (showNumbers) {
        const oldNum = change.type === 'added' ? '' : String(oldLine).padStart(4, ' ');
        const newNum = change.type === 'removed' ? '' : String(newLine).padStart(4, ' ');
        lines.push(`${oldNum} ${newNum} ${prefix} ${content}`);
      } else {
        lines.push(`${prefix} ${content}`);
      }
      
      if (change.type !== 'added') oldLine++;
      if (change.type !== 'removed') newLine++;
    }
    
    return lines.join('\n');
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(diff) {
    const stats = this.computeStats(diff);
    
    if (stats.totalChanges === 0) {
      return 'No changes detected.';
    }
    
    const parts = [];
    if (stats.additions > 0) {
      parts.push(`${stats.additions} addition${stats.additions > 1 ? 's' : ''}`);
    }
    if (stats.deletions > 0) {
      parts.push(`${stats.deletions} deletion${stats.deletions > 1 ? 's' : ''}`);
    }
    
    return `${parts.join(', ')} in ${diff.length} lines`;
  }

  /**
   * Generate side-by-side diff view
   */
  renderSideBySide(oldCode, newCode, options = {}) {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    const maxWidth = options.maxWidth || 40;
    
    const diff = this.computeDiff(oldLines, newLines);
    const lines = [];
    
    let oldIdx = 0;
    let newIdx = 0;
    
    for (const change of diff) {
      if (change.type === 'unchanged') {
        const oldLine = oldLines[oldIdx]?.substring(0, maxWidth) || '';
        const newLine = newLines[newIdx]?.substring(0, maxWidth) || '';
        lines.push({
          type: 'unchanged',
          left: oldLine.padEnd(maxWidth),
          right: newLine.padEnd(maxWidth)
        });
        oldIdx++;
        newIdx++;
      } else if (change.type === 'removed') {
        const oldLine = oldLines[oldIdx]?.substring(0, maxWidth) || '';
        lines.push({
          type: 'removed',
          left: oldLine.padEnd(maxWidth),
          right: ''.padEnd(maxWidth)
        });
        oldIdx++;
      } else {
        const newLine = newLines[newIdx]?.substring(0, maxWidth) || '';
        lines.push({
          type: 'added',
          left: ''.padEnd(maxWidth),
          right: newLine.padEnd(maxWidth)
        });
        newIdx++;
      }
    }
    
    return lines;
  }

  /**
   * Generate unified diff format
   */
  generateUnifiedDiff(oldCode, newCode, filename = 'file.js') {
    const diff = this.computeDiff(oldCode.split('\n'), newCode.split('\n'));
    const hunks = this.groupIntoHunks(diff);
    
    let output = `--- a/${filename}\n+++ b/${filename}\n`;
    
    for (const hunk of hunks) {
      const startOld = hunk.changes.find(c => c.type !== 'added')?.oldLine || 1;
      const endOld = hunk.changes.filter(c => c.type !== 'removed').reduce((max, c) => Math.max(max, c.oldLine || 0), 0);
      const startNew = hunk.changes.find(c => c.type !== 'removed')?.newLine || 1;
      const endNew = hunk.changes.filter(c => c.type === 'added').reduce((max, c) => Math.max(max, c.newLine || 0), 0);
      
      output += `@@ -${startOld},${endOld - startOld + 1} +${startNew},${endNew - startNew + 1} @@\n`;
      
      for (const change of hunk.changes) {
        if (change.type === 'removed') {
          output += `-${change.content}\n`;
        } else if (change.type === 'added') {
          output += `+${change.content}\n`;
        } else {
          output += ` ${change.content}\n`;
        }
      }
    }
    
    return output;
  }

  /**
   * Create inline diff with highlights
   */
  generateInlineDiff(oldCode, newCode) {
    if (!this.wordDiff) {
      return this.generateDiff(oldCode, newCode);
    }
    
    const diff = this.computeDiff(oldCode.split('\n'), newCode.split('\n'));
    const result = { ...diff };
    
    // For word-level diff, process each line
    for (let i = 0; i < result.length; i++) {
      if (result[i].type === 'unchanged') {
        result[i].words = this.splitIntoWords(result[i].content);
      }
    }
    
    return result;
  }

  /**
   * Split text into words for word-level diff
   */
  splitIntoWords(text) {
    return text.split(/(\s+)/).filter(w => w.length > 0);
  }

  /**
   * Export diff as JSON
   */
  toJSON(oldCode, newCode) {
    const diff = this.generateDiff(oldCode, newCode);
    return JSON.stringify(diff, null, 2);
  }

  /**
   * Export diff as HTML
   */
  toHTML(oldCode, newCode, options = {}) {
    const diff = this.computeDiff(oldCode.split('\n'), newCode.split('\n'));
    const title = options.title || 'Code Diff';
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
    .diff-container { max-width: 1200px; margin: 0 auto; }
    .stats { background: #2d2d2d; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .additions { color: #4ec9b0; }
    .deletions { color: #f44747; }
    .line { padding: 2px 10px; white-space: pre; }
    .added { background: rgba(78, 201, 176, 0.2); }
    .removed { background: rgba(244, 71, 71, 0.2); }
  </style>
</head>
<body>
  <div class="diff-container">
    <h1>${title}</h1>
    <div class="stats">
      <span class="additions">+${diff.filter(d => d.type === 'added').length} additions</span> |
      <span class="deletions">-${diff.filter(d => d.type === 'removed').length} deletions</span>
    </div>
    <pre>`;
    
    for (const change of diff) {
      const cls = change.type !== 'unchanged' ? change.type : '';
      const prefix = change.type === 'added' ? '+' : change.type === 'removed' ? '-' : ' ';
      html += `<div class="line ${cls}">${prefix} ${this.escapeHTML(change.content)}</div>`;
    }
    
    html += `</pre>
  </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Escape HTML special characters
   */
  escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

module.exports = DiffPreview;