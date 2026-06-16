'use strict';

// OWASP Top 10 aligned security checks
const SECURITY_RULES = [
  { id: 'A01_broken_access', owasp: 'A01', name: 'Broken Access Control', severity: 'critical', checks: ['API routes have auth checks', 'User can only access own data', 'Admin routes require admin role', 'No directory listing exposed'] },
  { id: 'A02_crypto_failures', owasp: 'A02', name: 'Cryptographic Failures', severity: 'critical', checks: ['Passwords are hashed (bcrypt/argon2)', 'Sensitive data encrypted at rest', 'HTTPS enforced in production', 'No MD5/SHA1 for passwords'] },
  { id: 'A03_injection', owasp: 'A03', name: 'Injection', severity: 'critical', checks: ['SQL queries use parameterized inputs', 'User input is sanitized before HTML output', 'No eval() with user input', 'Shell commands escape user input'] },
  { id: 'A04_insecure_design', owasp: 'A04', name: 'Insecure Design', severity: 'high', checks: ['Rate limiting on auth endpoints', 'No sensitive data in URLs', 'Secure defaults everywhere', 'Principle of least privilege'] },
  { id: 'A05_security_misconfig', owasp: 'A05', name: 'Security Misconfiguration', severity: 'high', checks: ['No default passwords', 'Error messages hide stack traces in prod', 'CORS configured restrictively', 'Security headers set (CSP, HSTS, X-Frame-Options)'] },
  { id: 'A06_vulnerable_components', owasp: 'A06', name: 'Vulnerable Components', severity: 'medium', checks: ['Dependencies are up to date', 'No known CVEs in npm audit', 'Unused packages removed', 'Lock files committed'] },
  { id: 'A07_auth_failures', owasp: 'A07', name: 'Auth & Session Failures', severity: 'critical', checks: ['Session tokens are unpredictable', 'Sessions expire after inactivity', 'Logout invalidates server session', 'Multi-factor auth available for sensitive actions'] },
  { id: 'A08_software_integrity', owasp: 'A08', name: 'Software & Data Integrity', severity: 'medium', checks: ['CI/CD pipeline is secured', 'Dependencies from trusted sources', 'No unsigned code execution', 'Build artifacts are verified'] },
  { id: 'A09_logging_monitoring', owasp: 'A09', name: 'Logging & Monitoring', severity: 'medium', checks: ['Auth failures are logged', 'No sensitive data in logs', 'Logs are stored securely', 'Alerts for suspicious activity'] },
  { id: 'A10_ssrf', owasp: 'A10', name: 'Server-Side Request Forgery', severity: 'high', checks: ['External URLs are validated before fetch', 'Internal services not accessible via user URLs', 'URL allowlist for outbound requests'] }
];

const CODE_PATTERNS = [
  { id: 'hardcoded_secret', pattern: /(?:api[_-]?key|secret|password|token)\s*[=:]\s*['"`][a-zA-Z0-9_-]{10,}/i, severity: 'critical', message: 'Possible hardcoded secret' },
  { id: 'sql_concat', pattern: /['"`]\s*\+\s*(?:req\.|params\.|body\.|query\.)/i, severity: 'critical', message: 'Possible SQL injection — string concatenation with user input' },
  { id: 'inner_html_var', pattern: /innerHTML\s*=\s*(?!['"`])[^;]+/, severity: 'high', message: 'innerHTML with variable — possible XSS' },
  { id: 'no_auth_check', pattern: /router\.(get|post|put|delete)\s*\(['"`][^'"` ]+['"`]\s*,\s*(?!auth|verify|require)\w+\s*\)/, severity: 'warning', message: 'Route handler without apparent auth middleware' },
  { id: 'cors_star', pattern: /cors\(\s*\{\s*origin\s*:\s*['"]\*['"]/, severity: 'high', message: 'CORS allows all origins — too permissive for production' },
  { id: 'md5_password', pattern: /md5\s*\(.*password|password.*md5/i, severity: 'critical', message: 'MD5 is not safe for password hashing — use bcrypt or argon2' }
];

class SecurityAudit {
  constructor(options = {}) {
    this.options = options;
  }

  _ts() { return new Date().toISOString(); }

  scanCode(code) {
    const found = CODE_PATTERNS.filter(p => p.pattern.test(code));
    return {
      type: 'code_scan',
      timestamp: this._ts(),
      issuesFound: found.length,
      issues: found.map(p => ({ id: p.id, severity: p.severity, message: p.message })),
      safe: found.length === 0
    };
  }

  auditChecklist(appType) {
    const relevant = appType === 'api'
      ? SECURITY_RULES.filter(r => !['A08_software_integrity'].includes(r.id))
      : SECURITY_RULES;
    return {
      type: 'security_checklist',
      timestamp: this._ts(),
      appType: appType || 'web',
      totalCategories: relevant.length,
      criticalCategories: relevant.filter(r => r.severity === 'critical').length,
      checklist: relevant.map(r => ({
        id: r.id,
        owasp: r.owasp,
        name: r.name,
        severity: r.severity,
        checks: r.checks.map(c => ({ check: c, status: 'unchecked' }))
      }))
    };
  }

  evaluate(answers) {
    // answers = { ruleId: { passed: boolean, notes: string } }
    const results = SECURITY_RULES.map(r => {
      const answer = answers[r.id];
      return { ...r, passed: answer ? answer.passed : null, notes: answer ? answer.notes : null };
    });
    const failed = results.filter(r => r.passed === false);
    const criticalFailed = failed.filter(r => r.severity === 'critical');
    return {
      type: 'security_evaluation',
      timestamp: this._ts(),
      overallRisk: criticalFailed.length > 0 ? 'CRITICAL' : failed.length > 3 ? 'HIGH' : failed.length > 0 ? 'MEDIUM' : 'LOW',
      passedCount: results.filter(r => r.passed === true).length,
      failedCount: failed.length,
      unevaluatedCount: results.filter(r => r.passed === null).length,
      criticalFailures: criticalFailed.map(r => ({ id: r.id, name: r.name, notes: r.notes })),
      allFailures: failed.map(r => ({ id: r.id, owasp: r.owasp, name: r.name, severity: r.severity })),
      readyToShip: criticalFailed.length === 0
    };
  }

  getOwaspRule(owaspId) {
    const rule = SECURITY_RULES.find(r => r.owasp === owaspId);
    if (!rule) return { type: 'error', timestamp: this._ts(), message: `OWASP rule ${owaspId} not found` };
    return { type: 'owasp_rule', timestamp: this._ts(), ...rule };
  }

  toMarkdown() {
    const lines = ['# Security Audit Checklist (OWASP Top 10)', ''];
    for (const r of SECURITY_RULES) {
      const sev = r.severity === 'critical' ? '🔴' : r.severity === 'high' ? '🟠' : '🟡';
      lines.push(`## ${sev} ${r.owasp}: ${r.name} (${r.severity})`);
      for (const c of r.checks) {
        lines.push(`- [ ] ${c}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }

  toJSON() {
    return { rules: SECURITY_RULES.map(r => ({ id: r.id, owasp: r.owasp, name: r.name, severity: r.severity })) };
  }
}

module.exports = SecurityAudit;
