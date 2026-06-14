const fs = require('fs');
const path = require('path');

let telemetryDir = path.resolve(__dirname, '..', '.vibe', 'telemetry');

function setTelemetryDir(dir) {
  telemetryDir = dir;
}

function dataFile() {
  return path.join(telemetryDir, 'error-trends.json');
}

function ensureDir() {
  fs.mkdirSync(telemetryDir, { recursive: true });
}

function readData() {
  ensureDir();
  const file = dataFile();
  try {
    if (!fs.existsSync(file)) {
      return { version: '1.0.0', errors: [] };
    }
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { version: '1.0.0', errors: [] };
  }
}

function writeData(data) {
  ensureDir();
  fs.writeFileSync(dataFile(), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

let idCounter = 0;

function categorizeError(context, error) {
  const msg = typeof error === 'string' ? error : (error.message || '');
  const code = error && error.code ? error.code : '';
  const name = error && error.name ? error.name : '';
  const lower = msg.toLowerCase();
  const ctxLower = context.toLowerCase();

  if (code === 'ENOENT' || code === 'EINVAL' || code === 'ECONNREFUSED') return 'system';
  if (lower.includes('timeout') || lower.includes('timed out')) return 'timeout';
  if (name === 'SyntaxError' || lower.includes('syntax') || lower.includes('yaml') || lower.includes('parse')) return 'syntax';
  if (ctxLower.includes('test') || ctxLower.includes('jest')) return 'test';
  if (ctxLower.includes('catalog') || ctxLower.includes('skill-')) return 'harness';
  if (lower.includes('not found') || lower.includes('missing')) return 'missing';
  return 'unknown';
}

function generateId() {
  idCounter += 1;
  return `err-${Date.now()}-${idCounter}`;
}

function recordError(context, error) {
  const data = readData();
  const message = typeof error === 'string' ? error : (error.message || String(error));
  const category = categorizeError(context, error);
  data.errors.push({
    id: generateId(),
    context,
    category,
    message,
    recordedAt: new Date().toISOString(),
  });
  writeData(data);
  return { id: data.errors[data.errors.length - 1].id, category };
}

function getErrorTrends(since) {
  const data = readData();
  let errors = data.errors;

  if (since) {
    const sinceTs = typeof since === 'string' ? new Date(since).getTime() : since.getTime();
    errors = errors.filter(e => new Date(e.recordedAt).getTime() >= sinceTs);
  }

  const byCategory = {};
  const byContext = {};
  for (const e of errors) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    byContext[e.context] = (byContext[e.context] || 0) + 1;
  }

  const recentErrors = errors.slice(-20).reverse();

  return {
    total: errors.length,
    byCategory,
    byContext,
    recentErrors,
  };
}

function getErrorSummary() {
  const trends = getErrorTrends();
  const total = trends.total;

  const categories = Object.entries(trends.byCategory)
    .map(([category, count]) => ({
      category,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topContexts = Object.entries(trends.byContext)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([context, count]) => ({ context, count }));

  const data = readData();
  const allErrors = data.errors;
  const firstRecorded = allErrors.length > 0 ? allErrors[0].recordedAt : null;
  const lastRecorded = allErrors.length > 0 ? allErrors[allErrors.length - 1].recordedAt : null;

  return { totalErrors: total, categories, topContexts, firstRecorded, lastRecorded };
}

module.exports = { recordError, getErrorTrends, getErrorSummary, setTelemetryDir };
