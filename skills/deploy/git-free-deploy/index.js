#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { SkillBase } = require('../../../lib/skill-base.js');

class GitFreeDeploy extends SkillBase {
  constructor(config = {}) {
    super();
    this.name = 'git-free-deploy';
    this.version = '1.0.0';
    this.description =
      'Deploy static sites without git - wraps surge.sh, npx serve, and Netlify Drop';
  }

  buildServeCommandSync(projectPath = '.', port = 3000) {
    return { cmd: 'npx', args: ['serve', projectPath, '-p', String(port)] };
  }

  buildServeCommand(projectPath, port) {
    return this.buildServeCommandSync(projectPath, port);
  }

  buildSurgeCommandSync(projectPath = '.', domain) {
    const args = ['surge', projectPath];
    if (domain) args.push(domain);
    return { cmd: 'npx', args };
  }

  buildSurgeCommand(projectPath, domain) {
    return this.buildSurgeCommandSync(projectPath, domain);
  }

  buildNetlifyDropCommandSync(projectPath = '.') {
    return { cmd: 'npx', args: ['netlify-cli', 'deploy', '--dir', projectPath] };
  }

  buildNetlifyDropCommand(projectPath) {
    return this.buildNetlifyDropCommandSync(projectPath);
  }

  prepareStaticFilesSync(sourceDir = '.') {
    const resolvedSource = path.resolve(sourceDir);
    if (!fs.existsSync(resolvedSource)) {
      return { success: false, error: `Source not found: ${sourceDir}` };
    }
    const files = {};
    const walk = (dir, base = '') => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const fp = path.join(dir, e.name);
        const rp = base ? `${base}/${e.name}` : e.name;
        if (e.isDirectory()) walk(fp, rp);
        else if (e.isFile()) files[rp] = fs.readFileSync(fp, 'utf-8');
      }
    };
    try {
      walk(resolvedSource);
    } catch (err) {
      return { success: false, error: err.message };
    }
    return {
      success: true,
      files,
      fileCount: Object.keys(files).length,
      sourceDir: resolvedSource,
    };
  }

  prepareStaticFiles(sourceDir) {
    return this.prepareStaticFilesSync(sourceDir);
  }

  generateDeployPackageSync(sourceDir = '.') {
    const files = this.prepareStaticFilesSync(sourceDir);
    if (!files.success) return files;
    return {
      success: true,
      fileCount: files.fileCount,
      commands: [
        { label: 'Local preview', ...this.buildServeCommandSync(sourceDir) },
        { label: 'Deploy via Surge.sh', ...this.buildSurgeCommandSync(sourceDir) },
        { label: 'Deploy via Netlify Drop', ...this.buildNetlifyDropCommandSync(sourceDir) },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  generateDeployPackage(sourceDir) {
    return this.generateDeployPackageSync(sourceDir);
  }

  validateStaticSiteSync(sourceDir = '.') {
    const resolved = path.resolve(sourceDir);
    if (!fs.existsSync(resolved)) return { valid: false, error: 'Directory not found' };
    const checks = {
      hasIndexHtml: fs.existsSync(path.join(resolved, 'index.html')),
      hasAssets: fs.readdirSync(resolved).some(f => /\.(css|js|png|jpg|svg)$/i.test(f)),
    };
    return { valid: checks.hasIndexHtml, checks };
  }

  validateStaticSite(sourceDir) {
    return this.validateStaticSiteSync(sourceDir);
  }

  toJSONSync() {
    return { name: this.name, version: this.version, description: this.description };
  }

  toJSON() {
    return this.toJSONSync();
  }
}

if (require.main === module) {
  const skill = new GitFreeDeploy();
  const dir = process.argv[2] || '.';
  const pkg = skill.generateDeployPackageSync(dir);
  console.log(
    pkg.success
      ? pkg.commands.map(c => `${c.label}: ${c.cmd} ${c.args.join(' ')}`).join('\n')
      : JSON.stringify(pkg)
  );
}

module.exports = GitFreeDeploy;
