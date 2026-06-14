const fs = require('fs');
const path = require('path');

const TELEMETRY_DIR = path.resolve(__dirname, '..', '.vibe', 'telemetry');
const SESSIONS_DIR = path.join(TELEMETRY_DIR, 'sessions');
const STATE_PATH = path.resolve(__dirname, '..', '.vibe', 'state.json');
const PHASE_TIMING_PATH = path.join(TELEMETRY_DIR, 'phase-timing.json');
const ERROR_TRENDS_PATH = path.join(TELEMETRY_DIR, 'error-trends.json');

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

function listSessionFiles() {
  if (!fs.existsSync(SESSIONS_DIR)) return [];
  return fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.startsWith('session-') && f.endsWith('.json'))
    .sort();
}

function getLatestSession() {
  const files = listSessionFiles();
  if (files.length === 0) return null;
  return readJSON(path.join(SESSIONS_DIR, files[files.length - 1]));
}

function getSessionCount() {
  return listSessionFiles().length;
}

function getPhaseStats() {
  const data = readJSON(PHASE_TIMING_PATH);
  if (!data || !data.records) return {};

  const phases = {};
  for (const r of data.records) {
    if (!phases[r.phase]) {
      phases[r.phase] = { count: 0, totalMs: 0, minMs: Infinity, maxMs: 0 };
    }
    const p = phases[r.phase];
    p.count++;
    p.totalMs += r.durationMs;
    p.minMs = Math.min(p.minMs, r.durationMs);
    p.maxMs = Math.max(p.maxMs, r.durationMs);
  }

  for (const [, p] of Object.entries(phases)) {
    p.avgMs = Math.round(p.totalMs / p.count);
    p.avgMin = (p.avgMs / 60000).toFixed(1);
  }

  return phases;
}

function getErrorStats() {
  const data = readJSON(ERROR_TRENDS_PATH);
  if (!data || !data.errors) return { total: 0, byCategory: {} };

  const byCategory = {};
  for (const e of data.errors) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  }

  return { total: data.errors.length, byCategory };
}

function detectCompactionSignals() {
  const files = listSessionFiles();
  if (files.length < 2) return [];

  const signals = [];
  const recentFiles = files.slice(-5);

  for (let i = 1; i < recentFiles.length; i++) {
    const prev = readJSON(path.join(SESSIONS_DIR, recentFiles[i - 1]));
    const curr = readJSON(path.join(SESSIONS_DIR, recentFiles[i]));

    if (!prev || !curr) continue;

    if (prev.timestamp && curr.timestamp) {
      const timeDiff = new Date(curr.timestamp) - new Date(prev.timestamp);
      if (timeDiff < 60000) {
        signals.push({
          type: 'rapid_restart',
          message: 'Sessions started within 1 minute of each other',
          prevSession: recentFiles[i - 1],
          currSession: recentFiles[i],
          gapMs: timeDiff
        });
      }
    }
  }

  return signals;
}

function getTelemetryEnabled() {
  const state = readJSON(STATE_PATH);
  return state?.telemetry !== false;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

function renderStatus() {
  const enabled = getTelemetryEnabled();
  const sessionCount = getSessionCount();
  const phaseStats = getPhaseStats();
  const errorStats = getErrorStats();
  const compactionSignals = detectCompactionSignals();

  const totalPhaseRuns = Object.values(phaseStats).reduce((s, p) => s + p.count, 0);
  const totalTime = Object.values(phaseStats).reduce((s, p) => s + p.totalMs, 0);

  let longestPhase = null;
  let longestMs = 0;
  for (const [phase, p] of Object.entries(phaseStats)) {
    if (p.avgMs > longestMs) {
      longestMs = p.avgMs;
      longestPhase = phase;
    }
  }

  let mostErrorProne = null;
  let mostErrors = 0;
  for (const [cat, count] of Object.entries(errorStats.byCategory)) {
    if (count > mostErrors) {
      mostErrors = count;
      mostErrorProne = cat;
    }
  }

  const lines = [
    '┌─────────────────────────────────────────┐',
    '│  📊 vibe-stack Diagnostics               │',
    '├─────────────────────────────────────────┤',
    `│  Telemetry:     ${enabled ? '✅ enabled' : '❌ disabled'}              │`,
    `│  Sessions:      ${sessionCount} total                    │`,
    `│  Phase Runs:    ${totalPhaseRuns} total                    │`,
    `│  Total Time:    ${formatDuration(totalTime).padEnd(25)}│`,
    `│  Errors:        ${errorStats.total} total                    │`,
  ];

  if (longestPhase) {
    lines.push(`│  Longest Phase: ${longestPhase} (${formatDuration(longestMs)})`.padEnd(42) + '│');
  }

  if (mostErrorProne) {
    lines.push(`│  Most Errors:   ${mostErrorProne} (${mostErrors})`.padEnd(42) + '│');
  }

  if (compactionSignals.length > 0) {
    lines.push('├─────────────────────────────────────────┤');
    lines.push(`│  ⚠ Compaction:  ${compactionSignals.length} signals detected`.padEnd(42) + '│');
  }

  lines.push('└─────────────────────────────────────────┘');

  return lines.join('\n');
}

module.exports = {
  getTelemetryEnabled,
  getSessionCount,
  getPhaseStats,
  getErrorStats,
  detectCompactionSignals,
  renderStatus,
  formatDuration
};

if (require.main === module) {
  console.log(renderStatus());
}
