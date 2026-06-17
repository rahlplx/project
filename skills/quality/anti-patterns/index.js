#!/usr/bin/env node

class AntiPatterns {
  constructor(config = {}) {
    this.name = 'anti-patterns';
    this.version = '1.0.0';
    this.description = 'Detects common coding anti-patterns and suggests better alternatives';
  }

  analyze(code) {
    if (!code) return { success: false, error: 'No code provided.' };

    const patterns = this._getPatterns();
    const findings = [];

    for (const p of patterns) {
      if (p.check(code)) {
        findings.push({
          id: p.id,
          name: p.name,
          category: p.category,
          severity: p.severity,
          message: p.message,
          suggestion: p.suggestion,
        });
      }
    }

    return {
      success: true,
      findings,
      stats: {
        total: findings.length,
        critical: findings.filter(f => f.severity === 'critical').length,
        warning: findings.filter(f => f.severity === 'warning').length,
        info: findings.filter(f => f.severity === 'info').length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  _getPatterns() {
    return [
      {
        id: 'AP01',
        category: 'code',
        severity: 'warning',
        name: 'Magic Numbers',
        message: 'Using raw numbers instead of named constants',
        suggestion: 'Assign numbers to descriptive constants (const MAX_USERS = 100)',
        check: c => (c.match(/\b\d{4,}\b/g) || []).length > 3,
      },
      {
        id: 'AP02',
        category: 'code',
        severity: 'warning',
        name: 'Long Functions',
        message: 'Functions that try to do too much',
        suggestion: 'Break into smaller single-purpose functions',
        check: c => {
          const fns = c.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g);
          return (fns || []).filter(f => f.length > 500).length > 0;
        },
      },
      {
        id: 'AP03',
        category: 'code',
        severity: 'info',
        name: 'Deep Nesting',
        message: 'Code nested more than 3 levels deep',
        suggestion: 'Use early returns, guard clauses, or extract logic',
        check: c => (c.match(/\{/g) || []).length - (c.match(/\}/g) || []).length > 3,
      },
      {
        id: 'AP04',
        category: 'style',
        severity: 'warning',
        name: 'Inconsistent Naming',
        message: 'Mix of naming conventions (snake_case, camelCase, PascalCase)',
        suggestion: 'Pick one convention: camelCase for JS/TS, snake_case for Python',
        check: c => {
          const hasSnake = /[a-z]+_[a-z]+/.test(c);
          const hasCamel = /[a-z]+[A-Z][a-z]+/.test(c);
          return hasSnake && hasCamel;
        },
      },
      {
        id: 'AP05',
        category: 'style',
        severity: 'info',
        name: 'Long Lines',
        message: 'Lines longer than 100 characters are hard to read',
        suggestion: 'Break long lines at logical points',
        check: c => c.split('\n').some(l => l.length > 100),
      },
      {
        id: 'AP06',
        category: 'error',
        severity: 'critical',
        name: 'Empty Catch Blocks',
        message: 'Catch blocks that silently swallow errors',
        suggestion: 'Log the error or handle it appropriately',
        check: c => /catch\s*\([^)]*\)\s*\{\s*\}/g.test(c),
      },
      {
        id: 'AP07',
        category: 'error',
        severity: 'warning',
        name: 'Comparing Floats Directly',
        message: 'Floating point comparison may fail',
        suggestion: 'Use tolerance: Math.abs(a - b) < 0.0001',
        check: c => /\d+\.\d+\s*===\s*\d+\.\d+/.test(c),
      },
      {
        id: 'AP08',
        category: 'design',
        severity: 'info',
        name: 'God Object',
        message: 'Classes or objects with too many responsibilities',
        suggestion: 'Split into focused smaller classes',
        check: c => (c.match(/class\s+\w+/g) || []).length === 1 && c.length > 2000,
      },
      {
        id: 'AP09',
        category: 'code',
        severity: 'warning',
        name: 'Duplicate Code',
        message: 'Similar code blocks detected',
        suggestion: 'Extract repeated logic into a shared function',
        check: c => {
          const lines = c.split('\n');
          const unique = new Set(lines.map(l => l.trim()));
          return lines.length > 20 && unique.size < lines.length * 0.6;
        },
      },
      {
        id: 'AP10',
        category: 'style',
        severity: 'info',
        name: 'Missing Semicolons',
        message: 'Inconsistent semicolon usage in JS/TS',
        suggestion: 'Use a linter to enforce consistent style',
        check: c => {
          const jsLines = c
            .split('\n')
            .filter(l => /^(const|let|var|return|console)/.test(l.trim()));
          return jsLines.length > 0 && jsLines.some(l => !l.trim().endsWith(';'));
        },
      },
    ];
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      patterns: this._getPatterns().length,
    };
  }
}

if (require.main === module) {
  const skill = new AntiPatterns();
  const input = process.argv[2] || '';
  const r = skill.analyze(input || 'const x = 12345; const y = 67890;');
  r.findings.forEach(f => console.log(`  [${f.severity}] ${f.name}: ${f.message}`));
  console.log(`\n  ${r.stats.total} anti-pattern(s) found`);
}

module.exports = AntiPatterns;
