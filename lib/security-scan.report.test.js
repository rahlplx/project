const { describe, test } = require('node:test');
const assert = require('node:assert');
const {
  formatTextReport,
  formatJsonReport,
  formatMarkdownReport,
} = require('./security-scan.report');

const sampleSummary = {
  totalScanned: 45,
  totalFindings: 2,
  criticalCount: 0,
  highCount: 0,
  mediumCount: 1,
  lowCount: 1,
  infoCount: 0,
  findings: [
    {
      id: 'ASI07-003',
      category: 'ASI07',
      severity: 4,
      detector: 'regex',
      title: 'Unresolved Security TODO',
      detail: 'Unresolved TODO comment may indicate incomplete security review',
      lineNumber: 12,
      snippet: 'TODO: fix security issue before prod',
      remediation: 'Remove or resolve security TODOs before deployment',
    },
    {
      id: 'ASI08-002',
      category: 'ASI08',
      severity: 1,
      detector: 'regex',
      title: 'Scanner Disable Comment',
      detail: 'Comment may attempt to disable security scanning',
      lineNumber: 5,
      snippet: 'scanner disable check',
      remediation: 'Remove scanner-disabling comments',
    },
  ],
  categories: {
    ASI07: { total: 1, critical: 0, high: 0, medium: 1, low: 0, info: 0, findings: [] },
    ASI08: { total: 1, critical: 0, high: 0, medium: 0, low: 1, info: 0, findings: [] },
  },
};

describe('formatTextReport', () => {
  test('contains summary and findings', () => {
    const report = formatTextReport(sampleSummary);
    assert.ok(report.includes('Security Scan Report'));
    assert.ok(report.includes('ASI07-003'));
    assert.ok(report.includes('PASS'));
    assert.ok(report.includes('45'));
  });

  test('includes remediation text', () => {
    const report = formatTextReport(sampleSummary);
    assert.ok(report.includes('Remove or resolve'));
  });
});

describe('formatJsonReport', () => {
  test('produces valid JSON with same structure', () => {
    const report = formatJsonReport(sampleSummary);
    const parsed = JSON.parse(report);
    assert.strictEqual(parsed.totalScanned, 45);
    assert.strictEqual(parsed.totalFindings, 2);
    assert.ok(Array.isArray(parsed.findings));
    assert.strictEqual(parsed.findings.length, 2);
  });

  test('includes all finding fields', () => {
    const report = formatJsonReport(sampleSummary);
    const parsed = JSON.parse(report);
    const finding = parsed.findings[0];
    assert.ok(finding.id);
    assert.ok(finding.category);
    assert.ok(finding.severity !== undefined);
    assert.ok(finding.title);
    assert.ok(finding.snippet);
    assert.ok(finding.remediation);
  });
});

describe('formatMarkdownReport', () => {
  test('produces markdown with tables', () => {
    const report = formatMarkdownReport(sampleSummary);
    assert.ok(report.startsWith('#'));
    assert.ok(report.includes('|'));
    assert.ok(report.includes('---'));
  });

  test('includes all findings as table rows', () => {
    const report = formatMarkdownReport(sampleSummary);
    assert.ok(report.includes('ASI07-003'));
    assert.ok(report.includes('ASI08-002'));
  });

  test('includes category sections', () => {
    const report = formatMarkdownReport(sampleSummary);
    assert.ok(report.includes('ASI07'));
    assert.ok(report.includes('ASI08'));
  });
});
