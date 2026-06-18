const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const SecurityAudit = require('../../skills/quality/security-audit/index');
const GSDWorkflow = require('../../skills/orchestration/gsd-workflow/index');
const { TrustLevel } = require('../orchestrator/trust-level');
const { scanCode: complexityScan } = require('../quality/complexity-scan');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:ship \u2014 Release Engineering \u2550\u2550\u2550\n');

  const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

  try {
    // Step 1: Check git status
    console.log('  [1/5] Checking git status...');
    const status = execFileSync('git', ['status', '--porcelain'], {
      cwd: PROJECT_ROOT,
      timeout: 10000,
      encoding: 'utf8',
    }).trim();
    if (status) {
      console.log(`  ${status.split('\n').length} uncommitted files`);
    } else {
      console.log('  Working tree clean');
    }

    // Step 2: Run tests
    console.log('  [2/5] Running test suite...');
    try {
      execFileSync('npm', ['test'], {
        cwd: PROJECT_ROOT,
        timeout: 120000,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      console.log('  Tests passed');
    } catch (e) {
      const out = (e.stdout || '') + (e.stderr || '');
      const failLine = out.split('\n').find(l => /# fail|not ok|FAIL/.test(l));
      console.log(`  Tests failed${failLine ? ` — ${failLine.trim()}` : ''}`);
      console.log('  Run: npm test 2>&1 | grep "not ok" for details');
      return { status: 'tests-failed' };
    }

    // Step 2.5: Security scan
    console.log('  [2.5/5] Running security scan...');
    const secAudit = new SecurityAudit();
    const scanDirs = ['src', 'lib', 'bin']
      .map(d => path.join(PROJECT_ROOT, d))
      .filter(d => {
        try {
          return fs.statSync(d).isDirectory();
        } catch {
          return false;
        }
      });

    let totalIssues = 0;
    const criticalIssues = [];
    const scannedFiles = [];

    const walkJs = (dir, limit = 30) => {
      if (scannedFiles.length >= limit) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (scannedFiles.length >= limit) break;
        const full = path.join(dir, entry.name);
        if (
          entry.isDirectory() &&
          !['node_modules', '.git', '.vibe', '.gsd'].includes(entry.name)
        ) {
          walkJs(full, limit);
        } else if (
          entry.isFile() &&
          entry.name.endsWith('.js') &&
          !entry.name.endsWith('.test.js')
        ) {
          scannedFiles.push(full);
        }
      }
    };
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
      console.log(
        `  \x1b[31m✖ SECURITY: ${criticalIssues.length} critical issue(s) found — fix before shipping\x1b[0m`
      );
      criticalIssues.forEach(i => console.log(`    [${i.id}] ${i.message} — ${i.file}`));
      return { status: 'security-blocked', criticalIssues };
    } else if (totalIssues > 0) {
      console.log(
        `  \x1b[33m⚠  Security: ${totalIssues} warning(s) — review before shipping\x1b[0m`
      );
    } else {
      console.log(`  Security clean (${scannedFiles.length} files scanned)`);
    }

    // Step 2.7: Supply-chain audit (npm audit)
    console.log('  [2.7/5] Running supply-chain audit (npm audit)...');
    try {
      const auditJson = execFileSync('npm', ['audit', '--omit=dev', '--json'], {
        cwd: PROJECT_ROOT,
        timeout: 30000,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      const audit = JSON.parse(auditJson);
      const vulns = audit.metadata?.vulnerabilities || {};
      const critical = vulns.critical || 0;
      const high = vulns.high || 0;
      if (critical > 0) {
        console.log(
          `  \x1b[31m✖ SUPPLY CHAIN: ${critical} critical vulnerabilities — run npm audit fix\x1b[0m`
        );
        return { status: 'supply-chain-blocked', critical, high };
      } else if (high > 0) {
        console.log(
          `  \x1b[33m⚠  Supply chain: ${high} high vulnerabilities — review before shipping\x1b[0m`
        );
      } else {
        console.log(
          `  Supply chain clean (${(vulns.moderate || 0) + (vulns.low || 0)} low/moderate)`
        );
      }
    } catch (e) {
      const msg = e.stdout || e.message || '';
      if (msg.includes('"vulnerabilities"')) {
        try {
          const audit = JSON.parse(msg);
          const c = audit.metadata?.vulnerabilities?.critical || 0;
          if (c > 0) {
            console.log(`  \x1b[31m✖ SUPPLY CHAIN: ${c} critical vulnerabilities\x1b[0m`);
            return { status: 'supply-chain-blocked', critical: c };
          }
        } catch {
          /* ignore parse error */
        }
      }
      console.log('  Supply chain: audit unavailable (offline or no package-lock.json)');
    }

    // Step 3: Version check
    console.log('  [3/5] Version info...');
    const pkg = JSON.parse(
      require('fs').readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
    );
    console.log(`  Current: ${pkg.version}`);

    // Step 4: Git operations (dry run by default)
    console.log('  [4/5] Git operations (dry run)...');
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: PROJECT_ROOT,
      timeout: 5000,
      encoding: 'utf8',
    }).trim();
    console.log(`  Branch: ${branch}`);
    console.log('  Use --push to actually commit and push');

    // Step 4.5: GSD milestone audit
    console.log('  [4.5/5] GSD milestone audit...');
    const gsd = new GSDWorkflow();
    const shipNext = gsd.nextCommand('ship', { verified: true, shipped: false });
    console.log(`  GSD ship sequence: ${gsd.getStage('ship').commands.join(' → ')}`);
    console.log(`  Next GSD command: ${shipNext}`);

    // Step 4.8: Complexity gate on changed files
    console.log('  [4.8/5] Complexity scan...');
    const complexityFindings = [];
    for (const file of scannedFiles.slice(0, 15)) {
      const code = fs.readFileSync(file, 'utf8');
      const result = complexityScan(code);
      if (!result.clean) {
        complexityFindings.push(
          ...result.findings.map(f => ({ file: path.relative(PROJECT_ROOT, file), ...f }))
        );
      }
    }
    if (complexityFindings.length) {
      console.log(
        `  \x1b[33m⚠  Complexity: ${complexityFindings.length} function(s) above threshold\x1b[0m`
      );
      complexityFindings
        .slice(0, 3)
        .forEach(f =>
          console.log(`    ${f.file}:${f.line} ${f.name}() — score ${f.score} (${f.message})`)
        );
    } else {
      console.log('  Complexity clean');
    }

    // Step 5: Summary
    console.log('  [5/5] Ship summary');
    console.log(`  Branch:   ${branch}`);
    console.log(`  Version:  ${pkg.version}`);
    console.log(`  Project:  ${state?.project || path.basename(PROJECT_ROOT)}`);

    // If --push flag provided, commit and push
    // Trust Level gate: L0/L1/L2 require explicit --confirm-push in addition to --push
    const trustLevel = new TrustLevel(state?.trustLevel || 1);
    const pushRequiresConfirm = trustLevel.requiresConfirmation('irreversible-external');

    if (args.includes('--push') || args.includes('-p')) {
      if (pushRequiresConfirm && !args.includes('--confirm-push')) {
        console.log(
          `\n  \x1b[33m⚠  Trust Level ${trustLevel.getLevel().name} — pushing is irreversible-external.\x1b[0m`
        );
        console.log(
          '  Re-run with --push --confirm-push to proceed, or set state.trustLevel >= 3 to skip this gate.\n'
        );
        return { status: 'trust-gate', trustLevel: trustLevel.getLevel().name };
      }
      console.log('\n  [push] Committing and pushing...');
      // Safety: warn if .env exists and is not gitignored
      const envPath = path.join(PROJECT_ROOT, '.env');
      if (fs.existsSync(envPath)) {
        try {
          execFileSync('git', ['check-ignore', '-q', '.env'], {
            cwd: PROJECT_ROOT,
            timeout: 5000,
            stdio: 'pipe',
          });
        } catch {
          console.log(
            '  \x1b[31m✖ SAFETY: .env file exists and is NOT gitignored — aborting to prevent secret exposure.\x1b[0m'
          );
          console.log('  Add .env to .gitignore before running --push.');
          return { status: 'env-not-ignored' };
        }
      }
      execFileSync('git', ['add', '-A'], { cwd: PROJECT_ROOT, timeout: 10000 });
      execFileSync('git', ['commit', '-m', 'chore: ship via vibe-stack pipeline'], {
        cwd: PROJECT_ROOT,
        timeout: 10000,
      });
      const upstream = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD@{upstream}'], {
        cwd: PROJECT_ROOT,
        timeout: 5000,
        encoding: 'utf8',
      }).trim();
      const pushArgs = upstream ? ['push'] : ['push', '--set-upstream', 'origin', branch];
      execFileSync('git', pushArgs, { cwd: PROJECT_ROOT, timeout: 30000 });
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
