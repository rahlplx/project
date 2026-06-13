#!/usr/bin/env node

class DoneChecklist {
  constructor(config = {}) {
    this.name = 'done-checklist';
    this.version = '1.0.0';
    this.description = 'Production-ready checklist — tells non-coders if their project is ready to ship';
  }

  getChecklist(category = 'web') {
    const checklists = {
      web: [
        { id: 'C01', category: 'security', check: 'Environment variables used (no hardcoded secrets)', severity: 'blocker' },
        { id: 'C02', category: 'security', check: 'Authentication implemented for protected routes', severity: 'blocker' },
        { id: 'C03', category: 'security', check: 'HTTPS enabled', severity: 'blocker' },
        { id: 'C04', category: 'quality', check: '404 page handles unknown routes gracefully', severity: 'high' },
        { id: 'C05', category: 'quality', check: 'Loading states shown during data fetch', severity: 'medium' },
        { id: 'C06', category: 'quality', check: 'Error states handled (network failure, empty data)', severity: 'high' },
        { id: 'C07', category: 'design', check: 'Responsive on mobile and desktop', severity: 'medium' },
        { id: 'C08', category: 'design', check: 'Colors have sufficient contrast (WCAG AA)', severity: 'medium' },
        { id: 'C09', category: 'performance', check: 'Images optimized (lazy loading, proper sizes)', severity: 'low' },
        { id: 'C10', category: 'performance', check: 'Bundle size reasonable (< 500KB gzipped)', severity: 'low' },
        { id: 'C11', category: 'deploy', check: 'Build succeeds without errors', severity: 'blocker' },
        { id: 'C12', category: 'deploy', check: 'Analytics configured (optional)', severity: 'low' },
        { id: 'C13', category: 'legal', check: 'Privacy policy and terms of service present', severity: 'high' },
        { id: 'C14', category: 'legal', check: 'GDPR/Cookie consent if applicable', severity: 'medium' },
        { id: 'C15', category: 'testing', check: 'Core user flow works end-to-end', severity: 'blocker' },
        { id: 'C16', category: 'testing', check: 'Edge cases handled (empty state, long text, special chars)', severity: 'medium' }
      ],
      api: [
        { id: 'A01', category: 'security', check: 'Authentication/authorization on all endpoints', severity: 'blocker' },
        { id: 'A02', category: 'security', check: 'Input validation on all routes', severity: 'blocker' },
        { id: 'A03', category: 'security', check: 'Rate limiting configured', severity: 'high' },
        { id: 'A04', category: 'quality', check: 'All endpoints return consistent JSON format', severity: 'high' },
        { id: 'A05', category: 'quality', check: 'Proper HTTP status codes used', severity: 'medium' },
        { id: 'A06', category: 'quality', check: 'Error responses include helpful messages', severity: 'medium' },
        { id: 'A07', category: 'docs', check: 'API documentation generated (OpenAPI/Swagger)', severity: 'high' },
        { id: 'A08', category: 'testing', check: 'Health check endpoint returns 200', severity: 'blocker' },
        { id: 'A09', category: 'testing', check: 'All endpoints return expected responses', severity: 'blocker' },
        { id: 'A10', category: 'deploy', check: 'CORS configured correctly', severity: 'high' }
      ],
      cli: [
        { id: 'CLI01', category: 'quality', check: 'Help/--help flag shows usage', severity: 'blocker' },
        { id: 'CLI02', category: 'quality', check: 'Clear error messages for invalid input', severity: 'high' },
        { id: 'CLI03', category: 'quality', check: 'Exit codes correctly set (0 for success, 1 for error)', severity: 'high' },
        { id: 'CLI04', category: 'deploy', check: 'Can be installed via npm global or npx', severity: 'high' },
        { id: 'CLI05', category: 'testing', check: 'Works on Windows, macOS, Linux', severity: 'medium' }
      ]
    };
    return checklists[category] || checklists.web;
  }

  evaluate(checks, results = {}) {
    const evaluated = checks.map(check => ({
      ...check,
      passed: results[check.id] === true,
      failed: results[check.id] === false,
      skipped: results[check.id] === undefined
    }));

    const blockers = evaluated.filter(c => c.severity === 'blocker' && c.failed);
    const warnings = evaluated.filter(c => c.failed && c.severity !== 'blocker');

    const blockerCount = blockers.length;
    const warningCount = warnings.length;
    const passCount = evaluated.filter(c => c.passed).length;

    let verdict;
    if (blockerCount > 0) verdict = 'NOT READY — blockers must be fixed';
    else if (warningCount > 0) verdict = 'CONDITIONAL — review warnings before shipping';
    else verdict = 'READY TO SHIP';

    return {
      verdict,
      summary: {
        total: evaluated.length,
        passed: passCount,
        failed: blockerCount + warningCount,
        skipped: evaluated.filter(c => c.skipped).length,
        blockers: blockerCount,
        warnings: warningCount
      },
      categories: [...new Set(evaluated.map(c => c.category))].map(cat => ({
        category: cat,
        passed: evaluated.filter(c => c.category === cat && c.passed).length,
        failed: evaluated.filter(c => c.category === cat && c.failed).length,
        total: evaluated.filter(c => c.category === cat).length
      })),
      items: evaluated,
      timestamp: new Date().toISOString()
    };
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      references: ['12-factor app (12factor.net)', 'OWASP ASVS', 'Clarista production checklist'],
      categories: ['web', 'api', 'cli']
    };
  }
}

if (require.main === module) {
  const skill = new DoneChecklist();
  const category = process.argv[2] || 'web';
  const checks = skill.getChecklist(category);
  console.log(`\n  ${category.toUpperCase()} PRODUCTION CHECKLIST\n`);
  checks.forEach(c => {
    const icon = c.severity === 'blocker' ? '🔴' : c.severity === 'high' ? '🟡' : '⚪';
    console.log(`  ${icon} [${c.severity}] ${c.check}`);
  });
  console.log(`\n  ${checks.length} checks. Run skill.evaluate() with your results.`);
}

module.exports = DoneChecklist;
