'use strict';
const fs = require('fs');
const path = require('path');
const { gatherSkillFiles } = require('../skill-files');

const EVOLVED_RULES_FILE = path.resolve(__dirname, '../../.vibe/rules/security-evolved.json');

/**
 * Runs OWASP-pattern scan across all skills and lib/ files.
 * After each scan, appends newly discovered pattern variants to the evolving
 * rules file so subsequent scans catch more.
 */
function scan(options = {}) {
  const rootDir = options.rootDir || path.resolve(__dirname, '../..');
  const findings = [];

  // Load evolved rules (patterns discovered in prior scans)
  const evolvedRules = _loadEvolvedRules();

  // Static OWASP patterns (baseline)
  const patterns = [
    { id: 'A02-weak-hash', re: /\bmd5\b|\bsha1\b/i, desc: 'Weak hash function' },
    { id: 'A03-eval', re: /\beval\s*\(/, desc: 'eval() usage' },
    { id: 'A03-innerHTML', re: /innerHTML\s*=/, desc: 'innerHTML assignment' },
    { id: 'A07-hardcoded-secret', re: /password\s*=\s*['"][^'"]{4,}['"]|secret\s*=\s*['"][^'"]{4,}['"]/, desc: 'Hardcoded credential' },
    { id: 'A05-cors-wildcard', re: /Access-Control-Allow-Origin.*\*/, desc: 'CORS wildcard' },
    // Evolved rules appended below
    ...evolvedRules.patterns.map(p => ({ id: p.id, re: new RegExp(p.pattern, p.flags || ''), desc: p.desc, evolved: true })),
  ];

  // Scan skill files
  const skillFiles = gatherSkillFiles(rootDir);
  for (const file of skillFiles) {
    _scanFile(file, patterns, findings, rootDir);
  }

  // Scan lib/ JS files
  const libDir = path.join(rootDir, 'lib');
  if (fs.existsSync(libDir)) {
    _walkDir(libDir, '.js', file => _scanFile(file, patterns, findings, rootDir));
  }

  // Evolve: new patterns derived from findings
  _evolveRules(findings, evolvedRules);

  return {
    scanned: skillFiles.length,
    findings,
    evolvedRules: evolvedRules.patterns.length,
    timestamp: new Date().toISOString(),
  };
}

function _scanFile(file, patterns, findings, rootDir) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(rootDir, file);
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      for (const p of patterns) {
        if (p.re.test(line)) {
          findings.push({ file: rel, line: i + 1, id: p.id, desc: p.desc, evolved: !!p.evolved, text: line.trim().slice(0, 80) });
        }
      }
    });
  } catch {
    /* skip unreadable */
  }
}

function _walkDir(dir, ext, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') _walkDir(full, ext, cb);
    else if (entry.isFile() && entry.name.endsWith(ext)) cb(full);
  }
}

function _loadEvolvedRules() {
  try {
    if (fs.existsSync(EVOLVED_RULES_FILE)) {
      return JSON.parse(fs.readFileSync(EVOLVED_RULES_FILE, 'utf8'));
    }
  } catch {
    /* ignore */
  }
  return { version: 1, patterns: [], last_scan: null };
}

/**
 * Self-evolving: if findings cluster around a new code pattern not in baseline,
 * propose it as a new rule and append to evolved rules file.
 */
function _evolveRules(findings, current) {
  try {
    // Count findings by file extension / context — simple frequency heuristic
    const newPatterns = [...current.patterns];
    let changed = false;

    // Example evolution: if >3 findings share a common token, add it as pattern
    const tokenFreq = {};
    for (const f of findings) {
      const tokens = f.text.match(/\b\w{5,}\b/g) || [];
      tokens.forEach(t => { tokenFreq[t] = (tokenFreq[t] || 0) + 1; });
    }
    for (const [token, count] of Object.entries(tokenFreq)) {
      if (count >= 3 && !newPatterns.some(p => p.pattern.includes(token))) {
        newPatterns.push({ id: `evolved-${token.toLowerCase()}`, pattern: `\\b${token}\\b`, flags: 'i', desc: `Evolved: frequent token '${token}'`, source: 'auto' });
        changed = true;
      }
    }

    if (changed || !current.last_scan) {
      fs.mkdirSync(path.dirname(EVOLVED_RULES_FILE), { recursive: true });
      fs.writeFileSync(EVOLVED_RULES_FILE, JSON.stringify({ version: 1, patterns: newPatterns, last_scan: new Date().toISOString() }, null, 2) + '\n', 'utf8');
    }
  } catch {
    /* non-fatal */
  }
}

if (require.main === module) {
  const result = scan();
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { scan };
