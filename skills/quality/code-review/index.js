#!/usr/bin/env node

class CodeReview {
  constructor(config = {}) {
    this.name = 'code-review';
    this.version = '1.0.0';
    this.description = 'Detailed code review with line-level feedback and suggestions';
  }

  review(code) {
    if (!code) return { success: false, error: 'No code to review.' };

    const comments = [];
    const lines = code.split('\n');

    lines.forEach((line, i) => {
      const num = i + 1;
      const trimmed = line.trim();

      if (
        !trimmed ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*')
      )
        {return;}

      if (trimmed.length > 100) {
        comments.push({
          line: num,
          severity: 'info',
          message: 'Line is too long. Consider breaking it up.',
          suggestion: 'Split at logical operators or after 100 characters.',
        });
      }

      if (/TODO|FIXME|HACK|XXX/.test(trimmed)) {
        comments.push({
          line: num,
          severity: 'info',
          message: `Found "${trimmed.match(/(TODO|FIXME|HACK|XXX)/)[0]}" comment.`,
          suggestion: 'Address this before shipping.',
        });
      }

      if (/\bvar\s/.test(trimmed)) {
        comments.push({
          line: num,
          severity: 'warning',
          message: 'Using var instead of const/let.',
          suggestion: 'Replace var with const (preferred) or let.',
        });
      }

      if (/\bany\b/.test(trimmed) && trimmed.includes(':')) {
        comments.push({
          line: num,
          severity: 'warning',
          message: 'Using `any` type.',
          suggestion: 'Use a more specific type for better type safety.',
        });
      }

      if (/console\.log|print\(/.test(trimmed)) {
        comments.push({
          line: num,
          severity: 'info',
          message: 'Debugging statement.',
          suggestion: 'Remove or replace with a proper logging library.',
        });
      }

      if (/\bswitch\b/.test(trimmed)) {
        comments.push({
          line: num,
          severity: 'info',
          message: 'Switch statement.',
          suggestion: 'Consider using a map/object lookup instead.',
        });
      }

      if (/catch\s*\([^)]*\)\s*\{\s*$/.test(trimmed) && lines[i + 1]?.trim() === '}') {
        comments.push({
          line: num,
          severity: 'critical',
          message: 'Empty catch block.',
          suggestion: 'Log the error or handle it. Empty catches hide bugs.',
        });
      }

      if (/\binnerHTML\b/.test(trimmed)) {
        comments.push({
          line: num,
          severity: 'warning',
          message: 'Using innerHTML.',
          suggestion: 'Use textContent or a safe rendering method to prevent XSS.',
        });
      }
    });

    const severityCounts = { critical: 0, warning: 0, info: 0 };
    comments.forEach(c => severityCounts[c.severity]++);

    return {
      success: true,
      summary: `Reviewed ${lines.length} lines — ${comments.length} comment(s) (${severityCounts.critical} critical, ${severityCounts.warning} warning, ${severityCounts.info} info).`,
      comments,
      stats: { totalLines: lines.length, comments: comments.length, ...severityCounts },
      timestamp: new Date().toISOString(),
    };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

if (require.main === module) {
  const skill = new CodeReview();
  const input = process.argv[2] || '';
  const r = skill.review(input || 'var x: any = "test";\nconsole.log(x);');
  console.log(JSON.stringify(r, null, 2));
}

module.exports = CodeReview;
