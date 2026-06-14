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

function readData() {
  ensureDir();
  const file = dataFile();
  try {
    if (!fs.existsSync(file)) {
      const fresh = { version: '1.0.0', records: [] };
      writeData(fresh);
      return fresh;
    }
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    const backupName = `phase-timing-backup-${Date.now()}.json`;
    try {
      fs.copyFileSync(file, path.join(telemetryDir, backupName));
    } catch (_) {}
    const fresh = { version: '1.0.0', records: [] };
    writeData(fresh);
    return fresh;
  }
}

function writeData(data) {
  ensureDir();
  fs.writeFileSync(dataFile(), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function trackPhaseTiming(phase, startTime, endTime) {
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const end = endTime instanceof Date ? endTime : new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('TIMING_PARSE_ERROR: Invalid timestamp');
  }

  const durationMs = end.getTime() - start.getTime();
  const data = readData();
  data.records.push({
    phase,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    durationMs,
    recordedAt: new Date().toISOString(),
  });
  writeData(data);
  return { phase, durationMs };
}

function getPhaseStats(phase) {
  const data = readData();
  const records = data.records.filter(r => r.phase === phase);

  if (records.length === 0) {
    return { phase, count: 0, minMs: 0, maxMs: 0, avgMs: 0, medianMs: 0, totalMs: 0 };
  }

  const durations = records.map(r => r.durationMs).sort((a, b) => a - b);
  const totalMs = durations.reduce((s, d) => s + d, 0);
  const minMs = durations[0];
  const maxMs = durations[durations.length - 1];
  const avgMs = Math.round(totalMs / durations.length);

  let medianMs;
  const mid = Math.floor(durations.length / 2);
  if (durations.length % 2 === 0) {
    medianMs = Math.round((durations[mid - 1] + durations[mid]) / 2);
  } else {
    medianMs = durations[mid];
  }

  return { phase, count: records.length, minMs, maxMs, avgMs, medianMs, totalMs };
}

function getAllTimingSummary() {
  const data = readData();
  const phases = [...new Set(data.records.map(r => r.phase))].sort();
  const phaseStats = phases.map(p => getPhaseStats(p));
  const overall = phaseStats.reduce(
    (acc, s) => ({
      count: acc.count + s.count,
      totalMs: acc.totalMs + s.totalMs,
      minMs: Math.min(acc.minMs, s.minMs === 0 ? Infinity : s.minMs),
      maxMs: Math.max(acc.maxMs, s.maxMs),
    }),
    { count: 0, totalMs: 0, minMs: Infinity, maxMs: 0 }
  );
  if (overall.minMs === Infinity) overall.minMs = 0;
  overall.avgMs = overall.count > 0 ? Math.round(overall.totalMs / overall.count) : 0;

  return { phases: phaseStats, overall };
}

module.exports = { trackPhaseTiming, getPhaseStats, getAllTimingSummary, setTelemetryDir };
