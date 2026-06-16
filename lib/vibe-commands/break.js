const path = require('path');
const fs = require('fs');

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
  console.log('  \x1b[2mTip: Each task should be completable in one context window.\x1b[0m\n');
  return { status: 'reference' };
};

module.exports = { handler };
