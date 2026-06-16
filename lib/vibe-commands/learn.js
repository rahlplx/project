const path = require('path');
const { execFileSync } = require('child_process');
const { extract: gitLearnings } = require('../knowledge/git-learnings');

const handler = (args, state) => {
  const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
  const subcommand = args[0];

  // Delegate to vibe-learn-capture.js for "capture" subcommand
  if (subcommand === 'capture') {
    try {
      const learnCapture = path.join(PROJECT_ROOT, '.vibe', 'lifecycle', 'vibe-learn-capture.js');
      const result = execFileSync(process.execPath, [learnCapture, ...args.slice(1)], {
        cwd: PROJECT_ROOT, timeout: 30000, encoding: 'utf8', stdio: 'inherit'
      });
      return { status: 'ok' };
    } catch (e) {
      console.error(`  [learn] capture error: ${e.message}`);
      return { status: 'error', error: e.message };
    }
  }

  // Full learn scan (pattern extraction + quality check)
  console.log('\n  \u2550\u2550\u2550 /vibe:learn \u2014 Self-Improvement \u2550\u2550\u2550\n');

  // \u2500\u2500 Git history learnings \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const gl = gitLearnings(PROJECT_ROOT);
  if (!gl.error) {
    console.log('  \x1b[1mGit history analysis:\x1b[0m');
    const types = Object.entries(gl.commitTypes).sort((a, b) => b[1] - a[1]);
    if (types.length) console.log(`  Commit types: ${types.map(([t, n]) => `${t}(${n})`).join(', ')}`);
    if (gl.topChangedFiles.length) {
      console.log(`  Most-changed files: ${gl.topChangedFiles.slice(0, 3).map(f => f.file).join(', ')}`);
    }
    if (gl.velocity) console.log(`  Velocity: ${gl.velocity.commitsLast7Days} commits in last 7 days`);
    if (gl.antiPatterns.length) {
      console.log('\n  \x1b[33m\u26a0  Anti-patterns detected:\x1b[0m');
      gl.antiPatterns.forEach(p => console.log(`    \u2014 ${p}`));
    }
    console.log();
  }
  try {
    const { runLearn } = require(path.resolve(PROJECT_ROOT, '.vibe', 'lifecycle', 'auto-maintain'));
    const learnResult = runLearn({}, []);
    console.log(`\n  Patterns: ${learnResult.pattern_count} | Anti-patterns: ${learnResult.anti_pattern_count}`);
    if (learnResult.uncaptured_solutions) {
      console.log(`  Uncaptured solutions: ${learnResult.uncaptured_solutions.length}`);
    }
    return { status: 'ok', learnResult };
  } catch (e) {
    console.error(`  [learn] ERROR: ${e.message}`);
    return { status: 'error', error: e.message };
  }
};

module.exports = { handler };
