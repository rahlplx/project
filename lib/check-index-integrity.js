const path = require('path');
const { buildIndex, readIndex } = require('./discovery-index');

function checkIndexIntegrity(options = {}) {
  const { rootDir = path.resolve(__dirname, '..') } = options;

  const existing = readIndex(rootDir);
  if (!existing) {
    return {
      pass: false,
      errors: [{ type: 'missing-index', detail: '.well-known/agent-skills/index.json not found' }],
      warnings: [],
      details: { existing: 0, onDisk: 0, missing: [], extra: [], mismatched: [] }
    };
  }

  const current = buildIndex({ rootDir });

  const existingMap = new Map(existing.skills.map(s => [s.name, s]));
  const currentMap = new Map(current.skills.map(s => [s.name, s]));

  const missing = current.skills
    .filter(s => !existingMap.has(s.name))
    .map(s => s.name);

  const extra = existing.skills
    .filter(s => !currentMap.has(s.name))
    .map(s => s.name);

  const mismatched = [];
  for (const skill of current.skills) {
    const ex = existingMap.get(skill.name);
    if (ex && ex.digest !== skill.digest) {
      mismatched.push({ name: skill.name, expected: ex.digest, actual: skill.digest });
    }
  }

  const errors = [];
  const warnings = [];

  if (missing.length > 0) {
    errors.push({ type: 'missing-skills', detail: `${missing.length} skills missing from index: ${missing.join(', ')}` });
  }
  if (extra.length > 0) {
    errors.push({ type: 'extra-skills', detail: `${extra.length} stale entries in index: ${extra.join(', ')}` });
  }
  if (mismatched.length > 0) {
    errors.push({ type: 'digest-mismatch', detail: `${mismatched.length} digest mismatches` });
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings,
    details: {
      existing: existing.skills.length,
      onDisk: current.skills.length,
      missing,
      extra,
      mismatched
    }
  };
}

function formatReport(result) {
  const lines = [];
  lines.push(`Index integrity: ${result.pass ? 'PASS' : 'FAIL'}`);
  lines.push(`Index entries: ${result.details.existing}`);
  lines.push(`On-disk skills: ${result.details.onDisk}`);

  if (result.details.missing.length > 0) {
    lines.push(`Missing: ${result.details.missing.join(', ')}`);
  }
  if (result.details.extra.length > 0) {
    lines.push(`Extra: ${result.details.extra.join(', ')}`);
  }
  if (result.details.mismatched.length > 0) {
    for (const m of result.details.mismatched) {
      lines.push(`Digest mismatch: ${m.name} (expected ${m.expected}, got ${m.actual})`);
    }
  }

  return lines.join('\n');
}

if (require.main === module) {
  const result = checkIndexIntegrity();
  console.log(formatReport(result));
  process.exit(result.pass ? 0 : 1);
}

module.exports = { checkIndexIntegrity, formatReport };
