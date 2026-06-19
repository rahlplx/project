const fs = require('fs');
const path = require('path');

const TELEMETRY_DIR = path.resolve(__dirname, '..', '.vibe', 'telemetry');
const SESSIONS_DIR = path.join(TELEMETRY_DIR, 'sessions');
const STATE_PATH = path.resolve(__dirname, '..', '.vibe', 'state.json');
const PHASE_TIMING_PATH = path.join(TELEMETRY_DIR, 'phase-timing.json');
const ERROR_TRENDS_PATH = path.join(TELEMETRY_DIR, 'error-trends.json');
const COMPACTION_PATH = path.join(TELEMETRY_DIR, 'compaction.json');
const HARNESS_RESULTS_PATH = path.join(TELEMETRY_DIR, 'harness-results.json');

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function listSessionFiles() {
  if (!fs.existsSync(SESSIONS_DIR)) return [];
  return fs
    .readdirSync(SESSIONS_DIR)
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
  if (!data || !data.errors) return { total: 0, byCategory: {}, recentErrors: [] };

  const byCategory = {};
  for (const e of data.errors) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  }

  return {
    total: data.errors.length,
    byCategory,
    recentErrors: (data.errors || []).slice(-5).reverse(),
  };
}

function detectCompactionSignals() {
  const signals = [];

  // Check session density
  const files = listSessionFiles();
  if (files.length < 2) return signals;

  const recentFiles = files.slice(-5);
  for (let i = 1; i < recentFiles.length; i++) {
    const prev = readJSON(path.join(SESSIONS_DIR, recentFiles[i - 1]));
    const curr = readJSON(path.join(SESSIONS_DIR, recentFiles[i]));

    if (!prev || !curr) continue;
    const prevTime = prev.ended_at || prev.timestamp;
    const currTime = curr.started_at || curr.timestamp;
    if (!prevTime || !currTime) continue;

    const gap = new Date(currTime).getTime() - new Date(prevTime).getTime();
    if (gap > 0 && gap < 60000) {
      signals.push({
        type: 'rapid_restart',
        message: 'Session restarted within 1 minute — possible compaction',
        prevSession: recentFiles[i - 1],
        currSession: recentFiles[i],
        gapMs: gap,
      });
    }
  }

  // Check compaction.json for recorded events
  const compactionData = readJSON(COMPACTION_PATH);
  if (compactionData && compactionData.events) {
    const recent = compactionData.events.slice(-3);
    for (const e of recent) {
      if (e.symptom && e.time_lost_min > 0) {
        signals.push({
          type: 'compaction_event',
          message: `${e.symptom} (lost ${e.time_lost_min}min)`,
          phase: e.phase,
          timeLostMin: e.time_lost_min,
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

function getHarnessSummary() {
  const data = readJSON(HARNESS_RESULTS_PATH);
  if (!data || !data.lastResults) return null;

  return {
    checksRun: data.lastResults.length,
    checksPassed: data.lastResults.filter(r => r.pass).length,
    checksFailed: data.lastResults.filter(r => !r.pass).length,
    failures: data.lastResults.filter(r => !r.pass).map(r => r.check),
  };
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

function renderStatus() {
  getTelemetryEnabled();
  getSessionCount();
  const phaseStats = getPhaseStats();
  const errorStats = getErrorStats();
  const compactionSignals = detectCompactionSignals();
  const harnessSummary = getHarnessSummary();
  const latestSession = getLatestSession();

  const totalPhaseRuns = Object.values(phaseStats).reduce((s, p) => s + p.count, 0);
  Object.values(phaseStats).reduce((s, p) => s + p.totalMs, 0);

  // Find longest phase by avg duration
  let longestPhase = null;
  let longestMs = 0;
  for (const [phase, p] of Object.entries(phaseStats)) {
    if (p.avgMs > longestMs) {
      longestMs = p.avgMs;
      longestPhase = phase;
    }
  }

  // Find most error-prone category
  let mostErrorProne = null;
  let mostErrors = 0;
  for (const [cat, count] of Object.entries(errorStats.byCategory)) {
    if (count > mostErrors) {
      mostErrors = count;
      mostErrorProne = cat;
    }
  }

  // Count resolved vs active errors from latest session
  let resolvedErrors = 0;
  let activeErrors = 0;
  if (latestSession && latestSession.errors) {
    for (const e of latestSession.errors) {
      if (e.resolution) resolvedErrors++;
      else activeErrors++;
    }
  }

  // Count blockers
  const blockerCount = latestSession && latestSession.blockers ? latestSession.blockers.length : 0;
  const resolvedBlockers =
    latestSession && latestSession.blockers
      ? latestSession.blockers.filter(b => b.resolution).length
      : 0;

  // Build phase efficiency line
  const phaseNames = Object.keys(phaseStats).sort();
  const phaseLine = phaseNames
    .map(p => {
      const avg = phaseStats[p].avgMin;
      return `${p}(${avg}m)`;
    })
    .join(' ');

  const lines = [];
  const w = 53;

  function padMid(text) {
    const esc = (function () {
      return '\x1b';
    })();
    const clean = text
      .replace(new RegExp(esc + '\\[[0-9;]*m', 'g'), '')
      .replace(/[^\x20-\x7E\u2500-\u257F]/g, '');
    const visualLen = [...clean].length;
    const padded = text + ' '.repeat(Math.max(0, w - visualLen - 2));
    return '│  ' + padded + ' │';
  }

  lines.push('┌' + '─'.repeat(w) + '┐');
  lines.push(padMid('📊 vibenexus Diagnostics'));
  lines.push('├' + '─'.repeat(w) + '┤');

  const sessionDuration = latestSession
    ? (() => {
        const start = new Date(latestSession.started_at);
        const end = new Date(latestSession.ended_at);
        const diff = end.getTime() - start.getTime();
        return isNaN(diff) || diff <= 0 ? 'N/A' : formatDuration(diff);
      })()
    : 'N/A';

  const currentPhase = latestSession
    ? Object.keys(latestSession.phases || {}).slice(-1)[0] || 'idle'
    : 'idle';

  const longestPhaseStr = longestPhase
    ? `${longestPhase} (${formatDuration(longestMs)} — longest)`
    : 'N/A';

  lines.push(padMid(`Session Duration:   ${sessionDuration}`));
  lines.push(padMid(`Current Phase:      ${currentPhase}`));
  lines.push(padMid(`Commands Run:       ${totalPhaseRuns} total`));
  lines.push(
    padMid(
      `Errors:             ${errorStats.total} (${resolvedErrors} resolved, ${activeErrors} active)`
    )
  );
  lines.push(padMid(`Blockers:           ${blockerCount} (${resolvedBlockers} resolved)`));
  lines.push(padMid(`Longest Phase:      ${longestPhaseStr}`));

  if (harnessSummary) {
    lines.push(
      padMid(
        `Harness Checks:     ${harnessSummary.checksPassed}/${harnessSummary.checksRun} passed`
      )
    );
  }

  lines.push('├' + '─'.repeat(w) + '┤');

  if (phaseLine) {
    lines.push(padMid(`Phase Efficiency:   ${phaseLine}`));
  }

  if (mostErrorProne) {
    lines.push(padMid(`🔴 Most Error-Prone: ${mostErrorProne} (${mostErrors} errors)`));
  }

  if (harnessSummary && harnessSummary.checksFailed > 0) {
    lines.push(padMid(`📊 Harness Failures: ${harnessSummary.failures.join(', ')}`));
  }

  if (compactionSignals.length > 0) {
    lines.push(padMid(`⚠ Compaction: ${compactionSignals.length} signal(s) detected`));
    for (const sig of compactionSignals.slice(0, 2)) {
      lines.push(padMid(`  ↳ ${sig.message}`));
    }
  }

  if (
    latestSession &&
    latestSession.compaction &&
    latestSession.compaction.compaction_warning_signals
  ) {
    lines.push('├' + '─'.repeat(w) + '┤');
    lines.push(padMid('Compaction Warning Signals:'));
    for (const sig of latestSession.compaction.compaction_warning_signals) {
      lines.push(padMid(`  • ${sig}`));
    }
  }

  lines.push('└' + '─'.repeat(w) + '┘');

  return lines.join('\n');
}

module.exports = {
  getTelemetryEnabled,
  getSessionCount,
  getPhaseStats,
  getErrorStats,
  detectCompactionSignals,
  renderStatus,
  formatDuration,
  getHarnessSummary,
  getLatestSession,
};

if (require.main === module) {
  console.log(renderStatus());
}
