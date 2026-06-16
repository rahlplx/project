const { getCommand } = require('./index');
const { recordTelemetry, readState } = require('./state-helpers');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:quick \u2014 Compressed Workflow \u2550\u2550\u2550\n');
  console.log('  Runs: harness \u2192 review \u2192 ship \u2192 retro');
  console.log('  Skips think/plan/break/build for small changes.\n');

  state = state || readState();
  const results = {};

  for (const phase of ['harness', 'review', 'ship', 'retro']) {
    const cmd = getCommand(phase);
    if (!cmd || !cmd.handler) {
      console.log(`  Skipping ${phase} (no handler)`);
      continue;
    }

    recordTelemetry(`quick:${phase}`);
    try {
      const result = cmd.handler.handler(args, state);
      results[phase] = result?.status || 'ok';
    } catch (e) {
      results[phase] = 'error';
      console.log(`  \u2717 ${phase} error: ${e.message}`);
    }
  }

  const allOk = Object.values(results).every(s => s === 'ok' || s === 'pass' || s === 'reference');
  console.log(`  \u2550\u2550\u2550 Quick workflow ${allOk ? 'complete' : 'had issues'} \u2550\u2550\u2550\n`);
  return { status: allOk ? 'ok' : 'partial', results };
};

module.exports = { handler };
