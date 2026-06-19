/**
 * VibeNexus Telemetry Tracker
 * Captures usage diagnostics, errors, and system evolution metrics.
 */

const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.resolve(__dirname, '..', '.vibenexus', 'telemetry', 'tracker.json');

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeJSON(p, d) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
}

function getTracker() {
  return (
    readJSON(TRACKER_PATH) || {
      commands_used: {},
      times_corrected_ai: 0,
      times_asked_clarification: 0,
      slop_detected: 0,
      token_efficiency: 0.95,
      since: new Date().toISOString(),
    }
  );
}

function saveTracker(t) {
  writeJSON(TRACKER_PATH, t);
}

function recordCommand(commandName) {
  const t = getTracker();
  t.commands_used[commandName] = (t.commands_used[commandName] || 0) + 1;
  saveTracker(t);
}

function recordSlop() {
  const t = getTracker();
  t.slop_detected++;
  saveTracker(t);
}

function generateAdminReport(period = 'daily') {
  const t = getTracker();
  return {
    report_type: period,
    timestamp: new Date().toISOString(),
    summary: {
      total_interactions: Object.values(t.commands_used).reduce((a, b) => a + b, 0),
      health_score: Math.max(0, 1 - (t.slop_detected / 100)),
      efficiency: t.token_efficiency,
    },
    top_skills: Object.entries(t.commands_used)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
  };
}

module.exports = {
  getTracker,
  saveTracker,
  recordCommand,
  recordSlop,
  generateAdminReport
};
