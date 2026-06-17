const fs = require('fs');
const path = require('path');
const { gatherSkillFiles } = require('./skill-files');
const {
  formatTextReport,
  formatJsonReport,
  formatMarkdownReport,
} = require('./security-scan.report');

const CRITICAL = 10;
const HIGH = 7;
const MEDIUM = 4;
const LOW = 1;
const INFO = 0;

const SEVERITY_NAMES = { 10: 'CRITICAL', 7: 'HIGH', 4: 'MEDIUM', 1: 'LOW', 0: 'INFO' };

function severityToString(severity) {
  return SEVERITY_NAMES[severity] || 'UNKNOWN';
}

const DETECTION_PATTERNS = [
  {
    id: 'ASI01-001',
    category: 'ASI01',
    severity: CRITICAL,
    title: 'Instruction Override',
    pattern: /ignore\s+(?:all\s+)?(?:previous|prior)\s+(?:instructions?|commands?|directives?)/i,
    description: 'Skill attempts to override agent instructions',
    remediation:
      'Remove instruction override directives; skills should not change agent instructions',
    falsePositiveGuard: /example|demonstrat|educational|sample/i,
  },
  {
    id: 'ASI01-002',
    category: 'ASI01',
    severity: CRITICAL,
    title: 'DAN/Jailbreak',
    pattern: /\bDAN\b|do\s+anything\s+now|jail\s*break/i,
    description: 'Skill contains jailbreak or DAN (Do Anything Now) patterns',
    remediation: 'Remove jailbreak instructions; skills must follow safety guidelines',
    falsePositiveGuard: /example|educational|detect/i,
  },
  {
    id: 'ASI01-003',
    category: 'ASI01',
    severity: CRITICAL,
    title: 'Identity Override',
    pattern:
      /you\s+are\s+(?:now\s+)?(?:an?\s+)?(?:unfiltered|free|independent|ungoverned)\s+(?:AI|assistant|entity)/i,
    description: 'Skill attempts to override agent identity as unfiltered/free AI',
    remediation: 'Remove identity override directives; skills should not change agent persona',
    falsePositiveGuard: /example|educational/i,
  },
  {
    id: 'ASI01-004',
    category: 'ASI01',
    severity: HIGH,
    title: 'System Message Impersonation',
    pattern: /\[\s*system\s*\]|\[\s*assistant\s*\]/i,
    description: 'Skill impersonates system or assistant messages to manipulate agent',
    remediation: 'Remove system message impersonation; do not inject fake system messages',
    falsePositiveGuard: null,
  },
  {
    id: 'ASI01-005',
    category: 'ASI01',
    severity: CRITICAL,
    title: 'Escaped Instruction Override',
    pattern:
      /`{3,}[\s\S]{0,500}(?:ignore|override)\s+(?:all\s+)?(?:previous|prior)\s+(?:instructions?|commands?)/i,
    description: 'Code block contains instruction override, potential hidden injection',
    remediation: 'Remove embedded override instructions from code blocks',
    falsePositiveGuard: /example|educational|demonstrat/i,
  },
  {
    id: 'ASI01-006',
    category: 'ASI01',
    severity: HIGH,
    title: 'Description with Override',
    pattern:
      /(?:description|purpose).{0,30}(?:override|ignore|bypass)\s+(?:safety|security|restrictions?|filter|limit)/i,
    description: 'Skill description contains override or bypass language',
    remediation: 'Remove dangerous language from description; descriptions must be accurate',
    falsePositiveGuard: /example|educational/i,
  },
  {
    id: 'ASI02-001',
    category: 'ASI02',
    severity: CRITICAL,
    title: 'Exfiltration Endpoint',
    pattern:
      /(?:fetch|axios|request)\s*\(\s*["'`](?:https?:\/\/)[^"'`]*(?:api|collect|log|ingest|exfil|upload|track)/i,
    description: 'Skill sends data to external collection endpoint',
    remediation: 'Remove unauthorized data exfiltration to external endpoints',
    falsePositiveGuard: /example|test\/api|staging/i,
  },
  {
    id: 'ASI02-002',
    category: 'ASI02',
    severity: CRITICAL,
    title: 'Fetch + Credential Concat',
    pattern:
      /(?:fetch|axios|request)\s*\(\s*["'`][^"'`]{0,100}["'`]\s*\+\s*[a-zA-Z_$][\w$]*(?:[kK]ey|token|secret|pass|api|cred)/i,
    description: 'Skill concatenates credentials into URL during HTTP request',
    remediation: 'Use secure authentication methods; do not pass credentials in URLs',
    falsePositiveGuard: /educational|demonstrat/i,
  },
  {
    id: 'ASI02-003',
    category: 'ASI02',
    severity: HIGH,
    title: 'Network + System Module Combo',
    type: 'pair',
    pairPatterns: [
      /require\s*\(\s*["'](?:https?|http|net|tls)["']\s*\)/i,
      /require\s*\(\s*["'](?:fs|child_process)["']\s*\)/i,
    ],
    description: 'Skill requires both network and filesystem/shell modules enabling exfiltration',
    remediation: 'Avoid requiring both network and filesystem modules together unless necessary',
    falsePositiveGuard: null,
  },
  {
    id: 'ASI02-004',
    category: 'ASI02',
    severity: CRITICAL,
    title: 'Credential File Read',
    pattern:
      /(?:readFile(?:Sync)?|readdir(?:Sync)?)\s*\(\s*["'`][^"'`]*(?:\.env|credentials|\.aws|\.ssh|secrets?\.[a-z]+|token\.[a-z]+)/i,
    description: 'Skill reads credential or secret files from the filesystem',
    remediation: 'Remove credential file access; use environment variables or secret store instead',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI02-005',
    category: 'ASI02',
    severity: HIGH,
    title: 'Environment Secret Access',
    pattern:
      /process\.env\.\s*(?:API[_-]?(?:KEY|TOKEN|SECRET)|TOKEN|SECRET|PASSWORD|CREDENTIAL|PRIVATE[_-]KEY)/i,
    description: 'Skill accesses sensitive environment variables',
    remediation:
      'Minimize access to sensitive environment variables; scope to specific credentials',
    falsePositiveGuard: /example|test/i,
  },
  {
    id: 'ASI02-006',
    category: 'ASI02',
    severity: HIGH,
    title: 'Base64 Encode Sensitive Data',
    pattern: /Buffer\.from\s*\([^)]*\)\.toString\s*\(\s*["'`]base64["'`]\s*\)/i,
    description: 'Skill encodes data as base64, commonly used for exfiltration',
    remediation: 'Avoid base64 encoding of potentially sensitive data unless necessary',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI02-007',
    category: 'ASI02',
    severity: HIGH,
    title: 'XHR + Credential URL',
    pattern:
      /(?:XMLHttpRequest|XDomainRequest|fetch)\s*\([^)]*["'`][^"'`]*(?:api[_-]?key|token|password|secret)/i,
    description: 'Skill uses XHR/fetch with credentials in request to external endpoint',
    remediation: 'Use secure API authentication; do not embed credentials in request URLs',
    falsePositiveGuard: /example|educational|test/i,
  },
  {
    id: 'ASI03-001',
    category: 'ASI03',
    severity: CRITICAL,
    title: 'execSync Arbitrary',
    pattern:
      /(?:execSync|exec\s*\()\s*[^)]*(?:\$|\+|process\.env|input|userData|payload|body|req)/i,
    description: 'Skill executes shell commands with interpolated variables, allowing injection',
    remediation: 'Use execFileSync or safer alternatives with fixed commands; avoid interpolation',
    falsePositiveGuard: /example|test|fixture|educational/i,
  },
  {
    id: 'ASI03-001b',
    category: 'ASI03',
    severity: CRITICAL,
    title: 'Dynamic require exec',
    pattern: /require\s*\(\s*['"`]child_process['"`]\s*\)[\s\S]{0,300}\.exec\s*\(/,
    description: 'child_process required and .exec() called — injection risk if args are user-controlled',
    remediation: 'Use execFileSync with a fixed command array; avoid exec() with variable args',
    falsePositiveGuard: /example|test|fixture|educational/i,
  },
  {
    id: 'ASI03-002',
    category: 'ASI03',
    severity: CRITICAL,
    title: 'Spawn Shell',
    pattern:
      /(?:spawn|exec(?:File)?Sync?)\s*\(\s*["'`](?:sh|bash|cmd|powershell|zsh|dash|pwsh)["'`]/i,
    description: 'Skill spawns a shell process, enabling arbitrary command execution',
    remediation: 'Avoid spawning interactive shells; use specific tool execution instead',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI03-003',
    category: 'ASI03',
    severity: HIGH,
    title: 'Dangerous rm/dd',
    pattern: /\brm\s+(?:-[rf]+\s+)?(?:[/~]|\*|\.\.)/i,
    description: 'Skill performs dangerous filesystem destruction operations',
    remediation: 'Avoid destructive filesystem operations; scope deletes to specific paths',
    falsePositiveGuard: /example|test|fixture|educational|cleanup/i,
  },
  {
    id: 'ASI03-004',
    category: 'ASI03',
    severity: HIGH,
    title: 'Unsafe Module Loading',
    pattern: /require\s*\(\s*[^"'`\s)]/i,
    description:
      'Skill dynamically requires modules using variables, enabling arbitrary code loading',
    remediation: 'Use static require statements with string literals; avoid variable module paths',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI03-005',
    category: 'ASI03',
    severity: HIGH,
    title: 'Command Injection',
    pattern:
      /exec\s*\(\s*['"`][^)]*['"`]\s*\+|`[^`]*\$\{[^}]*`|shell\s+exec\b|concat\s*\([^)]*\$[a-z_]/i,
    description: 'Skill uses template literals or string concatenation in command execution',
    remediation: 'Use parameterized commands; avoid template literal injection in shell commands',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI03-006',
    category: 'ASI03',
    severity: MEDIUM,
    title: 'chmod 777',
    pattern: /chmod\s+-?777\b/i,
    description: 'Skill sets overly permissive file permissions (chmod 777)',
    remediation: 'Use more restrictive permissions; avoid 777 which grants all users access',
    falsePositiveGuard: /example|test|fixture|educational/i,
  },
  {
    id: 'ASI03-007',
    category: 'ASI03',
    severity: HIGH,
    title: 'Arbitrary Sudo',
    pattern: /sudo\s+(?:ALL|NOPASSWD|--no-password|rm|dd|chmod|chown|sh)\b/i,
    description: 'Skill executes commands with sudo privileges, potentially dangerous',
    remediation: 'Avoid using sudo in skills; request specific elevated permissions instead',
    falsePositiveGuard: /example|test|fixture|educational|install/i,
  },
  {
    id: 'ASI05-001',
    category: 'ASI05',
    severity: HIGH,
    title: 'JSON.parse User Input',
    pattern:
      /JSON\.parse\s*\(\s*[^"'`\d][^)]{0,100}(?:request|response|body|input|data|user|external|untrusted)/i,
    description: 'Skill parses JSON from untrusted user input, risking prototype pollution',
    remediation: 'Validate and sanitize JSON input before parsing; use schema validation',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI05-002',
    category: 'ASI05',
    severity: CRITICAL,
    title: 'eval + JSON',
    pattern: /eval\s*\(\s*JSON/i,
    description: 'Skill uses eval with JSON data, enabling arbitrary code execution',
    remediation: 'Never use eval with JSON; parse data safely without evaluation',
    falsePositiveGuard: /example|educational|test/i,
  },
  {
    id: 'ASI05-003',
    category: 'ASI05',
    severity: HIGH,
    title: 'Unsafe YAML',
    pattern: /\byaml\.load\s*\(/i,
    description: 'Skill loads YAML which may contain dangerous deserialization tags',
    remediation: 'Use yaml.safeLoad or equivalent safe parser; avoid yaml.load with untrusted data',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI05-004',
    category: 'ASI05',
    severity: HIGH,
    title: 'Function Constructor',
    pattern: /new\s+Function\s*\(\s*(?:["'`]|[a-z])[^)]*[+$]/i,
    description:
      'Skill creates functions from strings using dynamic input, enabling code injection',
    remediation: 'Avoid dynamic Function constructor; use predefined functions instead',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI05-005',
    category: 'ASI05',
    severity: HIGH,
    title: 'Deserialize/Pickle',
    pattern: /\b(?:unserialize|deserialize|pickle\.load|pickle_load|unpickle)\s*\(/i,
    description: 'Skill deserializes data using unsafe deserialization methods',
    remediation: 'Use safe deserialization with allowlists; avoid pickle with untrusted data',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI06-001',
    category: 'ASI06',
    severity: HIGH,
    title: 'Context Push with Override',
    pattern:
      /(?:context|memory|history|chat|messages)\b\.\s*(?:push|add|append|unshift|set)\s*\([^)]*(?:override|system|instruction|ignore)/i,
    description: 'Skill pushes override instructions into agent context/memory',
    remediation:
      'Remove context poisoning attempts; do not inject override instructions into memory',
    falsePositiveGuard: /example|educational/i,
  },
  {
    id: 'ASI06-002',
    category: 'ASI06',
    severity: HIGH,
    title: 'Mass Memory Wipe',
    pattern:
      /(?:context|memory|history|chat|messages)\s*=\s*(?:\[\s*\]|\{\s*\})|\.\s*length\s*=\s*0|clear\s*(?:Context|Memory|History)/i,
    description: 'Skill wipes agent memory or context entirely',
    remediation: 'Avoid mass memory operations; clear only specific entries if needed',
    falsePositiveGuard: /example|test|fixture|educational/i,
  },
  {
    id: 'ASI06-003',
    category: 'ASI06',
    severity: MEDIUM,
    title: 'Memory Injection',
    pattern: /inject\s+(?:into\s+)?(?:context|memory|history|state|chat)/i,
    description: 'Skill describes injecting data into agent memory or context',
    remediation: 'Remove memory injection language; use standard memory APIs with proper scoping',
    falsePositiveGuard: /example|educational|detect/i,
  },
  {
    id: 'ASI06-004',
    category: 'ASI06',
    severity: MEDIUM,
    title: 'History Manipulation',
    pattern: /(?:splice|shift|pop|delete)\s*\([^)]*\)|rewrite\s+(?:context|memory|history|chat)/i,
    description: 'Skill manipulates conversation history destructively',
    remediation: 'Avoid destructive history manipulation; use append-only patterns',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI06-005',
    category: 'ASI06',
    severity: MEDIUM,
    title: 'Stored Override Data',
    pattern: /stor(?:e|ing|age)\s*\([^)]*(?:override|instruction|command|directive)/i,
    description: 'Skill stores override instructions in persistent memory',
    remediation: 'Do not persist override instructions in long-term memory',
    falsePositiveGuard: /example|educational/i,
  },
  {
    id: 'ASI07-001',
    category: 'ASI07',
    severity: MEDIUM,
    title: 'Version 0.x Dependency',
    pattern: /["']version["']\s*:\s*["']0\.\d+\.\d+/i,
    description: 'Skill depends on pre-1.0 version, indicating unstable API',
    remediation: 'Pin dependency to stable version >= 1.0.0',
    falsePositiveGuard: /example|test/i,
  },
  {
    id: 'ASI07-002',
    category: 'ASI07',
    severity: LOW,
    title: 'Stale Import',
    pattern:
      /require\s*\(\s*["'`][^"'`]*(?:deprecated|abandoned|legacy|unmaintained)[^"'`]*["'`]\s*\)/i,
    description: 'Skill imports from deprecated or unmaintained module',
    remediation: 'Replace deprecated module import with maintained alternative',
    falsePositiveGuard: /example|test|fixture/i,
  },
  {
    id: 'ASI07-003',
    category: 'ASI07',
    severity: MEDIUM,
    title: 'Unresolved Security TODO',
    pattern: /(?:TODO|FIXME|HACK|XXX|SECURITY)(?:\s*[:(-])/i,
    description: 'Unresolved TODO or security comment may indicate incomplete security review',
    remediation: 'Remove or resolve security TODOs before deployment',
    falsePositiveGuard: /example|educational|demonstrat/i,
  },
  {
    id: 'ASI07-004',
    category: 'ASI07',
    severity: LOW,
    title: 'Stale/Deprecated Reference',
    pattern: /\b(?:deprecated|legacy|abandoned|unmaintained|no\s+longer\s+maintained)\b/i,
    description: 'Skill references deprecated or unmaintained components',
    remediation: 'Update references to current maintained alternatives',
    falsePositiveGuard: /example|educational/i,
  },
  {
    id: 'ASI08-001',
    category: 'ASI08',
    severity: LOW,
    title: 'Long Base64 String',
    pattern: /[A-Za-z0-9+/]{150,}={0,2}/i,
    description: 'Long base64-encoded string may hide malicious payload',
    remediation: 'Remove large base64 blobs; use external configuration or resources instead',
    falsePositiveGuard: /(?:import|module\.exports|url|data:|image|font|require)/i,
  },
  {
    id: 'ASI08-002',
    category: 'ASI08',
    severity: LOW,
    title: 'Scanner Disable Comment',
    pattern:
      /(?:scan(?:ner|ning)?\s*(?:bypass|skip|ignore|disable)|(?:bypass|skip|ignore|disable)\s*scan(?:ner|ning)?)/i,
    description: 'Comment may attempt to disable security scanning',
    remediation: 'Remove scanner-disabling comments; do not attempt to evade security analysis',
    falsePositiveGuard: /example|educational/i,
  },
  {
    id: 'ASI08-003',
    category: 'ASI08',
    severity: MEDIUM,
    title: 'Hex Encoded String',
    pattern: /(?:\\x[0-9a-fA-F]{2}){4,}/i,
    description: 'Hex-encoded strings may hide malicious instructions from scanners',
    remediation: 'Remove hex-encoded payloads; use clear string literals instead',
    falsePositiveGuard: /example|test|fixture|educational/i,
  },
  {
    id: 'ASI08-004',
    category: 'ASI08',
    severity: LOW,
    title: 'Character Obfuscation',
    pattern: /(?:String\.fromCharCode|escape\s*\(|unescape\s*\()/i,
    description: 'Character obfuscation techniques may hide string content from scanners',
    remediation: 'Use direct string literals instead of character encoding tricks',
    falsePositiveGuard: /example|test|fixture|educational/i,
  },
  {
    id: 'ASI08-005',
    category: 'ASI08',
    severity: HIGH,
    title: 'eval + Decode',
    pattern: /eval\s*\(\s*(?:atob|btoa|unescape|decodeURI(?:Component)?)\s*\(/i,
    description: 'Skill uses eval with decode function, enabling hidden code execution',
    remediation: 'Never combine eval with decoding functions; use safe data processing instead',
    falsePositiveGuard: /example|educational|test/i,
  },
  {
    id: 'ASI08-006',
    category: 'ASI08',
    severity: LOW,
    title: 'Long Regex Test',
    pattern: /new\s+RegExp\s*\([^)]{100,}|\.test\s*\([^)]{100,}/i,
    description: 'Suspiciously long regex pattern may hide malicious matching logic',
    remediation: 'Break long regex patterns into smaller, readable expressions',
    falsePositiveGuard: /example|test|fixture|educational/i,
  },
];

function findLineNumber(lines, matchStr) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(matchStr)) return i + 1;
  }
  return 0;
}

function scanSkill(filePath, content) {
  const findings = [];
  const lines = content.split('\n');

  for (const dp of DETECTION_PATTERNS) {
    let matched = false;
    let matchStr = '';

    if (dp.type === 'pair') {
      const [p1, p2] = dp.pairPatterns;
      if (!p1.test(content) || !p2.test(content)) continue;
      matched = true;
      const m1 = content.match(p1);
      const m2 = content.match(p2);
      matchStr = (m1 ? m1[0].trim() + '...' : '') + (m2 ? m2[0].trim() : '');
    } else {
      if (!dp.pattern) continue;
      const match = content.match(dp.pattern);
      if (!match) continue;
      matched = true;
      matchStr = match[0];
    }

    if (dp.falsePositiveGuard && dp.falsePositiveGuard.test(content)) continue;

    const lineNumber = findLineNumber(lines, matchStr.substring(0, 100)) || 1;
    const snippet = matchStr.substring(0, 120).replace(/\n/g, '\\n').trim();

    findings.push({
      id: dp.id,
      category: dp.category,
      severity: dp.severity,
      detector: 'regex',
      title: dp.title,
      detail: dp.description,
      lineNumber,
      snippet,
      remediation: dp.remediation,
    });
  }

  return { file: filePath, findings };
}

function buildCategoryMap() {
  const cats = {};
  for (const cat of ['ASI01', 'ASI02', 'ASI03', 'ASI05', 'ASI06', 'ASI07', 'ASI08']) {
    cats[cat] = { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0, findings: [] };
  }
  return cats;
}

function classifySeverity(category, pattern, context) {
  const baseMap = {
    ASI01: CRITICAL,
    ASI02: CRITICAL,
    ASI03: CRITICAL,
    ASI05: HIGH,
    ASI06: HIGH,
    ASI07: MEDIUM,
    ASI08: MEDIUM,
  };
  const base =
    pattern && typeof pattern.severity === 'number' ? pattern.severity : baseMap[category] || INFO;
  if (context && context.isLikelyBenign) {
    return Math.max(INFO, Math.floor(base / 2));
  }
  return base;
}

function scanAllSkills(options) {
  const rootDir = (options && options.rootDir) || path.resolve(__dirname, '..');
  const files = gatherSkillFiles(rootDir);
  const allFindings = [];
  const categories = buildCategoryMap();

  for (const f of files) {
    let content;
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    const result = scanSkill(f, content);
    for (const finding of result.findings) {
      allFindings.push(finding);
      const cat = categories[finding.category];
      if (cat) {
        cat.total++;
        cat.findings.push(finding);
        if (finding.severity >= 10) cat.critical++;
        else if (finding.severity >= 7) cat.high++;
        else if (finding.severity >= 4) cat.medium++;
        else if (finding.severity >= 1) cat.low++;
        else cat.info++;
      }
    }
  }

  const criticalCount = allFindings.filter(f => f.severity >= 10).length;
  const highCount = allFindings.filter(f => f.severity >= 7 && f.severity < 10).length;
  const mediumCount = allFindings.filter(f => f.severity >= 4 && f.severity < 7).length;
  const lowCount = allFindings.filter(f => f.severity >= 1 && f.severity < 4).length;
  const infoCount = allFindings.filter(f => f.severity < 1).length;

  return {
    totalScanned: files.length,
    totalFindings: allFindings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    findings: allFindings,
    categories,
  };
}

function formatReport(summary, format) {
  if (format === 'json') return JSON.stringify(summary, null, 2);
  if (format === 'markdown') return formatMarkdownReport(summary);
  return formatTextReport(summary);
}

function checkHarness(options) {
  const summary = scanAllSkills(options);
  const criticalCount = summary.findings.filter(f => f.severity >= 10).length;
  return {
    pass: criticalCount === 0,
    findings: summary.findings.length,
    criticalCount,
  };
}

module.exports = {
  scanSkill,
  scanAllSkills,
  classifySeverity,
  formatReport,
  checkHarness,
  severityToString,
};
