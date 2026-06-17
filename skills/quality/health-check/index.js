#!/usr/bin/env node

class HealthCheck {
  constructor(config = {}) {
    this.name = 'health-check';
    this.version = '1.0.0';
    this.description = 'Check if your project dependencies and environment are healthy';
  }

  checkProject(projectPath = '.') {
    const fs = require('fs');
    const path = require('path');
    const resolved = path.resolve(projectPath);
    const checks = [];

    // Package check
    const pkgPath = path.join(resolved, 'package.json');
    const hasPkg = fs.existsSync(pkgPath);
    checks.push({
      check: 'package.json exists',
      passed: hasPkg,
      severity: hasPkg ? 'ok' : 'warning',
    });

    // Node modules
    const hasNodeModules = fs.existsSync(path.join(resolved, 'node_modules'));
    checks.push({
      check: 'node_modules installed',
      passed: hasNodeModules,
      severity: hasNodeModules ? 'ok' : 'warning',
    });

    // Git
    const hasGit = fs.existsSync(path.join(resolved, '.git'));
    checks.push({
      check: 'Git repository initialized',
      passed: hasGit,
      severity: hasGit ? 'ok' : 'info',
    });

    // Entry points
    const hasIndex =
      fs.existsSync(path.join(resolved, 'index.js')) ||
      fs.existsSync(path.join(resolved, 'index.html')) ||
      fs.existsSync(path.join(resolved, 'index.ts'));
    checks.push({
      check: 'Entry point exists (index.js/html/ts)',
      passed: hasIndex,
      severity: hasIndex ? 'ok' : 'info',
    });

    // Readme
    const hasReadme = fs.existsSync(path.join(resolved, 'README.md'));
    checks.push({
      check: 'README.md exists',
      passed: hasReadme,
      severity: hasReadme ? 'ok' : 'info',
    });

    // Gitignore
    const hasGitignore = fs.existsSync(path.join(resolved, '.gitignore'));
    checks.push({
      check: '.gitignore exists',
      passed: hasGitignore,
      severity: hasGitignore ? 'ok' : 'info',
    });

    // Env file
    const hasEnv =
      fs.existsSync(path.join(resolved, '.env')) ||
      fs.existsSync(path.join(resolved, '.env.example'));
    checks.push({
      check: 'Environment config (.env / .env.example)',
      passed: hasEnv,
      severity: hasEnv ? 'ok' : 'info',
    });

    // License
    const hasLicense = fs.existsSync(path.join(resolved, 'LICENSE'));
    checks.push({
      check: 'LICENSE file exists',
      passed: hasLicense,
      severity: hasLicense ? 'ok' : 'info',
    });

    // Disk space
    const diskCheck = this._checkDiskSpace(resolved);

    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;

    return {
      success: true,
      project: path.basename(resolved),
      health: passed === total ? 'healthy' : passed >= total / 2 ? 'fair' : 'needs-attention',
      score: Math.round((passed / total) * 100),
      summary: `${passed}/${total} checks passed`,
      checks,
      disk: diskCheck,
      recommendations: this._generateRecommendations(checks),
      timestamp: new Date().toISOString(),
    };
  }

  _checkDiskSpace(dir) {
    try {
      const os = require('os');
      const free = os.freemem();
      const total = os.totalmem();
      const freeGB = (free / 1024 / 1024 / 1024).toFixed(1);
      return { freeMemoryGB: parseFloat(freeGB), status: freeGB > 1 ? 'ok' : 'low' };
    } catch {
      return { freeMemoryGB: 'unknown', status: 'unknown' };
    }
  }

  _generateRecommendations(checks) {
    const recs = [];
    if (!checks.find(c => c.check.includes('node_modules'))?.passed)
      {recs.push({ priority: 'high', message: 'Run "npm install" to install dependencies.' });}
    if (!checks.find(c => c.check.includes('.gitignore'))?.passed)
      {recs.push({
        priority: 'medium',
        message: 'Create a .gitignore file to avoid committing unnecessary files.',
      });}
    if (!checks.find(c => c.check.includes('README'))?.passed)
      {recs.push({
        priority: 'low',
        message: 'Add a README.md so others know what your project does.',
      });}
    if (!checks.find(c => c.check.includes('LICENSE'))?.passed)
      {recs.push({ priority: 'low', message: 'Add a LICENSE file if you plan to share your code.' });}
    return recs;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

if (require.main === module) {
  const skill = new HealthCheck();
  const dir = process.argv[2] || '.';
  console.log(JSON.stringify(skill.checkProject(dir), null, 2));
}

module.exports = HealthCheck;
