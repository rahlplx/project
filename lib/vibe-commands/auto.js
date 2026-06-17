const {
  readState,
  writeState,
  recordTelemetry,
  writeHandoff,
  PHASE_ORDER,
} = require('./state-helpers');
const { getCommand } = require('./index');

// Categorize errors: transient errors may be retried; fatal errors stop immediately
function categorizeError(e) {
  const msg = (e.message || '').toLowerCase();
  if (msg.includes('enoent') || msg.includes('cannot find module')) {
    return 'fatal';
  }
  if (msg.includes('timeout') || msg.includes('econnreset') || msg.includes('enotfound')) {
    return 'transient';
  }
  return 'transient';
}

const handler = async (args, state) => {
  console.log('\n  ═══ /vibe:auto — Full Pipeline State Machine ═══\n');

  state = state || readState();
  if (!state) {
    console.log('  No state.json found. Run npx vibe-stack init first.');
    return { status: 'error' };
  }

  const pipelineGoal = args[0] || state.goal || 'Complete project pipeline';
  const fromPhase = args.find(a => a.startsWith('--from='))?.slice(7);
  let failures = 0;
  const maxFailures = 3;
  let failedPhase = null;

  state.goal = pipelineGoal;
  state.auto_pipeline = state.auto_pipeline || {};
  state.auto_pipeline.started = new Date().toISOString();
  state.auto_pipeline.goal = pipelineGoal;
  state.auto_pipeline.state_machine = PHASE_ORDER;
  state.auto_pipeline.failed_at_phase = null;
  state.mode = 'auto';

  let skipping = !!fromPhase;

  for (const phase of PHASE_ORDER) {
    // --from=<phase>: skip phases until we reach the resume point
    if (skipping) {
      if (phase === fromPhase) skipping = false;
      else continue;
    }

    if (phase === 'done') {
      state.phase = 'done';
      writeState(state);
      console.log(`  ✓ Pipeline complete. Final phase: ${phase}`);
      break;
    }

    const cmd = getCommand(phase);
    if (!cmd || !cmd.handler) {
      console.log(`  → ${phase}: no handler, skipping`);
      continue;
    }

    console.log(`\n  \x1b[1m▶ ${phase}\x1b[0m`);
    recordTelemetry(`auto:${phase}`);
    const phaseStart = Date.now();

    try {
      const result = cmd.handler.handler([], state);
      const resolved = result && typeof result.then === 'function' ? await result : result;
      const elapsed = Date.now() - phaseStart;

      if (resolved && resolved.status === 'error') {
        failures++;
        failedPhase = phase;
        console.log(`  ✗ ${phase} failed in ${elapsed}ms (${failures}/${maxFailures})`);
        if (failures >= maxFailures) {
          console.log(`\n  ⚠ Circuit breaker: ${maxFailures} failures. Stopping at '${phase}'.`);
          console.log(`  Resume with: node bin/vibe.js auto --from=${phase}`);
          break;
        }
      } else {
        failures = 0;
        state.phase = phase;
        state.step = (state.step || 0) + 1;
        if (!state.completed) state.completed = [];
        if (!state.completed.includes(`auto-${phase}`)) state.completed.push(`auto-${phase}`);
        state.updated = new Date().toISOString();
        writeState(state);

        writeHandoff('vibe-auto', 'next-agent', phase, {
          state: `${phase} phase completed via auto pipeline`,
          phase,
          goal: pipelineGoal,
          task: phase,
          files: [],
          need: 'Proceed to next phase in pipeline',
        });
        console.log(`  ✓ ${phase} complete (${elapsed}ms)`);
      }
    } catch (e) {
      const kind = categorizeError(e);
      failures++;
      failedPhase = phase;
      console.log(`  ✗ ${phase} ${kind} error: ${e.message}`);
      if (kind === 'fatal' || failures >= maxFailures) {
        console.log(
          `\n  ⚠ Stopping at '${phase}' (${kind}). Resume: node bin/vibe.js auto --from=${phase}`
        );
        break;
      }
    }
  }

  // Persist failed phase so retro/status can report it
  if (failedPhase) {
    const s = readState();
    if (s) {
      s.auto_pipeline = s.auto_pipeline || {};
      s.auto_pipeline.failed_at_phase = failedPhase;
      writeState(s);
    }
  }

  const ok = failures === 0 && !failedPhase;
  console.log(`\n  ═══ Pipeline ${ok ? 'complete' : 'interrupted'} ═══\n`);
  return { status: ok ? 'ok' : 'interrupted', failures, failedPhase };
};

module.exports = { handler };
