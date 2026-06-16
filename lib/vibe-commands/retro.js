const path = require('path');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:retro \u2014 Retrospective \u2550\u2550\u2550\n');
  try {
    const { runRetro } = require(path.resolve(__dirname, '..', '..', '.vibe', 'lifecycle', 'auto-maintain'));
    const fs = require('fs');
    const harnessPath = path.resolve(__dirname, '..', '..', '.vibe', 'telemetry', 'harness-results.json');
    let harnessData = { lastResults: [] };
    try { harnessData = JSON.parse(fs.readFileSync(harnessPath, 'utf8')); } catch (e) { /* not found */ }
    const telemetryPath = path.resolve(__dirname, '..', '..', '.vibe', 'telemetry', 'sessions');
    let telemetry = { recent_commits: [], total_sessions: 0 };
    if (fs.existsSync(telemetryPath)) {
      const sessions = fs.readdirSync(telemetryPath).filter(f => f.endsWith('.json')).sort();
      telemetry.total_sessions = sessions.length;
      if (sessions.length > 0) {
        const latest = require(path.join(telemetryPath, sessions[sessions.length - 1]));
        telemetry = { ...telemetry, ...latest.meta };
      }
    }
    const retro = runRetro(harnessData.lastResults || [], telemetry);

    console.log(`  Assessment:  ${retro.assessment || '(not generated)'}`);
    if (retro.harness_summary) {
      console.log(`  Pass rate:   ${retro.harness_summary.pass_rate || '?'}`);
      console.log(`  Failures:    ${retro.harness_summary.failures || 0}`);
    }
    if (retro.telemetry) {
      console.log(`  Sessions:    ${retro.telemetry.total_sessions || 0}`);
      console.log(`  Commits:     ${(retro.telemetry.recent_commits || []).length}`);
    }
    if (retro.notes && retro.notes.length) {
      console.log(`  Notes:       ${retro.notes.length} items`);
      for (const note of retro.notes.slice(0, 3)) {
        console.log(`    - ${note.slice(0, 120)}`);
      }
    }

    console.log('\n  \x1b[2mRetro saved. Run /vibe:learn to capture patterns.\x1b[0m\n');
    return { status: 'ok', retro };
  } catch (e) {
    console.error(`  [retro] ERROR: ${e.message}`);
    return { status: 'error', error: e.message };
  }
};

module.exports = { handler };
