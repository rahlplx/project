const { getProjectInfo, readState } = require('./state-helpers');

const handler = (args, state) => {
  state = state || readState();
  const info = getProjectInfo(state);

  console.log('\n  \x1b[1m=== vibe-stack Status ===\x1b[0m\n');
  console.log(`  Project:     ${info.project}`);
  console.log(`  Version:     ${info.version}`);
  console.log(`  Phase:       ${info.phase} (step ${info.step})`);
  console.log(`  Mode:        ${info.mode}`);
  console.log(`  Agent:       ${info.agent}`);
  console.log(`  Milestones:  ${info.completed} completed`);
  console.log(`  Maintenance: #${info.maintenance}`);
  console.log('\n  \x1b[1mInfrastructure:\x1b[0m');
  console.log(`  Skills:      ${info.skills}`);
  console.log(`  Tools:       ${info.tools}`);
  console.log(`  Tests:       ${info.tests}`);
  console.log(`  Harness:     ${info.harnessChecks} checks`);
  console.log(`  Pipeline:    ${info.stateMachine.join(' \u2192 ')}`);

  if (state.lifecycle) {
    const lastMaint = state.lifecycle.last_maintenance
      ? new Date(state.lifecycle.last_maintenance).toLocaleString()
      : 'never';
    console.log(`\n  Last maint:  ${lastMaint}`);
  }

  console.log();
  return { status: 'ok', info };
};

module.exports = { handler };
