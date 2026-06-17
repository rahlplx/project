const path = require('path');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:retro \u2014 Retrospective \u2550\u2550\u2550\n');
  try {
    const { runRetro } = require(
      path.resolve(__dirname, '..', '..', '.vibe', 'lifecycle', 'auto-maintain')
    );
    const fs = require('fs');
    const harnessPath = path.resolve(
      __dirname,
      '..',
      '..',
      '.vibe',
      'telemetry',
      'harness-results.json'
    );
    let harnessData = { lastResults: [] };
    try {
      harnessData = JSON.parse(fs.readFileSync(harnessPath, 'utf8'));
    } catch (e) {
      /* not found */
    }
    const telemetryPath = path.resolve(__dirname, '..', '..', '.vibe', 'telemetry', 'sessions');
    let telemetry = { recent_commits: [], total_sessions: 0 };
    if (fs.existsSync(telemetryPath)) {
      const sessions = fs
        .readdirSync(telemetryPath)
        .filter(f => f.endsWith('.json'))
        .sort();
      telemetry.total_sessions = sessions.length;
      if (sessions.length > 0) {
        try {
          const latest = JSON.parse(
            fs.readFileSync(path.join(telemetryPath, sessions[sessions.length - 1]), 'utf8')
          );
          if (latest.meta) {
            telemetry = { ...telemetry, ...latest.meta, total_sessions: sessions.length };
          }
        } catch {
          /* degrade */
        }
      }
    }
    const retro = runRetro(harnessData.lastResults || [], telemetry);

    console.log(`  Assessment:  ${retro.assessment || '(not generated)'}`);
    if (retro.harness_summary) {
      const pr = retro.harness_summary.pass_rate;
      console.log(
        `  Pass rate:   ${pr !== null && pr !== undefined ? pr : 'no data — run: vibe harness'}`
      );
      console.log(`  Failures:    ${retro.harness_summary.failures || 0}`);
    }
    if (retro.telemetry) {
      const sessionCount = retro.telemetry.total_sessions || 0;
      const sessionLabel =
        sessionCount > 0 ? sessionCount : '0 (run auto-maintain to generate session data)';
      console.log(`  Sessions:    ${sessionLabel}`);
      console.log(`  Commits:     ${(retro.telemetry.recent_commits || []).length}`);
    }
    if (retro.notes) {
      const notes = Array.isArray(retro.notes) ? retro.notes : [String(retro.notes)];
      console.log(`  Notes:       ${notes.join(' ')}`);
    }

    console.log('\n  \x1b[2mRetro saved. Run /vibe:learn to capture patterns.\x1b[0m\n');
    return { status: 'ok', retro };
  } catch (e) {
    console.error(`  [retro] ERROR: ${e.message}`);
    return { status: 'error', error: e.message };
  }
};

module.exports = { handler };
