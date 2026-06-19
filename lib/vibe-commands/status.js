const { getProjectInfo, readState } = require('./state-helpers');
const { StateMachine, RoleLoader } = require('../orchestrator');

const handler = (args, state) => {
  state = state || readState();
  const info = getProjectInfo(state);

  const stateMachine = new StateMachine();
  const layer = stateMachine.getLayerForPhase(info.phase);
  const roles = new RoleLoader().getRolesForPhase(info.phase);

  console.log('\n  \x1b[1m=== vibe-stack Status ===\x1b[0m\n');
  console.log(`  Project:     ${info.project}`);
  console.log(`  Version:     ${info.version}`);
  console.log(
    `  Phase:       ${info.phase} (step ${info.step})${layer ? ` [${layer.name} layer]` : ''}`
  );
  console.log(`  Team:        ${roles.length ? roles.join(', ') : 'none for this phase'}`);
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

  // M3: Telemetry health indicator — shows writesFailed counter from otel-tracer.
  // Gracefully handles the case where M1 (Bug #2 fix) isn't merged yet.
  let telemetryStatus = 'N/A';
  try {
    const { getTelemetryStats } = require('../telemetry/otel-tracer');
    if (typeof getTelemetryStats === 'function') {
      const stats = getTelemetryStats();
      if (stats.writesFailed === 0) {
        telemetryStatus = `\x1b[32m\u2713 healthy\x1b[0m (${stats.bufferedSpans} buffered)`;
      } else {
        telemetryStatus = `\x1b[33m\u26a0 ${stats.writesFailed} write failures\x1b[0m`;
      }
    }
  } catch {
    // M1 not merged yet — otel-tracer doesn't export getTelemetryStats
    telemetryStatus = 'N/A (M1 not merged)';
  }
  console.log(`  Telemetry:   ${telemetryStatus}`);

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
