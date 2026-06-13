#!/usr/bin/env node

class OneClickVercel {
  constructor(config = {}) {
    this.name = 'one-click-vercel';
    this.version = '1.0.0';
    this.description = 'Deploy any project to Vercel — wraps the Vercel CLI';
    this.cliCommand = config.cliCommand || 'npx vercel';
  }

  validateConfig() {
    return { valid: true, message: 'Uses Vercel CLI — install with: npm i -g vercel' };
  }

  buildDeployCommand(projectPath = '.', options = {}) {
    const parts = [this.cliCommand, '--cwd', `"${projectPath}"`, '--yes'];
    if (options.production) parts.push('--prod');
    if (options.name) parts.push('--name', options.name);
    if (options.scope) parts.push('--scope', options.scope);
    if (options.public) parts.push('--public');
    return parts.join(' ');
  }

  buildEnvCommand(vars = {}, projectPath = '.') {
    const cmds = Object.entries(vars).map(([key, value]) =>
      `${this.cliCommand} env add ${key} "${value}" --cwd "${projectPath}" --yes`
    );
    return { commands: cmds, count: cmds.length };
  }

  buildLinkCommand(projectPath = '.') {
    return `${this.cliCommand} link --cwd "${projectPath}" --yes`;
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      dependencies: ['Vercel CLI (npm i -g vercel)'],
      usage: {
        deploy: 'skill.deploy("./my-project", { production: true })',
        env: 'skill.buildEnvCommand({ MY_KEY: "value" })',
        link: 'skill.buildLinkCommand()'
      }
    };
  }
}

if (require.main === module) {
  const skill = new OneClickVercel();
  const projectPath = process.argv[2] || '.';
  const isProd = process.argv.includes('--prod');
  const cmd = skill.buildDeployCommand(projectPath, { production: isProd });
  console.log('Run this command:\n');
  console.log(cmd);
}

module.exports = OneClickVercel;
