const path = require('path');
const fs = require('fs');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:think \u2014 Problem Definition & Strategy \u2550\u2550\u2550\n');

  const refPath = path.resolve(__dirname, '..', '..', 'references', 'vibe-think.md');
  if (fs.existsSync(refPath)) {
    const ref = fs.readFileSync(refPath, 'utf8');
    const steps = ref.split(/^### /m).filter(s => s.trim());
    console.log('  \x1b[1mReference Steps:\x1b[0m\n');
    for (const step of steps) {
      const header = step.split('\n')[0].trim();
      console.log(`  \x1b[1m\u25b6 ${header}\x1b[0m`);
      const body = step.split('\n').slice(1).join('\n').trim();
      const lines = body.split('\n').filter(l => l.trim()).slice(0, 3);
      for (const line of lines) {
        console.log(`    ${line.trim()}`);
      }
      console.log();
    }
  }

  console.log('  \u2550\u2550\u2550 AI AGENT PROMPT \u2550\u2550\u2550\n');
  console.log('  Guide the user through these questions:');
  console.log('  1. What problem are you solving? Who are the users?');
  console.log('  2. What is the MVP scope? What is out of scope?');
  console.log('  3. How will you measure success? (metrics/KPIs)');
  console.log('  4. What are the risks or open questions?');
  console.log('\n  After user answers, run: npx vibe-stack plan');
  console.log('  \x1b[2mTip: Ask one question at a time. Keep the user focused.\x1b[0m\n');
  return { status: 'reference' };
};

module.exports = { handler };
