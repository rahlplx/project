#!/usr/bin/env node

class Verification {
  constructor() {
    this.name = 'verification';
    this.version = '1.0.0';
    this.description = 'Verifies that behavior matches the project spec and requirements';
  }

  verify(spec, implementation) {
    if (!spec || !implementation) return { success: false, error: 'Both spec and implementation required.' };

    const results = [];
    const features = spec.features || spec.requirements || [];

    for (const item of features) {
      const name = typeof item === 'string' ? item : (item.name || item.description || '');
      const found = implementation.toLowerCase().includes(name.toLowerCase());
      results.push({
        requirement: name,
        passed: found,
        status: found ? 'implemented' : 'missing',
        severity: found ? 'ok' : (item.priority === 'high' ? 'critical' : 'warning')
      });
    }

    const passed = results.filter(r => r.passed).length;
    const missing = results.filter(r => !r.passed);

    return {
      success: true,
      summary: `${passed}/${results.length} requirements verified`,
      score: results.length > 0 ? Math.round((passed / results.length) * 100) : 100,
      results,
      missingItems: missing.map(r => ({ requirement: r.requirement, severity: r.severity })),
      verdict: missing.some(r => r.severity === 'critical') ? 'FAIL' : missing.length === 0 ? 'PASS' : 'INCOMPLETE',
      timestamp: new Date().toISOString()
    };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = Verification;
