const path = require('path');
const { execSync } = require('child_process');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:ship \u2014 Release Engineering \u2550\u2550\u2550\n');

  const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

  try {
    // Step 1: Check git status
    console.log('  [1/5] Checking git status...');
    const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT, timeout: 10000, encoding: 'utf8' }).trim();
    if (status) {
      console.log(`  ${status.split('\n').length} uncommitted files`);
    } else {
      console.log('  Working tree clean');
    }

    // Step 2: Run tests
    console.log('  [2/5] Running test suite...');
    try {
      execSync('npm test', { cwd: PROJECT_ROOT, timeout: 120000, encoding: 'utf8', stdio: 'pipe' });
      console.log('  Tests passed');
    } catch (e) {
      console.log('  Tests failed — run npx vibe-stack harness to diagnose');
      return { status: 'tests-failed' };
    }

    // Step 3: Version check
    console.log('  [3/5] Version info...');
    const pkg = JSON.parse(require('fs').readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
    console.log(`  Current: ${pkg.version}`);

    // Step 4: Git operations (dry run by default)
    console.log('  [4/5] Git operations (dry run)...');
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: PROJECT_ROOT, timeout: 5000, encoding: 'utf8' }).trim();
    console.log(`  Branch: ${branch}`);
    console.log('  Use --push to actually commit and push');

    // Step 5: Summary
    console.log('  [5/5] Ship summary');
    console.log(`  Branch:   ${branch}`);
    console.log(`  Version:  ${pkg.version}`);
    console.log(`  Project:  ${state?.project || path.basename(PROJECT_ROOT)}`);

    // If --push flag provided, commit and push
    if (args.includes('--push') || args.includes('-p')) {
      console.log('\n  [push] Committing and pushing...');
      execSync('git add -A', { cwd: PROJECT_ROOT, timeout: 10000 });
      execSync('git commit -m "chore: ship via vibe-stack pipeline"', { cwd: PROJECT_ROOT, timeout: 10000 });
      const upstream = execSync('git rev-parse --abbrev-ref HEAD@{upstream}', { cwd: PROJECT_ROOT, timeout: 5000, encoding: 'utf8' }).trim();
      execSync(`git push ${upstream ? '' : '--set-upstream origin ' + branch}`, { cwd: PROJECT_ROOT, timeout: 30000 });
      console.log('  Pushed successfully');
    }

    console.log('\n  \x1b[2mTip: Use --push to execute git add + commit + push.\x1b[0m\n');
    return { status: 'ok', branch, version: pkg.version };

  } catch (e) {
    console.error(`  [ship] ERROR: ${e.message}`);
    return { status: 'error', error: e.message };
  }
};

module.exports = { handler };
