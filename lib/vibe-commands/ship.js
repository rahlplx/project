const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const SecurityAudit = require('../../skills/quality/security-audit/index');
const GSDWorkflow = require('../../skills/orchestration/gsd-workflow/index');

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

    // Step 2.5: Security scan
    console.log('  [2.5/5] Running security scan...');
    const secAudit = new SecurityAudit();
    const scanDirs = ['src', 'lib', 'bin'].map(d => path.join(PROJECT_ROOT, d)).filter(d => {
      try { return fs.statSync(d).isDirectory(); } catch { return false; }
    });

    let totalIssues = 0;
    const criticalIssues = [];
    const scannedFiles = [];

    function walkJs(dir, limit = 30) {
      if (scannedFiles.length >= limit) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (scannedFiles.length >= limit) break;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !['node_modules', '.git', '.vibe', '.gsd'].includes(entry.name)) {
          walkJs(full, limit);
        } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.test.js')) {
          scannedFiles.push(full);
        }
      }
    }
    scanDirs.forEach(d => walkJs(d));

    for (const file of scannedFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const result = secAudit.scanCode(content);
      totalIssues += result.issuesFound;
      for (const issue of result.issues) {
        if (issue.severity === 'critical') {
          criticalIssues.push({ file: path.relative(PROJECT_ROOT, file), ...issue });
        }
      }
    }

    if (criticalIssues.length) {
      console.log(`  \x1b[31m✖ SECURITY: ${criticalIssues.length} critical issue(s) found — fix before shipping\x1b[0m`);
      criticalIssues.forEach(i => console.log(`    [${i.id}] ${i.message} — ${i.file}`));
      return { status: 'security-blocked', criticalIssues };
    } else if (totalIssues > 0) {
      console.log(`  \x1b[33m⚠  Security: ${totalIssues} warning(s) — review before shipping\x1b[0m`);
    } else {
      console.log(`  Security clean (${scannedFiles.length} files scanned)`);
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

    // Step 4.5: GSD milestone audit
    console.log('  [4.5/5] GSD milestone audit...');
    const gsd = new GSDWorkflow();
    const shipNext = gsd.nextCommand('ship', { verified: true, shipped: false });
    console.log(`  GSD ship sequence: ${gsd.getStage('ship').commands.join(' → ')}`);
    console.log(`  Next GSD command: ${shipNext}`);

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
