const path = require('path');
const fs = require('fs');
const GSDWorkflow = require('../../skills/orchestration/gsd-workflow/index');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:break \u2014 Milestone \u2192 Task Decomposition \u2550\u2550\u2550\n');

  const refPath = path.resolve(__dirname, '..', '..', 'references', 'vibe-break.md');
  if (fs.existsSync(refPath)) {
    const content = fs.readFileSync(refPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim()).slice(0, 15);
    console.log('  \x1b[1mReference:\x1b[0m\n');
    for (const line of lines) console.log(`  ${line.trim()}`);
  } else {
    console.log('  1. Identify milestones from plan');
    console.log('  2. Slice each milestone into vertical tasks');
    console.log('  3. Size each task (S/M/L/XL)');
    console.log('  4. Assign order and dependencies');
    console.log('  5. Write .gsd/breakdown.md');
  }

  // \u2500\u2500 GSD Protocol \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const gsd = new GSDWorkflow();
  const nextCmd = gsd.nextCommand('define', {
    requirementsLocked: !!(state?.goal),
    hasUI: !!(state?.stack?.has_ui),
    designContractApproved: false
  });
  console.log('  \x1b[1mGSD Protocol (Define \u2192 Build \u2192 Ship):\x1b[0m\n');
  for (const stage of gsd.getStages()) {
    console.log(`  \x1b[1m${stage.name.toUpperCase()}\x1b[0m \u2014 ${stage.description}`);
    console.log(`    Commands: ${stage.commands.join(' \u2192 ')}`);
  }
  console.log(`\n  \x1b[33m\u25b6 Next GSD command: ${nextCmd}\x1b[0m`);

  const atomicChecks = gsd.validateAtomicCommit({}).missing;
  if (atomicChecks.length) {
    console.log('\n  \x1b[1mAtomic-commit checklist (required per task):\x1b[0m');
    atomicChecks.forEach(m => console.log(`    \u25cb ${m}`));
  }

  console.log('\n  \u2550\u2550\u2550 AI AGENT PROMPT \u2550\u2550\u2550\n');
  console.log('  Break the approved plan into independently-buildable tasks:');
  console.log('  1. What are the main milestones?');
  console.log('  2. For each milestone, what are the vertical-slice tasks?');
  console.log('  3. What is the dependency order?');
  console.log('  4. Size each task (S < 1hr, M < 4hr, L < 8hr, XL > 8hr)');
  console.log('\n  Output: .gsd/breakdown.md');
  if (state?.stack?.has_ui) {
    console.log('  Parallel: run npx vibe-stack design for UI generation');
  }
  console.log('  After break, run: npx vibe-stack build');
  console.log('  \x1b[2mTip: Each task must satisfy the atomic-commit checklist above.\x1b[0m\n');
  return { status: 'reference', gsdNextCommand: nextCmd };
};

module.exports = { handler };
