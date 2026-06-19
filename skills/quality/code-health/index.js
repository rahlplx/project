'use strict';

const fs = require('fs');
const path = require('path');

const HEALTH_CHECKS = [
  {
    id: 'no_console_log',
    name: 'No debug console.log',
    pattern: /console\.log\(/,
    severity: 'warning',
    fix: 'Remove debug logs before shipping',
  },
  {
    id: 'no_todo_fixme',
    name: 'No TODO/FIXME',
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX)/i,
    severity: 'info',
    fix: 'Resolve TODOs before shipping',
  },
  {
    id: 'no_hardcoded_url',
    name: 'No hardcoded URLs',
    pattern: /https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.\d+\.\d+\.\d+)/,
    severity: 'warning',
    fix: 'Use environment variables for URLs',
  },
  {
    id: 'no_any_type',
    name: 'No TypeScript any',
    pattern: /:\s*any\b/,
    severity: 'warning',
    fix: 'Use proper types instead of any',
  },
  {
    id: 'no_empty_catch',
    name: 'No empty catch',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/,
    severity: 'warning',
    fix: 'Handle errors or log them',
  },
  {
    id: 'no_var',
    name: 'Use let/const not var',
    pattern: /\bvar\s+\w+/,
    severity: 'info',
    fix: 'Replace var with let or const',
  },
  {
    id: 'no_eval',
    name: 'No eval()',
    pattern: /\beval\s*\(/,
    severity: 'critical',
    fix: 'Never use eval() — security risk',
  },
  {
    id: 'no_innerHTML',
    name: 'No innerHTML with variables',
    pattern: /\.innerHTML\s*=\s*[^'"`;]/,
    severity: 'high',
    fix: 'Use textContent or DOM methods to prevent XSS',
  },
  {
    id: 'no_alert',
    name: 'No alert/confirm/prompt',
    pattern: /\b(alert|confirm|prompt)\s*\(/,
    severity: 'warning',
    fix: 'Use UI components instead of browser dialogs',
  },
  {
    id: 'reasonable_line_length',
    name: 'Reasonable line length',
    pattern: /.{201,}/,
    severity: 'info',
    fix: 'Break long lines for readability',
  },
];

class CodeHealth {
  constructor(options = {}) {
    this.name = 'code-health';
    this.description =
      'Static code health checks: no eval, no innerHTML, no empty catch, line length';
    this.options = options;
    this.projectRoot = options.projectRoot || process.cwd();
  }

  _ts() {
    return new Date().toISOString();
  }

  analyzeFile(filePath) {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);
    if (!fs.existsSync(abs)) {
      return { type: 'error', timestamp: this._ts(), message: `File not found: ${filePath}` };
    }
    const content = fs.readFileSync(abs, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    for (const check of HEALTH_CHECKS) {
      for (let i = 0; i < lines.length; i++) {
        if (check.pattern.test(lines[i])) {
          issues.push({
            checkId: check.id,
            checkName: check.name,
            severity: check.severity,
            line: i + 1,
            code: lines[i].trim().slice(0, 80),
            fix: check.fix,
          });
        }
      }
    }
    const score = Math.max(
      0,
      100 -
        issues.filter(i => i.severity === 'critical').length * 30 -
        issues.filter(i => i.severity === 'high').length * 15 -
        issues.filter(i => i.severity === 'warning').length * 5 -
        issues.filter(i => i.severity === 'info').length * 1
    );
    return {
      type: 'file_health',
      timestamp: this._ts(),
      file: filePath,
      linesOfCode: lines.length,
      issueCount: issues.length,
      score,
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
      issues: issues.slice(0, 20),
      summary: issues.length === 0 ? 'No issues found' : `${issues.length} issues found`,
    };
  }

  analyzeDirectory(dirPath, extensions) {
    const abs = path.isAbsolute(dirPath) ? dirPath : path.join(this.projectRoot, dirPath);
    const exts = extensions || ['.js', '.ts', '.jsx', '.tsx'];
    const results = [];
    this._walk(abs, exts, results);
    const totalIssues = results.reduce((n, r) => n + (r.issueCount || 0), 0);
    const avgScore =
      results.length > 0
        ? Math.round(results.reduce((n, r) => n + (r.score || 0), 0) / results.length)
        : 100;
    return {
      type: 'directory_health',
      timestamp: this._ts(),
      directory: dirPath,
      filesAnalyzed: results.length,
      totalIssues,
      averageScore: avgScore,
      overallGrade: avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : 'D',
      worstFiles: results
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 5)
        .map(r => ({ file: r.file, score: r.score, issues: r.issueCount })),
    };
  }

  _walk(dir, exts, results) {
    if (!fs.existsSync(dir)) return;
    const skip = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    for (const item of fs.readdirSync(dir)) {
      if (skip.includes(item)) continue;
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        this._walk(full, exts, results);
      } else if (exts.some(e => item.endsWith(e))) {
        const rel = path.relative(this.projectRoot, full);
        results.push(this.analyzeFile(rel));
      }
    }
  }

  getCheckList() {
    return {
      type: 'health_checks',
      timestamp: this._ts(),
      checks: HEALTH_CHECKS.map(c => ({
        id: c.id,
        name: c.name,
        severity: c.severity,
        fix: c.fix,
      })),
    };
  }

  toMarkdown(analysis) {
    if (!analysis) return '# Code Health\nRun analyzeFile() or analyzeDirectory() first.';
    const a = analysis;
    const lines = [
      '# Code Health Report',
      `**Target:** ${a.file || a.directory}`,
      `**Score:** ${a.score || a.averageScore}/100 (Grade: ${a.grade || a.overallGrade})`,
      `**Issues:** ${a.issueCount || a.totalIssues}`,
      '',
    ];
    if (a.issues && a.issues.length > 0) {
      lines.push('## Issues Found');
      for (const i of a.issues) {
        const icon =
          i.severity === 'critical'
            ? '🔴'
            : i.severity === 'high'
              ? '🟠'
              : i.severity === 'warning'
                ? '🟡'
                : 'ℹ️';
        lines.push(`${icon} **Line ${i.line}** (${i.checkName}): \`${i.code}\``);
        lines.push(`  → Fix: ${i.fix}`);
      }
    }
    return lines.join('\n');
  }

  toJSON() {
    return { checks: HEALTH_CHECKS.map(c => ({ id: c.id, name: c.name, severity: c.severity })) };
  }
}

module.exports = CodeHealth;
