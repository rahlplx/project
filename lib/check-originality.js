const fs = require('fs');
const path = require('path');
const { gatherSkillFiles } = require('./skill-files');

const FAIL_THRESHOLD = parseFloat(process.env.ORIGINALITY_FAIL || '50');
const WARN_THRESHOLD = parseFloat(process.env.ORIGINALITY_WARN || '25');

const ENTITY_PATTERN = new RegExp(
  '\\b(' +
  'netlify|vercel|github|heroku|aws|docker|kubernetes|react|vue|angular|' +
  'node|python|ruby|go|rust|typescript|javascript|' +
  'tailwind|bootstrap|material|chakra|shadcn|' +
  'postgres|mysql|mongodb|redis|sqlite|' +
  'express|fastify|next|nuxt|svelte|solid|' +
  'jest|vitest|mocha|chai|playwright|cypress' +
  ')\\b', 'gi');

const JS_BOILERPLATE = new RegExp(
  '\\b(' +
  'require|module|exports|import|export|default|' +
  'class|constructor|extends|super|' +
  'function|return|const|let|var|' +
  'async|await|try|catch|throw|' +
  'if|else|switch|case|break|' +
  'for|while|do|of|in|' +
  'this|new|typeof|instanceof|' +
  'undefined|null|true|false|' +
  'Object|Array|String|Number|Boolean|' +
  'console|process|Buffer|JSON' +
  ')\\b', 'gi');

function readContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function normalize(text) {
  return text
    .replace(ENTITY_PATTERN, ' ')
    .replace(JS_BOILERPLATE, ' ')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function tokenize(text) {
  return text.split(/\s+/).filter(Boolean);
}

function shingle(words, size = 8) {
  const set = new Set();
  for (let i = 0; i <= words.length - size; i++) {
    set.add(words.slice(i, i + size).join(' '));
  }
  return set;
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return intersection.size / union.size;
}

function checkOriginality(options = {}) {
  const {
    rootDir = path.resolve(__dirname, '..'),
    failThreshold = FAIL_THRESHOLD,
    warnThreshold = WARN_THRESHOLD,
    files = null
  } = options;

  const skillFiles = files || gatherSkillFiles(rootDir);
  if (skillFiles.length === 0) {
    return { files: 0, worst: 0, fails: [], warns: [], passed: [] };
  }

  const shingleMap = {};
  for (const f of skillFiles) {
    const content = readContent(f);
    const words = tokenize(normalize(content));
    shingleMap[f] = shingle(words);
  }

  const fileList = Object.keys(shingleMap);
  let worst = 0;
  const fails = [];
  const warns = [];
  const passed = [];

  for (let i = 0; i < fileList.length; i++) {
    const a = fileList[i];
    let bestScore = 0;
    let bestMatch = '';

    for (let j = 0; j < fileList.length; j++) {
      if (i === j) continue;
      const b = fileList[j];
      const score = jaccard(shingleMap[a], shingleMap[b]);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = b;
      }
    }

    const pct = bestScore * 100;
    worst = Math.max(worst, pct);
    const relA = path.relative(rootDir, a);
    const relB = bestMatch ? path.relative(rootDir, bestMatch) : '';

    const entry = { file: relA, match: relB, score: pct };
    if (pct >= failThreshold) {
      fails.push(entry);
    } else if (pct >= warnThreshold) {
      warns.push(entry);
    } else {
      passed.push(entry);
    }
  }

  return {
    files: fileList.length,
    worst: Math.round(worst * 10) / 10,
    fails,
    warns,
    passed,
    thresholds: { fail: failThreshold, warn: warnThreshold }
  };
}

function formatReport(result) {
  const lines = [];
  lines.push(`Files checked: ${result.files}`);
  lines.push(`Worst similarity: ${result.worst}%`);
  lines.push(`Thresholds: WARN >= ${result.thresholds.warn}%, FAIL >= ${result.thresholds.fail}%`);
  lines.push('');

  if (result.passed.length > 0) {
    lines.push('PASSED:');
    for (const p of result.passed) {
      lines.push(`  [OK]   ${p.score.toFixed(1).padStart(5)}%  ${p.file}`);
    }
  }

  if (result.warns.length > 0) {
    lines.push('');
    lines.push(`WARNINGS (${result.warns.length}):`);
    for (const w of result.warns) {
      lines.push(`  [WARN] ${w.score.toFixed(1).padStart(5)}%  ${w.file}`);
      lines.push(`              closest: ${w.match}`);
    }
  }

  if (result.fails.length > 0) {
    lines.push('');
    lines.push(`FAILED (${result.fails.length}):`);
    for (const f of result.fails) {
      lines.push(`  [FAIL] ${f.score.toFixed(1).padStart(5)}%  ${f.file}`);
      lines.push(`               closest: ${f.match}`);
    }
    lines.push('');
    lines.push('Skills should be genuinely distinct. If this is an intentional');
    lines.push('variation, ensure the implementation differs meaningfully.');
  }

  return lines.join('\n');
}

if (require.main === module) {
  const specificFiles = process.argv.slice(2);
  const options = specificFiles.length > 0
    ? { files: specificFiles.map(f => path.resolve(f)) }
    : {};
  const result = checkOriginality(options);
  console.log(formatReport(result));
  if (result.fails.length > 0) process.exit(1);
  if (result.warns.length > 0) process.exit(0);
}

module.exports = { checkOriginality, formatReport, jaccard, shingle, normalize, tokenize };
