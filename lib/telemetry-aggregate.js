const fs = require('fs');
const path = require('path');

const TELEMETRY_DIR = path.resolve(__dirname, '..', '.vibe', 'telemetry');
const SESSIONS_DIR = path.join(TELEMETRY_DIR, 'sessions');
const PHASE_TIMING_PATH = path.join(TELEMETRY_DIR, 'phase-timing.json');
const ERROR_TRENDS_PATH = path.join(TELEMETRY_DIR, 'error-trends.json');
const COMPACTION_PATH = path.join(TELEMETRY_DIR, 'compaction.json');
const AGGREGATE_PATH = path.join(TELEMETRY_DIR, 'aggregate.json');
const HARNESS_RESULTS_PATH = path.join(TELEMETRY_DIR, 'harness-results.json');

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeJSON(p, d) {
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
}

function listSessionFiles() {
  if (!fs.existsSync(SESSIONS_DIR)) return [];
  return fs
    .readdirSync(SESSIONS_DIR)
    .filter(f => f.startsWith('session-') && f.endsWith('.json'))
    .sort();
}

function aggregateSessions() {
  const files = listSessionFiles();
  const sessions = [];
  for (const f of files) {
    const data = readJSON(path.join(SESSIONS_DIR, f));
    if (data) sessions.push({ file: f, ...data });
  }
  return sessions;
}

function aggregatePhaseTiming() {
  const data = readJSON(PHASE_TIMING_PATH);
  if (!data || !data.records) return {};

  const phases = {};
  for (const r of data.records) {
    if (!phases[r.phase]) {
      phases[r.phase] = { count: 0, totalMs: 0, minMs: Infinity, maxMs: 0, runs: [] };
    }
    const p = phases[r.phase];
    p.count++;
    p.totalMs += r.durationMs;
    p.minMs = Math.min(p.minMs, r.durationMs);
    p.maxMs = Math.max(p.maxMs, r.durationMs);
    p.runs.push({ start: r.startTime, durationMs: r.durationMs });
  }

  for (const [phase, p] of Object.entries(phases)) {
    p.avgMs = Math.round(p.totalMs / p.count);
    p.avgMin = (p.avgMs / 60000).toFixed(1);
  }

  return phases;
}

function aggregateErrors() {
  const data = readJSON(ERROR_TRENDS_PATH);
  if (!data || !data.errors) return { total: 0, byCategory: {}, byContext: {} };

  const byCategory = {};
  const byContext = {};
  for (const e of data.errors) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    byContext[e.context] = (byContext[e.context] || 0) + 1;
  }

  return { total: data.errors.length, byCategory, byContext };
}

function detectStuckPhases(thresholdMs = 300000) {
  const data = readJSON(PHASE_TIMING_PATH);
  if (!data || !data.records) return [];

  const stuck = [];
  for (const r of data.records) {
    if (r.durationMs > thresholdMs) {
      stuck.push({
        phase: r.phase,
        durationMs: r.durationMs,
        durationMin: (r.durationMs / 60000).toFixed(1),
        startTime: r.startTime,
      });
    }
  }
  return stuck;
}

function detectTrends() {
  const data = readJSON(PHASE_TIMING_PATH);
  if (!data || !data.records || data.records.length < 2) return {};

  const phaseRuns = {};
  for (const r of data.records) {
    if (!phaseRuns[r.phase]) phaseRuns[r.phase] = [];
    phaseRuns[r.phase].push(r.durationMs);
  }

  const trends = {};
  for (const [phase, runs] of Object.entries(phaseRuns)) {
    if (runs.length < 2) continue;
    const first = runs[0];
    const last = runs[runs.length - 1];
    const change = (((last - first) / first) * 100).toFixed(1);
    trends[phase] = {
      firstMs: first,
      lastMs: last,
      changePercent: parseFloat(change),
      direction: change > 0 ? 'slower' : 'faster',
    };
  }

  return trends;
}

