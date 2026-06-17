const {
  readState,
  writeState,
  recordTelemetry,
  writeHandoff,
  PHASE_ORDER,
} = require('./state-helpers');
const { getCommand } = require('./index');

const handler = async (args, state) => {
  console.log(
    '\n  \u2550\u2550\u2550 /vibe:auto \u2014 Full Pipeline State Machine \u2550\u2550\u2550\n'
  );

  state = state || readState();
  if (!state) {
    console.log('  No state.json found. Run npx vibe-stack init first.');
    return { status: 'error' };
  }

  const pipelineGoal = args[0] || state.goal || 'Complete project pipeline';
  let failures = 0;
  const maxFailures = 3;

  state.goal = pipelineGoal;
  state.auto_pipeline = state.auto_pipeline || {};
  state.auto_pipeline.started = new Date().toISOString();
  state.auto_pipeline.goal = pipelineGoal;
  state.auto_pipeline.state_machine = PHASE_ORDER;
  state.mode = 'auto';

  // Use PHASE_ORDER directly — this matches registered command names
  for (const phase of PHASE_ORDER) {
    if (phase === 'done') {
      state.phase = 'done';
      writeState(state);
      console.log(`  \u2713 Pipeline complete. Final phase: ${phase}`);
      break;
    }

    const cmd = getCommand(phase);
    if (!cmd || !cmd.handler) {
      console.log(`  \u2192 ${phase}: no handler, skipping`);
      continue;
    }

    console.log(`\n  \x1b[1m\u25b6 ${phase}\x1b[0m`);
    recordTelemetry(`auto:${phase}`);

    try {
      const result = cmd.handler.handler([], state);

      // Handle both sync and async results
      const resolved = result && typeof result.then === 'function' ? await result : result;

      if (resolved && resolved.status === 'error') {
        failures++;
        console.log(`  \u2717 ${phase} failed (${failures}/${maxFailures})`);
        if (failures >= maxFailures) {
          console.log(`\n  \u26a0 Circuit breaker: ${maxFailures} consecutive failures. Stopping.`);
          break;
        }
      } else {
        failures = 0; // reset on success
        state.phase = phase;
        state.step = (state.step || 0) + 1;
        if (!state.completed) state.completed = [];
        if (!state.completed.includes(`auto-${phase}`)) {
          state.completed.push(`auto-${phase}`);
        }
        state.updated = new Date().toISOString();
        writeState(state);

        // Write handoff between major layers
        writeHandoff('vibe-auto', 'next-agent', phase, {
          state: `${phase} phase completed via auto pipeline`,
          phase,
          goal: pipelineGoal,
          task: phase,
          files: [],
          need: 'Proceed to next phase in pipeline',
        });
        console.log(`  \u2713 ${phase} complete`);
      }
    } catch (e) {
      failures++;
      console.log(`  \u2717 ${phase} error: ${e.message}`);
      if (failures >= maxFailures) {
        console.log(`\n  \u26a0 Circuit breaker: ${maxFailures} consecutive failures. Stopping.`);
        break;
      }
    }
  }

  console.log(
    `\n  \u2550\u2550\u2550 Pipeline ${failures === 0 ? 'complete' : 'interrupted'} \u2550\u2550\u2550\n`
  );
  return { status: failures === 0 ? 'ok' : 'interrupted', failures };
};

module.exports = { handler };
