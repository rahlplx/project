const fs = require('fs');
const path = require('path');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:build \u2014 TDD Implementation \u2550\u2550\u2550\n');

  const breakdownPath = path.resolve(__dirname, '..', '..', '.gsd', 'breakdown.md');
  let tasks = [];
  if (fs.existsSync(breakdownPath)) {
    const content = fs.readFileSync(breakdownPath, 'utf8');
    const taskLines = content.split('\n').filter(l => /^\s*[-*]\s*\[.?\]/.test(l));
    tasks = taskLines.map(l => l.replace(/^\s*[-*]\s*/, '').trim());
  }

  const taskFilter = args[0];
  if (taskFilter) {
    console.log(`  Task: ${taskFilter}\n`);
  } else if (tasks.length > 0) {
    console.log(`  Tasks from breakdown.md (${tasks.length} total):\n`);
    for (let i = 0; i < Math.min(tasks.length, 10); i++) {
      console.log(`    ${i + 1}. ${tasks[i]}`);
    }
    if (tasks.length > 10) console.log(`    ... and ${tasks.length - 10} more`);
    console.log();
  }

  console.log('  Method: RED \u2192 GREEN \u2192 REFACTOR \u2192 VERIFY per task');
  console.log('  Subagents dispatched with --non-interactive flags');
  console.log('\n  Usage: npx vibe-stack build [task-name]');
  console.log('  Without task-name, iterates all pending tasks from .gsd/breakdown.md');

  console.log('\n  \u2550\u2550\u2550 AI AGENT PROMPT \u2550\u2550\u2550\n');
  console.log('  For each task:');
  console.log('  1. RED: Write failing test first');
  console.log('  2. GREEN: Write minimal code to pass');
  console.log('  3. REFACTOR: Clean up, check types');
  console.log('  4. VERIFY: Run tests, commit');
  console.log('\n  TDD is MANDATORY. No production code without a failing test first.');
  console.log('  After all tasks done, run: npx vibe-stack harness');
  console.log('  \x1b[2mRequires AI agent to dispatch subagents. Run in Codex/OpenCode for TDD loop.\x1b[0m\n');
  return { status: 'reference' };
};

module.exports = { handler };
