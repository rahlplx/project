#!/usr/bin/env node

class SecurityDefaults {
  constructor(config = {}) {
    this.name = 'security-defaults';
    this.version = '1.0.0';
    this.description = 'OWASP-aligned security checks for AI-generated code';
  }

  audit(code, options = {}) {
    if (!code) return { success: false, error: 'No code to audit.' };

    const checks = this._runChecks(code, options);
    const passed = checks.filter(c => c.passed);
    const failed = checks.filter(c => !c.passed);
    const score = Math.round((passed.length / checks.length) * 100);

    return {
      success: true,
      score,
      summary: `${passed.length}/${checks.length} security checks passed (${score}%)`,
      passed,
      failed,
      verdict: score >= 80 ? 'PASS' : score >= 50 ? 'REVIEW' : 'FAIL',
      timestamp: new Date().toISOString(),
    };
  }

  _runChecks(code, options = {}) {
    const checks = [
      {
        id: 'SEC01',
        name: 'No hardcoded secrets',
        category: 'secrets',
        passed:
          !/['"][A-Za-z0-9_-]{20,}['"]/.test(code) &&
          !/(sk-|pk-|api_key|secret)\s*[:=]\s*['"][^'"]+['"]/i.test(code),
      },
      {
        id: 'SEC02',
        name: 'Uses environment variables for config',
        category: 'config',
        passed: /process\.env|os\.getenv|config|\.env/i.test(code) || options.noEnvCheck,
      },
      {
        id: 'SEC03',
        name: 'No eval() or dangerous functions',
        category: 'code',
        passed: !/\beval\s*\(/.test(code),
      },
      {
        id: 'SEC04',
        name: 'Input validation present',
        category: 'input',
        passed:
          /(validate|sanitize|escape|trim|check|verify|isNaN|typeof)/i.test(code) ||
          options.skipInputCheck,
      },
      {
        id: 'SEC05',
        name: 'HTTPS for external requests',
        category: 'network',
        passed: !/http:\/\/(?!localhost)/.test(code) || options.allowHttp,
      },
      {
        id: 'SEC06',
        name: 'SQL injection protection',
        category: 'database',
        passed:
          !/SELECT.*\+|INSERT.*\+|query\([`'"][^`'"]*\$\{/.test(code) ||
          !/sql|query|database/i.test(code) ||
          options.skipDbCheck,
      },
      {
        id: 'SEC07',
        name: 'No dangerous innerHTML',
        category: 'xss',
        passed: !/innerHTML\s*=/.test(code) || /DOMPurify|sanitize/.test(code),
      },
      {
        id: 'SEC08',
        name: 'Password hashing (if auth)',
        category: 'auth',
        passed:
          !/(password|passwd|pwd)/i.test(code) ||
          /bcrypt|argon|hash|scrypt|pbkdf2/i.test(code) ||
          options.skipAuthCheck,
      },
      {
        id: 'SEC09',
        name: 'Rate limiting (if API)',
        category: 'api',
        passed:
          !/(app\.(get|post|put|delete|patch)|router\.)/i.test(code) ||
          /rate.?limit|throttle|express-rate-limit/i.test(code) ||
          options.skipRateLimit,
      },
      {
        id: 'SEC10',
        name: 'CORS configured (if API)',
        category: 'api',
        passed:
          !/(app\.(get|post|put|delete|patch)|router\.)/i.test(code) ||
          /cors|Access-Control/i.test(code) ||
          options.skipCorsCheck,
      },
    ];
    return checks;
  }

  getOWASPReference() {
    return {
      top10: [
        { id: 'A01', name: 'Broken Access Control', check: 'SEC08' },
        { id: 'A02', name: 'Cryptographic Failures', check: 'SEC01' },
        { id: 'A03', name: 'Injection', check: 'SEC06' },
        { id: 'A04', name: 'Insecure Design', check: 'SEC04' },
        { id: 'A05', name: 'Security Misconfiguration', check: 'SEC02' },
        { id: 'A07', name: 'Identification and Authentication Failures', check: 'SEC08' },
        { id: 'A08', name: 'Software and Data Integrity Failures', check: 'SEC03' },
      ],
    };
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      reference: 'OWASP Top 10 (2021)',
    };
  }
}

if (require.main === module) {
  const skill = new SecurityDefaults();
  const input = process.argv[2] || '';
  const r = skill.audit(input || 'const x = 1;');
  r.failed.forEach(c => console.log(`  FAIL ${c.id}: ${c.name}`));
  r.passed.forEach(c => console.log(`  PASS ${c.id}: ${c.name}`));
  console.log(`\n  ${r.summary} — Verdict: ${r.verdict}`);
}

module.exports = SecurityDefaults;
