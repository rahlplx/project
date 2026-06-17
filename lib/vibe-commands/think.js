const path = require('path');
const fs = require('fs');
const { Grill } = require('../orchestrator/grill');
const { SkillRouter } = require('../orchestrator/skill-router');
const { ContextManager } = require('../orchestrator/context-manager');

const handler = (args, state) => {
  console.log(
    '\n  \u2550\u2550\u2550 /vibe:think \u2014 Problem Definition & Strategy \u2550\u2550\u2550\n'
  );

  // \u2500\u2500 Grill Gate: clarify before thinking starts \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const request = (args || []).join(' ').trim();
  const grill = new Grill();
  const grillResult = grill.grill(request || state?.goal || '');

  if (grillResult.needsGrilling) {
    console.log(
      '  \x1b[33m\u26a1 GRILL GATE \u2014 Request needs clarification before planning\x1b[0m\n'
    );
    if (grillResult.questions.length) {
      console.log('  Ask these questions first (one at a time):\n');
      grillResult.questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
    }
    console.log(
      '\n  \x1b[2mOnce the user answers, re-run think with their full description.\x1b[0m'
    );
    console.log(
      '  \x1b[2mExample: npx vibe-stack think "build a SaaS tool for X that does Y"\x1b[0m\n'
    );
  }

  const refPath = path.resolve(__dirname, '..', '..', 'references', 'vibe-think.md');
  if (fs.existsSync(refPath)) {
    const ref = fs.readFileSync(refPath, 'utf8');
    const steps = ref.split(/^### /m).filter(s => s.trim());
    console.log('  \x1b[1mReference Steps:\x1b[0m\n');
    for (const step of steps) {
      const header = step.split('\n')[0].trim();
      console.log(`  \x1b[1m\u25b6 ${header}\x1b[0m`);
      const body = step.split('\n').slice(1).join('\n').trim();
      const lines = body
        .split('\n')
        .filter(l => l.trim())
        .slice(0, 3);
      for (const line of lines) {
        console.log(`    ${line.trim()}`);
      }
      console.log();
    }
  }

  // \u2500\u2500 Skill Router: auto-suggest which skills to activate \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const routeResult = new SkillRouter().route(request || state?.goal || '');
  if (routeResult.skills[0] !== 'vibe') {
    console.log(
      `  \x1b[1mRecommended skills:\x1b[0m ${routeResult.skills.map(s => `/${s}`).join(', ')}`
    );
    console.log(`  \x1b[2m${routeResult.reason}\x1b[0m\n`);
  }

  // \u2500\u2500 Goal Block: durable resume point after memory reset \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  new ContextManager().writeGoalBlock('think', request || state?.goal || 'define project');

  console.log('  \u2550\u2550\u2550 AI AGENT PROMPT \u2550\u2550\u2550\n');
  console.log('  Guide the user through these questions:');
  console.log('  1. What problem are you solving? Who are the users?');
  console.log('  2. What is the MVP scope? What is out of scope?');
  console.log('  3. How will you measure success? (metrics/KPIs)');
  console.log('  4. What are the risks or open questions?');
  console.log('\n  After user answers, run: npx vibe-stack plan');
  console.log('  \x1b[2mTip: Ask one question at a time. Keep the user focused.\x1b[0m\n');
  return { status: 'reference', grillFired: grillResult.needsGrilling };
};

module.exports = { handler };
