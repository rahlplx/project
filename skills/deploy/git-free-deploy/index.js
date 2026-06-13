#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class GitFreeDeploy {
  constructor(config = {}) {
    this.name = 'git-free-deploy';
    this.version = '1.0.0';
    this.description = 'Deploy static sites without git — wraps surge.sh, npx serve, and Netlify Drop';
  }

  buildServeCommand(projectPath = '.', port = 3000) {
    return { cmd: 'npx', args: ['serve', projectPath, '-p', String(port)] };
  }

  buildSurgeCommand(projectPath = '.', domain) {
    const args = ['surge', projectPath];
    if (domain) args.push(domain);
    return { cmd: 'npx', args };
  }

  buildNetlifyDropCommand(projectPath = '.') {
    return { cmd: 'npx', args: ['netlify-cli', 'deploy', '--dir', projectPath] };
  }

  prepareStaticFiles(sourceDir = '.') {
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
    try { walk(resolvedSource); } catch (err) { return { success: false, error: err.message }; }
    return { success: true, files, fileCount: Object.keys(files).length, sourceDir: resolvedSource };
  }

  generateDeployPackage(sourceDir = '.') {
    const files = this.prepareStaticFiles(sourceDir);
    if (!files.success) return files;
    return {
      success: true,
      fileCount: files.fileCount,
      commands: [
        { label: 'Local preview', ...this.buildServeCommand(sourceDir) },
        { label: 'Deploy via Surge.sh', ...this.buildSurgeCommand(sourceDir) },
        { label: 'Deploy via Netlify Drop', ...this.buildNetlifyDropCommand(sourceDir) }
      ],
      timestamp: new Date().toISOString()
    };
  }

  validateStaticSite(sourceDir = '.') {
    const resolved = path.resolve(sourceDir);
    if (!fs.existsSync(resolved)) return { valid: false, error: 'Directory not found' };
    const checks = {
      hasIndexHtml: fs.existsSync(path.join(resolved, 'index.html')),
      hasAssets: fs.readdirSync(resolved).some(f => /\.(css|js|png|jpg|svg)$/i.test(f))
    };
    return { valid: checks.hasIndexHtml, checks };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

if (require.main === module) {
  const skill = new GitFreeDeploy();
  const dir = process.argv[2] || '.';
  const pkg = skill.generateDeployPackage(dir);
  console.log(pkg.success ? pkg.commands.map(c => `${c.label}: ${c.cmd} ${c.args.join(' ')}`).join('\n') : JSON.stringify(pkg));
}

module.exports = GitFreeDeploy;
