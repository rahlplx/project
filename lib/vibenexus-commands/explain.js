'use strict';
const { captureIntent } = require('../intent-capture');

const handler = (args, state) => {
  console.log('\n  ═══ /vibe:explain — Capture Intent & Generate PROJECT.md + PRD.md ═══\n');

  // Collect non-flag args as the input text
  const inputText = (args || [])
    .filter(a => !a.startsWith('--'))
    .join(' ')
    .trim();

  const projectName = inputText || (state && state.goal) || 'Untitled Project';

  let result;
  try {
    result = captureIntent({ projectName });
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    console.error(`  [explain] Error capturing intent: ${message}`);
    return { status: 'error', message };
  }

  console.log('  ─── PROJECT.md ───\n');
  console.log(
    result.projectMd
      .split('\n')
      .map(l => `  ${l}`)
      .join('\n')
  );

  console.log('\n  ─── PRD.md ───\n');
  console.log(
    result.prdMd
      .split('\n')
      .map(l => `  ${l}`)
      .join('\n')
  );

  console.log(`\n  Project type detected: ${result.projectType}`);
  console.log(
    `  Defaults applied — tech stack: ${result.defaults.techStack}, timeline: ${result.defaults.timeline}\n`
  );

  return { status: 'ok', result };
};

module.exports = { handler };
