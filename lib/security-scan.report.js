const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function severityColor(severity) {
  if (severity >= 10) return RED;
  if (severity >= 7) return YELLOW;
  if (severity >= 4) return CYAN;
  return GREEN;
}

function severityLabel(severity) {
  if (severity >= 10) return 'CRITICAL';
  if (severity >= 7) return 'HIGH';
  if (severity >= 4) return 'MEDIUM';
  if (severity >= 1) return 'LOW';
  return 'INFO';
}

function formatTextReport(summary) {
  const lines = [];
  const sep = '='.repeat(55);
  const sub = '-'.repeat(55);

  lines.push(sep);
  lines.push(`${BOLD}  Security Scan Report${RESET}`);
  lines.push(sep);
  lines.push('');
  lines.push(`  ${BOLD}Files scanned:${RESET} ${summary.totalScanned}`);
  lines.push(`  ${BOLD}Total findings:${RESET} ${summary.totalFindings}`);
  lines.push('');
  lines.push(`    ${RED}CRITICAL:${RESET} ${summary.criticalCount}`);
  lines.push(`    ${YELLOW}HIGH:${RESET}     ${summary.highCount}`);
  lines.push(`    ${CYAN}MEDIUM:${RESET}   ${summary.mediumCount}`);
  lines.push(`    ${GREEN}LOW:${RESET}      ${summary.lowCount}`);
  lines.push(`    ${DIM}INFO:${RESET}      ${summary.infoCount}`);
  lines.push('');

  for (const [cat, catData] of Object.entries(summary.categories)) {
    if (catData.total === 0) continue;
    lines.push(sub);
    lines.push(`  ${BOLD}${cat}${RESET} (${catData.total} findings)`);
    lines.push(sub);
    const catFindings =
      catData.findings.length > 0
        ? catData.findings
        : summary.findings.filter(f => f.category === cat);
    for (const f of catFindings) {
      const color = severityColor(f.severity);
      const label = severityLabel(f.severity);
      lines.push(`  ${color}[${label}]${RESET} ${f.id} — ${f.title}`);
      lines.push(`          ${DIM}File:${RESET} ${f.file || '(inline)'}:${f.lineNumber}`);
      if (f.snippet) lines.push(`          ${DIM}Snippet:${RESET} ${f.snippet.substring(0, 80)}`);
      lines.push(`          ${DIM}Fix:${RESET} ${f.remediation}`);
      lines.push('');
    }
  }

  if (summary.totalFindings === 0) {
    lines.push(`  ${GREEN}No findings detected.${RESET}`);
    lines.push('');
  }

  const overallPass = summary.criticalCount === 0;
  lines.push(sep);
  lines.push(
    `  ${overallPass ? GREEN : RED}${BOLD}Overall: ${overallPass ? '✓ PASS' : '✗ FAIL'}${RESET}  ${overallPass ? '(0 critical)' : `(${summary.criticalCount} critical)`}`
  );
  lines.push(sep);

  return lines.join('\n');
}

function formatJsonReport(summary) {
  return JSON.stringify(summary, null, 2);
}

function formatMarkdownReport(summary) {
  const lines = [];

  lines.push('# Security Scan Report');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Files Scanned | ${summary.totalScanned} |`);
  lines.push(`| Total Findings | ${summary.totalFindings} |`);
  lines.push(`| CRITICAL | ${summary.criticalCount} |`);
  lines.push(`| HIGH | ${summary.highCount} |`);
  lines.push(`| MEDIUM | ${summary.mediumCount} |`);
  lines.push(`| LOW | ${summary.lowCount} |`);
  lines.push(`| INFO | ${summary.infoCount} |`);
  lines.push('');

  for (const [cat, catData] of Object.entries(summary.categories)) {
    if (catData.total === 0) continue;
    lines.push(`## ${cat} (${catData.total} findings)`);
    lines.push('');
    lines.push('| ID | Severity | File | Line | Description |');
    lines.push('|----|----------|------|------|-------------|');
    const catFindings =
      catData.findings.length > 0
        ? catData.findings
        : summary.findings.filter(f => f.category === cat);
    for (const f of catFindings) {
      const sev = severityLabel(f.severity);
      const filePath = f.file || '(inline)';
      lines.push(`| ${f.id} | ${sev} | ${filePath} | ${f.lineNumber} | ${f.title} |`);
    }
    lines.push('');
  }

  lines.push('## Verdict');
  lines.push('');
  if (summary.criticalCount === 0) {
    lines.push('> ✅ **PASS** — No critical findings detected.');
  } else {
    lines.push(`> ❌ **FAIL** — ${summary.criticalCount} critical finding(s) detected.`);
  }

  return lines.join('\n');
}

module.exports = { formatTextReport, formatJsonReport, formatMarkdownReport };