function generateCrossProjectTrends() {
  const sessions = aggregateSessions();
  if (sessions.length === 0) return null;

  // Collect phase timing across all sessions
  const phaseTimeBySession = {};
  let totalBuildMs = 0;
  let buildCount = 0;
  let harnessPassTotal = 0;
  let harnessCheckTotal = 0;
  const harnessFailures = {};
  const errorTypes = {};

  for (const session of sessions) {
    const phases = session.phases || {};
    for (const [phaseName, phaseData] of Object.entries(phases)) {
      if (!phaseTimeBySession[phaseName]) phaseTimeBySession[phaseName] = [];
      phaseTimeBySession[phaseName].push(phaseData.duration_min || 0);
      if (phaseName === 'build' && phaseData.duration_min) {
        totalBuildMs += phaseData.duration_min;
        buildCount++;
      }
    }

    // Collect error types
    const errors = session.errors || [];
    for (const e of errors) {
      errorTypes[e.type] = (errorTypes[e.type] || 0) + 1;
    }

    // Collect harness results
    const harness = session.harness || {};
    if (harness.checks_run > 0) {
      harnessPassTotal += harness.checks_passed || 0;
      harnessCheckTotal += harness.checks_run;
      for (const f of harness.failures || []) {
        harnessFailures[f] = (harnessFailures[f] || 0) + 1;
      }
    }
  }

  // Find most stuck phase (by longest avg)
  let mostStuckPhase = null;
  let longestAvg = 0;
  for (const [phase, times] of Object.entries(phaseTimeBySession)) {
    const avg = times.reduce((s, t) => s + t, 0) / times.length;
    if (avg > longestAvg) {
      longestAvg = avg;
      mostStuckPhase = { phase, avgMin: avg.toFixed(1) };
    }
  }

  // Find most common error
  const sortedErrors = Object.entries(errorTypes).sort(([, a], [, b]) => b - a);
  const mostCommonError =
    sortedErrors.length > 0
      ? { type: sortedErrors[0][0], pct: Math.round((sortedErrors[0][1] / sessions.length) * 100) }
      : null;

  // Top failure pattern
  const sortedFailures = Object.entries(harnessFailures).sort(([, a], [, b]) => b - a);

  // Suggestions based on trends
  const suggestions = [];
  if (sortedFailures.length > 0) {
    const topFails = sortedFailures.slice(0, 3).map(([f]) => f);
    suggestions.push(
      `${topFails.length} of ${sessions.length} sessions failed on: ${topFails.join(', ')}`
    );
  }
  if (mostStuckPhase && mostStuckPhase.avgMin > 60) {
    suggestions.push(
      `Build phase averages ${mostStuckPhase.avgMin}min — consider breaking tasks smaller`
    );
  }
  if (mostCommonError && mostCommonError.pct > 30) {
    suggestions.push(
      `Add guardrails for '${mostCommonError.type}' errors (${mostCommonError.pct}% of sessions)`
    );
  }

  return {
    totalProjects: 1,
    totalSessions: sessions.length,
    avgBuildTimeMin: buildCount > 0 ? (totalBuildMs / buildCount).toFixed(1) : null,
    mostStuckPhase,
    mostCommonError,
    harnessPassRate:
      harnessCheckTotal > 0 ? Math.round((harnessPassTotal / harnessCheckTotal) * 100) + '%' : null,
    topFailurePatterns: sortedFailures.slice(0, 3).map(([check, count]) => ({ check, count })),
    suggestions,
  };
}

function generateAggregate() {
  const sessions = aggregateSessions();
  const phaseTiming = aggregatePhaseTiming();
  const errors = aggregateErrors();
  const stuckPhases = detectStuckPhases();
  const trends = detectTrends();
  const crossProject = generateCrossProjectTrends();

  const totalSessionTime = Object.values(phaseTiming).reduce((sum, p) => sum + p.totalMs, 0);

  const mostErrorProne = Object.entries(errors.byContext).sort(([, a], [, b]) => b - a)[0];

  return {
    version: '1.1.0',
    generatedAt: new Date().toISOString(),
    summary: {
      totalSessions: sessions.length,
      totalPhaseRuns: Object.values(phaseTiming).reduce((s, p) => s + p.count, 0),
      totalErrors: errors.total,
      totalSessionTimeMin: (totalSessionTime / 60000).toFixed(1),
      mostErrorProne: mostErrorProne
        ? { context: mostErrorProne[0], count: mostErrorProne[1] }
        : null,
    },
    phaseTiming,
    errors,
    stuckPhases,
    trends,
    crossProject,
    sessions: sessions.map(s => ({
      file: s.file,
      timestamp: s.timestamp,
      session_count: s.meta?.session_count,
      interaction_count: s.meta?.interaction_count,
      project: s.project,
    })),
  };
}

function saveAggregate() {
  const aggregate = generateAggregate();
  writeJSON(AGGREGATE_PATH, aggregate);
  return aggregate;
}

module.exports = {
  aggregateSessions,
  aggregatePhaseTiming,
  aggregateErrors,
  detectStuckPhases,
  detectTrends,
  generateCrossProjectTrends,
  generateAggregate,
  saveAggregate,
};

if (require.main === module) {
  const result = saveAggregate();
  console.log(JSON.stringify(result, null, 2));
}
