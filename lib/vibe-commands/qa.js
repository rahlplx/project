const path = require('path');
const { spawnSync } = require('child_process');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:qa \u2014 Pipeline E2E Audit \u2550\u2550\u2550\n');

  const projectRoot = path.resolve(__dirname, '..', '..');
  const e2eRunner = path.join(projectRoot, 'scripts', 'e2e', 'user-flow.js');

  console.log('  Audit: Analyzing full infrastructure, data flow, and pipeline integrity...');

  const result = spawnSync(process.execPath, [e2eRunner], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.status === 0) {
    console.log('  ✅ E2E Audit Success: Pipeline is 100% robust.');
    return { status: 'pass' };
  } else {
    console.error('  ❌ E2E Audit Failed: Vulnerability or break detected in data flow.');
    return { status: 'fail', exitCode: 1 };
  }
};

module.exports = { handler };
