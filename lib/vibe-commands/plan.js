const path = require('path');
const fs = require('fs');
const { StrategyEngine } = require('../gstack/strategy-engine');

const handler = (args, state) => {
  console.log(
    '\n  \u2550\u2550\u2550 /vibe:plan \u2014 Multi-Perspective Review \u2550\u2550\u2550\n'
  );

  const refPath = path.resolve(__dirname, '..', '..', 'references', 'vibe-plan.md');
  if (fs.existsSync(refPath)) {
    const ref = fs.readFileSync(refPath, 'utf8');
    const steps = ref.split(/^### /m).filter(s => s.trim());
    console.log('  \x1b[1mReference Steps:\x1b[0m\n');
    for (const step of steps) {
      const header = step.split('\n')[0].trim();
      console.log(`  \x1b[1m\u25b6 ${header}\x1b[0m`);
      const lines = step
        .split('\n')
        .slice(1)
        .filter(l => l.trim())
        .slice(0, 3);
      for (const line of lines) console.log(`    ${line.trim()}`);
      console.log();
    }
  }

  const strategyEngine = new StrategyEngine();
  const mode = strategyEngine.recommendMode(state.projectType);

  console.log('  \u2550\u2550\u2550 AI AGENT PROMPT \u2550\u2550\u2550\n');
  console.log('  Review the think output with the user from 3 perspectives (gstack):');
  console.log(
    '  1. CEO: Does this solve a real problem? Is the scope right? (StrategyEngine.ceoReview)'
  );
  console.log(
    '  2. Engineer: Is the approach technically sound? Any risks? (StrategyEngine.engineerReview)'
  );
  console.log('  3. Designer: Is the UX considered? Edge cases? (StrategyEngine.designReview)');
  console.log(`\n  Recommended review mode: ${mode.name} \u2014 ${mode.posture}`);
  console.log('\n  Output: plans/<name>.md with acceptance criteria.');
  console.log('  After user approves, run: npx vibe-stack break');
  console.log('  \x1b[2mTip: Present one perspective at a time.\x1b[0m\n');
  return { status: 'reference', mode: mode.name };
};

module.exports = { handler };
