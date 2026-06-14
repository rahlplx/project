const fs = require('fs');
const path = require('path');

let telemetryDir = path.resolve(__dirname, '..', '.vibe', 'telemetry');

function setTelemetryDir(dir) {
  telemetryDir = dir;
}

function dataFile() {
  return path.join(telemetryDir, 'phase-timing.json');
}

function ensureDir() {
  fs.mkdirSync(telemetryDir, { recursive: true });
}

function readTimingData() {
  ensureDir();
  const file = dataFile();
  try {
    if (!fs.existsSync(file)) {
      return { version: '1.0.0', records: [] };
    }
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { version: '1.0.0', records: [] };
  }
}

function writeTimingData(data) {
  ensureDir();
  fs.writeFileSync(dataFile(), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function trackPhase(phase) {
  const data = readTimingData();
  data.records.push({
    phase,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    durationMs: 0,
    recordedAt: new Date().toISOString(),
  });
  writeTimingData(data);
  return data.records.length;
}

function checkStuck(phase, history) {
  if (!history) {
    const data = readTimingData();
    history = data.records.filter(r => r.phase === phase);
  }

  const samePhase = [];
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].phase === phase) {
      samePhase.push(history[i]);
    } else {
      break;
    }
  }

  const consecutiveCycles = samePhase.length;
  const isStuck = consecutiveCycles >= 4;
  let alert = null;

  if (isStuck) {
    const firstSeen = samePhase[samePhase.length - 1].recordedAt || 'unknown';
    const lastSeen = samePhase[0].recordedAt || 'unknown';
    alert = `STUCK_DETECTED: phase "${phase}" has been active for ${consecutiveCycles} consecutive cycles (first seen: ${firstSeen}, last: ${lastSeen})`;
  }

  return { isStuck, consecutiveCycles, alert };
}

function getStuckAlerts() {
  const data = readTimingData();
  const phases = [...new Set(data.records.map(r => r.phase))];
  const alerts = [];

  for (const phase of phases) {
    const result = checkStuck(phase);
    if (result.isStuck) {
      const phaseRecords = data.records.filter(r => r.phase === phase);
      alerts.push({
        phase,
        consecutiveCycles: result.consecutiveCycles,
        firstSeen: phaseRecords[phaseRecords.length - 1].recordedAt,
        lastSeen: phaseRecords[0].recordedAt,
        alert: result.alert,
      });
    }
  }

  return { alerts, totalStuck: alerts.length };
}

module.exports = { checkStuck, getStuckAlerts, setTelemetryDir, trackPhase };
