const path = require('path');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:evolve \u2014 Rule Evolution \u2550\u2550\u2550\n');
  try {
    const { runEvolve } = require(path.resolve(__dirname, '..', '..', '.vibe', 'lifecycle', 'auto-maintain'));
    const learnResult = { low_quality_rules: [], telemetry_gaps: [], uncaptured_solutions: [], telemetry_insights: [] };
    const proposals = runEvolve(learnResult);
    console.log(`  ${proposals.length} proposals generated`);
    for (const p of proposals) {
      console.log(`    ${p.action}: ${p.rule || p.detail}`);
    }
    return { status: 'ok', proposals };
  } catch (e) {
    console.error(`  [evolve] ERROR: ${e.message}`);
    return { status: 'error', error: e.message };
  }
};

module.exports = { handler };
