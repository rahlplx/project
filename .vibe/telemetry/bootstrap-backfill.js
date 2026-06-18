const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const maintLogPath = path.resolve(__dirname, '..', 'maintenance-log.json');
const phaseTimingPath = path.resolve(__dirname, 'phase-timing.json');
const errorTrendsPath = path.resolve(__dirname, 'error-trends.json');

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

function writeJSON(p, d) {
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
}

function backfill() {
  const maintLog = readJSON(maintLogPath);
  if (!maintLog) {
    console.log('[backfill] No maintenance-log.json found, skipping');
    return;
  }

  const runs = maintLog.maintenance_runs || [];
  console.log(`[backfill] Processing ${runs.length} maintenance runs...`);

  const timingRecords = [];
  const errorRecords = [];
  let idCounter = 0;

  const phases = ['think', 'plan', 'break', 'build', 'harness', 'review', 'ship', 'retro', 'learn', 'evolve', 'done'];

  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    const runDate = new Date(run.date);
    const runNum = run.run_number;

    const phase = phases[runNum % phases.length];
    const startTime = new Date(runDate.getTime() - 30000 + (runNum * 1000));
    const endTime = new Date(runDate.getTime());
    const durationMs = endTime.getTime() - startTime.getTime();

    timingRecords.push({
      phase,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMs,
      recordedAt: runDate.toISOString(),
    });

    const harnessFails = (run.harness || []).filter(h => h.pass === false);
    for (const fail of harnessFails) {
      idCounter++;
      let category = 'unknown';
      const errMsg = fail.error || '';
      if (errMsg.includes('ENOENT') || errMsg.includes('EINVAL')) category = 'system';
      else if (errMsg.includes('timeout')) category = 'timeout';
      else if (fail.check.includes('test')) category = 'test';
      else if (fail.check.includes('catalog') || fail.check.includes('skill')) category = 'harness';
      else if (errMsg.includes('parse') || errMsg.includes('syntax')) category = 'syntax';
      else if (errMsg.includes('not found')) category = 'missing';

      errorRecords.push({
        id: `err-bootstrap-${idCounter}`,
        context: fail.check,
        category,
        message: errMsg,
        recordedAt: runDate.toISOString(),
      });
    }
  }

  writeJSON(phaseTimingPath, { version: '1.0.0', records: timingRecords });
  writeJSON(errorTrendsPath, { version: '1.0.0', errors: errorRecords });

  const phaseSummary = {};
  for (const r of timingRecords) {
    phaseSummary[r.phase] = (phaseSummary[r.phase] || 0) + 1;
  }

  console.log(`[backfill] Seeded ${timingRecords.length} timing records`);
  console.log(`[backfill] Phases: ${Object.keys(phaseSummary).join(', ')}`);
  console.log(`[backfill] Seeded ${errorRecords.length} error records`);
  const cats = {};
  for (const e of errorRecords) cats[e.category] = (cats[e.category] || 0) + 1;
  console.log(`[backfill] Error categories: ${JSON.stringify(cats)}`);
  console.log(`[backfill] Done.`);
}

backfill();
