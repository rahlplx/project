const path = require('path');
const fs = require('fs');
const { readState, getProjectInfo } = require('./state-helpers');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:resume \u2014 Session Recovery \u2550\u2550\u2550\n');

  state = state || readState();
  if (!state) {
    console.log('  No state.json found. This appears to be a new project.');
    console.log('  Run: npx vibe-stack help');
    return { status: 'new-project' };
  }

  const info = getProjectInfo(state);

  // Find latest handoff
  const handoffDir = path.resolve(__dirname, '..', '..', '.vibe');
  const handoffFile = path.join(handoffDir, 'handoff.md');
  let handoff = null;
  if (fs.existsSync(handoffFile)) {
    try {
      handoff = JSON.parse(fs.readFileSync(handoffFile, 'utf8'));
    } catch {
      handoff = { content: fs.readFileSync(handoffFile, 'utf8').slice(0, 200) + '...' };
    }
  }

  console.log(`  Project:     ${info.project}`);
  console.log(`  Phase:       ${info.phase} (step ${info.step})`);
  console.log(`  Mode:        ${info.mode}`);
  console.log(`  Milestones:  ${info.completed} completed`);
  console.log(`  Pipeline:    ${info.stateMachine.join(' \u2192 ')}`);

  if (handoff) {
    console.log('\n  \x1b[1mLast handoff found:\x1b[0m');
    if (handoff.metadata) {
      console.log(`  From: ${handoff.metadata.from} \u2192 To: ${handoff.metadata.to}`);
      console.log(`  Phase: ${handoff.metadata.phase}`);
    }
    if (handoff.content) {
      const preview = handoff.content.replace(/```/g, '').split('\n').slice(0, 10).join('\n');
      console.log(`\n  ${preview}`);
    }
  }

  // Suggest next command
  const phaseOrder = [
    'think',
    'plan',
    'break',
    'build',
    'harness',
    'review',
    'ship',
    'retro',
    'learn',
    'evolve',
  ];
  const idx = phaseOrder.indexOf(info.phase);
  const nextPhase = idx >= 0 && idx < phaseOrder.length - 1 ? phaseOrder[idx + 1] : null;

  if (nextPhase) {
    console.log(`\n  \x1b[1mSuggested next:\x1b[0m npx vibe-stack ${nextPhase}`);
  } else if (info.phase === 'done') {
    console.log('\n  \x1b[1mProject complete.\x1b[0m Run npx vibe-stack auto to restart pipeline.');
  }

  console.log();
  return { status: 'ok', info, handoff: !!handoff, nextPhase };
};

module.exports = { handler };
