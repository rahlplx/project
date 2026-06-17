#!/usr/bin/env node

class VibeReview {
  constructor(config = {}) {
    this.name = 'vibe-review';
    this.version = '1.0.0';
    this.description = 'Non-technical code review — plain English feedback for vibe coders';
  }

  review(code, options = {}) {
    if (!code) return { success: false, error: 'No code provided.' };

    const findings = this._analyze(code);
    const rating = this._calculateRating(findings);
    const summary = this._generateSummary(findings, rating);

    return {
      success: true,
      rating,
      summary,
      findings: findings.filter(f => f.severity !== 'info'),
      info: findings.filter(f => f.severity === 'info'),
      stats: {
        totalLines: code.split('\n').length,
        issuesFound: findings.length,
        criticalIssues: findings.filter(f => f.severity === 'critical').length,
        warnings: findings.filter(f => f.severity === 'warning').length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  _analyze(code) {
    const findings = [];
    const lines = code.split('\n');

    if (lines.length > 500)
      {findings.push({
        severity: 'warning',
        category: 'size',
        message: 'File is very long (>500 lines). Consider breaking it into smaller files.',
      });}
    if (lines.length > 1000)
      {findings.push({
        severity: 'critical',
        category: 'size',
        message: 'File is extremely long (>1000 lines). This is hard to maintain.',
      });}

    const codeStr = code.replace(/\s+/g, ' ');
    if (/console\.log|print\(|debugger/.test(codeStr) && !/\/\/.*console\.log/g.test(codeStr)) {
      const matches = codeStr.match(/console\.log/g) || [];
      if (matches.length > 3)
        {findings.push({
          severity: 'warning',
          category: 'debug',
          message: `Found ${matches.length} console.log statements. Remove before shipping.`,
        });}
    }

    if (/TODO|FIXME|HACK|XXX/i.test(codeStr)) {
      const todos = (codeStr.match(/TODO|FIXME|HACK|XXX/gi) || []).length;
      findings.push({
        severity: 'info',
        category: 'todo',
        message: `Found ${todos} TODO/FIXME comment(s). Review before shipping.`,
      });
    }

    if (/API_KEY\s*=|SECRET\s*=|password\s*=|token\s*=\s*['"][^'"]{8,}['"]/.test(codeStr)) {
      findings.push({
        severity: 'critical',
        category: 'security',
        message: 'Potential hardcoded secret detected! Use environment variables instead.',
      });
    }

    if (/var\s/.test(codeStr)) {
      findings.push({
        severity: 'warning',
        category: 'style',
        message: 'Using "var" — prefer "const" or "let" for better scoping.',
      });
    }

    if (codeStr.includes('function') && !codeStr.includes('=>')) {
      findings.push({
        severity: 'info',
        category: 'style',
        message: 'Consider using arrow functions for cleaner syntax.',
      });
    }

    if (/\beval\s*\(/.test(codeStr))
      {findings.push({
        severity: 'critical',
        category: 'security',
        message: 'Using eval() is dangerous. Find a safer alternative.',
      });}

    if (/innerHTML\s*=/.test(codeStr))
      {findings.push({
        severity: 'warning',
        category: 'security',
        message:
          'Using innerHTML can lead to XSS vulnerabilities. Use textContent or safe rendering.',
      });}

    if (/\bany\b/.test(codeStr)) {
      const anyCount = (codeStr.match(/\bany\b/g) || []).length;
      if (anyCount > 3)
        {findings.push({
          severity: 'warning',
          category: 'types',
          message: `Using "any" ${anyCount} times. Prefer specific types for better safety.`,
        });}
    }

    if (codeStr.includes('try') && !codeStr.includes('catch'))
      {findings.push({
        severity: 'warning',
        category: 'error',
        message: 'Found try without catch — errors will be silently swallowed.',
      });}

    if (codeStr.includes('.env') || codeStr.includes('process.env'))
      {findings.push({
        severity: 'info',
        category: 'config',
        message: 'Using environment variables for config — good practice!',
      });}

    if (!codeStr.includes('/*') && !codeStr.includes('//') && !codeStr.includes('#'))
      {findings.push({
        severity: 'info',
        category: 'docs',
        message: 'No comments found. Consider adding brief documentation for complex logic.',
      });}

    return findings;
  }

  _calculateRating(findings) {
    const critical = findings.filter(f => f.severity === 'critical').length;
    const warnings = findings.filter(f => f.severity === 'warning').length;
    if (critical > 0)
      {return {
        label: 'Needs Work',
        score: Math.max(1, 10 - critical * 3 - warnings),
        color: 'red',
      };}
    if (warnings > 3) return { label: 'Fair', score: Math.max(4, 10 - warnings), color: 'yellow' };
    if (warnings > 0) return { label: 'Good', score: Math.max(7, 10 - warnings), color: 'yellow' };
    return { label: 'Excellent', score: 10, color: 'green' };
  }

  _generateSummary(findings, rating) {
    const parts = [];
    parts.push(`Review complete. Rating: ${rating.label} (${rating.score}/10).`);
    const critical = findings.filter(f => f.severity === 'critical').length;
    const warnings = findings.filter(f => f.severity === 'warning').length;
    if (critical > 0)
      {parts.push(`${critical} critical issue(s) that must be fixed before shipping.`);}
    if (warnings > 0) parts.push(`${warnings} warning(s) to review.`);
    if (critical === 0 && warnings === 0) parts.push('No issues found — looks good!');
    return parts.join(' ');
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

if (require.main === module) {
  const skill = new VibeReview();
  const input = process.argv[2] || '';
  console.log(JSON.stringify(skill.review(input || 'const x = 1;'), null, 2));
}

module.exports = VibeReview;
