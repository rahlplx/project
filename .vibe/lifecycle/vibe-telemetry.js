#!/usr/bin/env node

/**
 * /vibe:telemetry - Inline diagnostics for telemetry data
 * 
 * Usage:
 *   vibe:telemetry              # Show status dashboard
 *   vibe:telemetry trends       # Show phase timing trends
 *   vibe:telemetry errors       # Show error trends
 *   vibe:telemetry stuck        # Check for stuck phases
 *   vibe:telemetry export       # Export telemetry data as JSON
 */

const fs = require('fs');
const path = require('path');
const { aggregateSessions, aggregatePhaseTiming, aggregateErrors, detectStuckPhases, detectTrends, generateCrossProjectTrends } = require(path.join(__dirname, '..', '..', 'lib', 'telemetry-aggregate'));
const { detectCompactionSignals, formatDuration, renderStatus } = require(path.join(__dirname, '..', '..', 'lib', 'telemetry-status'));
const { getErrorTrends } = require(path.join(__dirname, '..', '..', 'lib', 'error-trends'));
const { recordCommand } = require(path.join(__dirname, '..', '..', 'lib', 'telemetry-tracker'));

const ROOT = path.join(__dirname, '..', '..');
const TELEMETRY_DIR = path.join(ROOT, '.vibe', 'telemetry');
const TELEMETRY_SESSIONS = path.join(TELEMETRY_DIR, 'sessions');

function loadSessions() {
  if (!fs.existsSync(TELEMETRY_SESSIONS)) {
    return [];
  }
  return fs.readdirSync(TELEMETRY_SESSIONS)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(TELEMETRY_SESSIONS, f), 'utf8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function showDashboard() {
  console.log(renderStatus());
}

function showTrends() {
  const sessions = loadSessions();
  if (sessions.length === 0) {
    console.log('No telemetry sessions found.');
    return;
  }

  const trends = detectTrends();

  console.log('\n═══════════════════════════════════════════');
  console.log('  Phase Timing Trends');
  console.log('═══════════════════════════════════════════\n');

  if (Object.keys(trends).length === 0) {
    console.log('  No phase data available.');
  } else {
    for (const [phase, data] of Object.entries(trends)) {
      const arrow = data.direction === 'slower' ? '↑' : '↓';
      console.log(`  ${phase}: ${arrow} ${data.direction} (${data.firstMs}ms → ${data.lastMs}ms, ${data.changePercent}%)`);
    }
  }

  console.log('\n═══════════════════════════════════════════\n');
}

function showErrors() {
  const sessions = loadSessions();
  if (sessions.length === 0) {
    console.log('No telemetry sessions found.');
    return;
  }

  const trends = getErrorTrends();

  console.log('\n═══════════════════════════════════════════');
  console.log('  Error Trends');
  console.log('═══════════════════════════════════════════\n');

  console.log(`  Total Errors: ${trends.total}`);

  if (Object.keys(trends.byCategory).length === 0) {
    console.log('  No errors detected.');
  } else {
    console.log('\n  By Category:');
    for (const [category, count] of Object.entries(trends.byCategory)) {
      console.log(`    ${category}: ${count}`);
    }
  }

  if (trends.recentErrors.length > 0) {
    console.log('\n  Recent Errors:');
    trends.recentErrors.slice(0, 5).forEach(err => {
      console.log(`    ${err.recordedAt}: ${err.error || err.message}`);
    });
  }

  console.log('\n═══════════════════════════════════════════\n');
}

function showStuck() {
  const stuck = detectStuckPhases();

  console.log('\n═══════════════════════════════════════════');
  console.log('  Stuck Phase Detection');
  console.log('═══════════════════════════════════════════\n');

  if (stuck.length === 0) {
    console.log('  ✓ No stuck phases detected.');
  } else {
    console.log(`  ⚠ ${stuck.length} stuck phase(s) detected:`);
    stuck.forEach(s => {
      console.log(`    - ${s.phase}: stuck for ${formatDuration(s.durationMs)}`);
    });
  }

  console.log('\n═══════════════════════════════════════════\n');
}

function exportData() {
  const sessions = loadSessions();
  const output = {
    exportedAt: new Date().toISOString(),
    totalSessions: sessions.length,
    sessions
  };

  const outputPath = path.join(ROOT, 'telemetry-export.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Exported ${sessions.length} sessions to ${outputPath}`);
}

function showCrossProject() {
  const trends = generateCrossProjectTrends();

  console.log('\n═══════════════════════════════════════════');
  console.log('  📈 vibe-stack Trends');
  console.log('═══════════════════════════════════════════\n');

  if (!trends) {
    console.log('  No telemetry data available.');
    console.log('\n═══════════════════════════════════════════\n');
    return;
  }

  console.log(`  Total Sessions:     ${trends.totalSessions}`);
  if (trends.avgBuildTimeMin) console.log(`  Avg Build Time:     ${trends.avgBuildTimeMin} min`);
  if (trends.mostStuckPhase) console.log(`  Most Stuck Phase:   ${trends.mostStuckPhase.phase} (${trends.mostStuckPhase.avgMin}min avg)`);
  if (trends.mostCommonError) console.log(`  Most Common Error:  ${trends.mostCommonError.type} (${trends.mostCommonError.pct}%)`);
  if (trends.harnessPassRate) console.log(`  Harness Pass Rate:  ${trends.harnessPassRate}`);

  if (trends.topFailurePatterns && trends.topFailurePatterns.length > 0) {
    console.log('\n  Top Failure Patterns:');
    for (const f of trends.topFailurePatterns) {
      console.log(`    ${f.check}: ${f.count} occurrence(s)`);
    }
  }

  if (trends.suggestions && trends.suggestions.length > 0) {
    console.log('\n  💡 Suggestions:');
    for (const s of trends.suggestions) {
      console.log(`    • ${s}`);
    }
  }

  console.log('\n═══════════════════════════════════════════\n');
}

// Main
const args = process.argv.slice(2);
const command = args[0] || 'status';

// Record command usage
recordCommand('vibe:telemetry ' + command);

switch (command) {
  case 'status':
  case 'dashboard':
    showDashboard();
    break;
  case 'trends':
    showTrends();
    break;
  case 'cross-project':
    showCrossProject();
    break;
  case 'errors':
    showErrors();
    break;
  case 'stuck':
    showStuck();
    break;
  case 'export':
    exportData();
    break;
  default:
    console.log('Usage: vibe:telemetry [status|trends|cross-project|errors|stuck|export]');
    process.exit(1);
}
