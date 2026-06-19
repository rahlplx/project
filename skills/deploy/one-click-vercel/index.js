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
    const parts = this.cliCommand.split(' ');
    const cmd = parts[0];
    const args = [...parts.slice(1), '--cwd', projectPath, '--yes'];
    if (options.production) args.push('--prod');
    if (options.name) args.push('--name', options.name);
    if (options.scope) args.push('--scope', options.scope);
    if (options.public) args.push('--public');
    return { cmd, args };
  }

  buildEnvCommand(vars = {}, projectPath = '.') {
    const parts = this.cliCommand.split(' ');
    const cmd = parts[0];
    const commands = Object.entries(vars).map(([key, value]) => ({
      cmd,
      args: [...parts.slice(1), 'env', 'add', key, value, '--cwd', projectPath, '--yes'],
    }));
    return { commands, count: commands.length };
  }

  buildLinkCommand(projectPath = '.') {
    const parts = this.cliCommand.split(' ');
    return { cmd: parts[0], args: [...parts.slice(1), 'link', '--cwd', projectPath, '--yes'] };
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
        link: 'skill.buildLinkCommand()',
      },
    };
  }
}

if (require.main === module) {
  const skill = new OneClickVercel();
  const projectPath = process.argv[2] || '.';
  const isProd = process.argv.includes('--prod');
  const cmd = skill.buildDeployCommand(projectPath, { production: isProd });
  console.log('Run this command:\n');
  console.log(`${cmd.cmd} ${cmd.args.join(' ')}`);
}

module.exports = OneClickVercel;
