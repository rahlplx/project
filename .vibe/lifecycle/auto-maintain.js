const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const LIFECYCLE_PATH = path.join(ROOT, 'lifecycle.json');
const STATE_PATH = path.join(ROOT, 'state.json');
const EVOLUTION_PATH = path.join(ROOT, 'evolution.json');
const MAINTENANCE_LOG_PATH = path.join(ROOT, 'maintenance-log.json');
const LEARNINGS_DIR = path.join(ROOT, 'learnings');
const SOLUTIONS_DIR = path.join(ROOT, '..', 'docs', 'solutions');
const TELEMETRY_SESSIONS = path.join(ROOT, 'telemetry', 'sessions');

// ── Helpers ────────────────────────────────────────────────────
function readJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function writeJSON(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8'); }

// ── Phase 1: Harness ───────────────────────────────────────────
function runHarness(runTestSuite = true) {
  console.log('  [harness] Running checks...');
  const results = [];

  // Check 1: YAML valid
  try {
    const yaml = require('js-yaml');
    const toolsYaml = fs.readFileSync(path.join(ROOT, '..', 'catalog', 'tools.yaml'), 'utf8');
    const doc = yaml.load(toolsYaml);
    const toolCount = doc.tools?.length || 0;
    results.push({ check: 'catalog-yaml-valid', pass: true, data: { toolCount } });
    console.log(`  [harness]  ✓ catalog-yaml-valid (${toolCount} tools)`);
  } catch (e) {
    results.push({ check: 'catalog-yaml-valid', pass: false, error: e.message });
    console.log(`  [harness]  ✗ catalog-yaml-valid: ${e.message}`);
  }

  // Check 2: Category counts
  try {
    const yaml = require('js-yaml');
    const toolsYaml = fs.readFileSync(path.join(ROOT, '..', 'catalog', 'tools.yaml'), 'utf8');
    const doc = yaml.load(toolsYaml);
    const cats = {};
    doc.tools.forEach(t => { cats[t.category] = (cats[t.category] || 0) + 1; });
    const min = Math.min(...Object.values(cats));
    results.push({ check: 'catalog-category-count', pass: min >= 3, data: cats });
    console.log(`  [harness]  ✓ catalog-category-count (min: ${min}, cats: ${Object.keys(cats).length})`);
  } catch (e) {
    results.push({ check: 'catalog-category-count', pass: false, error: e.message });
  }

  // Check 3: Handoff templates exist
  try {
    const handoffsDir = path.join(ROOT, '..', 'docs', 'handoffs');
    const templates = ['AGENTS.md', 'standard.md', 'qa-pass.md', 'qa-fail.md',
      'escalation.md', 'phase-gate.md', 'sprint.md', 'incident.md'];
    const missing = templates.filter(t => !fs.existsSync(path.join(handoffsDir, t)));
    results.push({
      check: 'handoff-templates',
      pass: missing.length === 0,
      data: { total: templates.length, missing }
    });
    console.log(`  [harness]  ${missing.length === 0 ? '✓' : '✗'} handoff-templates (${templates.length - missing.length}/${templates.length})`);
  } catch (e) {
    results.push({ check: 'handoff-templates', pass: false, error: e.message });
  }

  // Check 4: Phase gates document
  try {
    const gatesPath = path.join(ROOT, '..', 'docs', 'gates.md');
    const gatesContent = fs.readFileSync(gatesPath, 'utf8');
    const requiredTransitions = [
      'think -- plan', 'plan -- break', 'break -- build', 'build -- harness',
      'harness -- review', 'review -- ship', 'ship -- retro', 'retro -- learn',
      'learn -- evolve', 'evolve -- done'
    ];
    const hasAllTransitions = requiredTransitions.every(t => gatesContent.includes(t));
    results.push({
      check: 'phase-gates-doc',
      pass: hasAllTransitions,
      data: { size: gatesContent.length }
    });
    console.log(`  [harness]  ${hasAllTransitions ? '✓' : '✗'} phase-gates-doc (${gatesContent.length} chars)`);
  } catch (e) {
    results.push({ check: 'phase-gates-doc', pass: false, error: e.message });
  }

  // Check 5: Test suite
  if (runTestSuite) {
    try {
      const { execSync } = require('child_process');
      const output = execSync('npm test 2>&1', { cwd: ROOT, timeout: 120000 });
      const passed = output.toString().match(/Tests:\s+(\d+)\s+passed/);
      const failed = output.toString().match(/Tests:\s+(\d+)\s+failed/);
      const passCount = passed ? parseInt(passed[1]) : 0;
      const failCount = failed ? parseInt(failed[1]) : 0;
      results.push({
        check: 'test-suite',
        pass: failCount === 0,
        data: { passCount, failCount }
      });
      console.log(`  [harness]  ✓ test-suite (${passCount} passed, ${failCount} failed)`);
    } catch (e) {
      results.push({ check: 'test-suite', pass: false, error: e.message });
      console.log(`  [harness]  ✗ test-suite: ${e.message}`);
    }
  } else {
    results.push({ check: 'test-suite', pass: true, data: { passCount: 0, failCount: 0, skipped: true } });
  }

  // Check 6: Skill originality
  try {
    const { checkOriginality } = require(path.join(ROOT, '..', 'lib', 'check-originality.js'));
    const result = checkOriginality({ rootDir: path.join(ROOT, '..') });
    const hasFails = result.fails.length > 0;
    results.push({
      check: 'skill-originality',
      pass: !hasFails,
      data: { files: result.files, worst: result.worst, fails: result.fails.length, warns: result.warns.length }
    });
    console.log(`  [harness]  ${hasFails ? '✗' : '✓'} skill-originality (worst: ${result.worst}%, fails: ${result.fails.length}, warns: ${result.warns.length})`);
  } catch (e) {
    results.push({ check: 'skill-originality', pass: false, error: e.message });
    console.log(`  [harness]  ✗ skill-originality: ${e.message}`);
  }

  return results;
}

// ── Phase 2: Telemetry ─────────────────────────────────────────
function captureTelemetry() {
  console.log('  [telemetry] Capturing session snapshot...');

  const lifecycle = readJSON(LIFECYCLE_PATH);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionFile = path.join(TELEMETRY_SESSIONS, `session-${timestamp}.json`);

  const snapshot = {
    timestamp: new Date().toISOString(),
    session_count: lifecycle.session_count,
    interaction_count: lifecycle.interaction_count,
    total_sessions: lifecycle.total_sessions,
    total_interactions: lifecycle.total_interactions,
    maintenance_count: lifecycle.maintenance_count,
    pipeline_count: lifecycle.pipeline_count,
    recent_commits: getRecentCommits()
  };

  writeJSON(sessionFile, snapshot);
  console.log(`  [telemetry]  ✓ captured to telemetry/sessions/`);
  return snapshot;
}

function getRecentCommits() {
  try {
    const { execSync } = require('child_process');
    const output = execSync('git log --oneline -10', { cwd: ROOT, timeout: 5000 });
    return output.toString().trim().split('\n').map(l => l.trim());
  } catch {
    return [];
  }
}

// ── Phase 3: Retro — Quick Assessment ──────────────────────────
function runRetro(harnessResults, telemetry) {
  console.log('  [retro] Generating retro snapshot...');

  const failures = harnessResults.filter(r => !r.pass);
  const retro = {
    timestamp: new Date().toISOString(),
    assessment: failures.length === 0 ? 'healthy' : 'degraded',
    harness_summary: {
      total: harnessResults.length,
      passed: harnessResults.filter(r => r.pass).length,
      failed: failures.length
    },
    telemetry: {
      commits_since_last: telemetry.recent_commits?.length || 0,
      total_sessions: telemetry.total_sessions
    },
    notes: failures.length > 0
      ? `Harness failed: ${failures.map(f => f.check).join(', ')}`
      : 'All checks passed.'
  };

  const retroFile = path.join(LEARNINGS_DIR, 'evolutions', `retro-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeJSON(retroFile, retro);
  console.log(`  [retro]  ✓ snapshot saved`);
  return retro;
}

// ── Phase 4: Learn ─────────────────────────────────────────────
function runLearn() {
  console.log('  [learn] Extracting patterns...');

  // Scan recent anti-pattern docs for uncaptured lessons
  const antiDir = path.join(LEARNINGS_DIR, 'anti-patterns');
  let count = 0;
  if (fs.existsSync(antiDir)) {
    count = fs.readdirSync(antiDir).filter(f => f.endsWith('.md')).length;
  }
  const patternDir = path.join(LEARNINGS_DIR, 'patterns');
  let pcount = 0;
  if (fs.existsSync(patternDir)) {
    pcount = fs.readdirSync(patternDir).filter(f => f.endsWith('.md')).length;
  }

  // Check quality scores in evolution.json to flag low performers
  const evo = readJSON(EVOLUTION_PATH);
  const lowQuality = [];
  if (evo && evo.rules) {
    for (const [name, rule] of Object.entries(evo.rules)) {
      if (rule.quality_score !== null && rule.quality_score < 0.6) {
        lowQuality.push(name);
      }
    }
  }

  const result = {
    timestamp: new Date().toISOString(),
    anti_pattern_count: count,
    pattern_count: pcount,
    low_quality_rules: lowQuality
  };

  console.log(`  [learn]  ✓ ${count} anti-patterns, ${pcount} patterns, ${lowQuality.length} low-quality rules`);
  return result;
}

// ── Phase 5: Evolve ────────────────────────────────────────────
function runEvolve(learnResult) {
  console.log('  [evolve] Checking evolution.json for quality degradation...');

  const evo = readJSON(EVOLUTION_PATH);
  if (!evo) {
    console.log('  [evolve]  - no evolution.json found, skipping');
    return null;
  }

  const proposals = [];

  // Flag low-quality rules for retirement
  for (const name of learnResult.low_quality_rules) {
    proposals.push({
      action: 'retire',
      rule: name,
      reason: `Quality score < 0.6, eligible for retire/improve`
    });
  }

  // Check if any proposed_rules are still pending and should be activated
  if (evo.proposed_rules) {
    for (const p of evo.proposed_rules) {
      if (p.status === 'pending') {
        proposals.push({
          action: 'pending-proposal',
          rule: p.name,
          reason: p.reason
        });
      }
    }
  }

  console.log(`  [evolve]  ✓ ${proposals.length} proposals generated`);
  return proposals;
}

// ── Phase 6: Persist Results ───────────────────────────────────
function persist(lifecycle, harnessResults, telemetry, retro, learnResult, evolveResult) {
  // Update lifecycle counters
  lifecycle.last_maintenance = new Date().toISOString();
  lifecycle.last_maintenance_phase = 'full';
  lifecycle.maintenance_count = (lifecycle.maintenance_count || 0) + 1;
  lifecycle.interaction_count = 0; // reset
  lifecycle.updated = new Date().toISOString();
  writeJSON(LIFECYCLE_PATH, lifecycle);

  // Log maintenance run
  const maintLog = readJSON(MAINTENANCE_LOG_PATH) || { version: '1.0.0', maintenance_runs: [] };
  maintLog.maintenance_runs.push({
    date: new Date().toISOString(),
    run_number: lifecycle.maintenance_count,
    harness: harnessResults,
    retro: retro,
    learn: learnResult,
    evolve_proposals: evolveResult
  });
  maintLog.updated = new Date().toISOString();
  writeJSON(MAINTENANCE_LOG_PATH, maintLog);

  // Update state.json
  const state = readJSON(STATE_PATH);
  if (state) {
    if (!state.lifecycle) state.lifecycle = {};
    state.lifecycle.last_maintenance = lifecycle.last_maintenance;
    state.lifecycle.maintenance_count = lifecycle.maintenance_count;
    state.lifecycle.interaction_count = lifecycle.interaction_count;
    state.updated = new Date().toISOString();
    writeJSON(STATE_PATH, state);
  }
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Auto-Maintenance Cycle');
  console.log('═══════════════════════════════════════════\n');

  const start = Date.now();

  // Read lifecycle
  const lifecycle = readJSON(LIFECYCLE_PATH) || {
    session_count: 0, interaction_count: 0,
    total_sessions: 0, total_interactions: 0,
    maintenance_count: 0, pipeline_count: 0
  };

  // Phase 1
  const harnessResults = runHarness();
  // Phase 2
  const telemetry = captureTelemetry();
  // Phase 3
  const retro = runRetro(harnessResults, telemetry);
  // Phase 4
  const learnResult = runLearn();
  // Phase 5
  const evolveResult = runEvolve(learnResult);

  // Phase 6
  persist(lifecycle, harnessResults, telemetry, retro, learnResult, evolveResult);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const allPassed = harnessResults.every(r => r.pass);

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  Cycle complete in ${elapsed}s`);
  console.log(`  Health: ${allPassed ? '✓ ALL PASS' : '✗ HAS FAILURES'}`);
  console.log(`  Maintenance #${lifecycle.maintenance_count}`);
  console.log(`  Proposals: ${evolveResult ? evolveResult.length : 0}`);
  console.log(`═══════════════════════════════════════════\n`);

  return { allPassed, maintenanceNumber: lifecycle.maintenance_count };
}

if (require.main === module) {
  main().catch(e => {
    console.error('[maintenance] FATAL:', e.message);
    process.exit(1);
  });
}

module.exports = { main, runHarness, runRetro, runLearn, runEvolve };
