const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.resolve(__dirname, '..', '.vibe', 'telemetry', 'tracker.json');

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

function recordCorrection() {
  const t = getTracker();
  t.times_corrected_ai++;
  saveTracker(t);
}

function recordClarification() {
  const t = getTracker();
  t.times_asked_clarification++;
  saveTracker(t);
}

function consumeAndReset() {
  const t = getTracker();
  const snapshot = {
    commands_used: { ...t.commands_used },
    times_corrected_ai: t.times_corrected_ai,
    times_asked_clarification: t.times_asked_clarification,
    since: t.since,
  };
  writeJSON(TRACKER_PATH, {
    commands_used: {},
    times_corrected_ai: 0,
    times_asked_clarification: 0,
    since: new Date().toISOString(),
  });
  return snapshot;
}

module.exports = {
  getTracker,
  recordCommand,
  recordCorrection,
  recordClarification,
  consumeAndReset,
};
