#!/usr/bin/env node

const { SkillBase } = require('../../../lib/skill-base.js');

class OneClickVercel extends SkillBase {
  constructor(config = {}) {
    super();
    this.name = 'one-click-vercel';
    this.version = '1.0.0';
    this.description = 'Deploy any project to Vercel - wraps the Vercel CLI';
    this.cliCommand = config.cliCommand || 'npx vercel';
  }

  validateConfigSync() {
    return { valid: true, message: 'Uses Vercel CLI - install with: npm i -g vercel' };
  }

  validateConfig() {
    return this.validateConfigSync();
  }

  buildDeployCommandSync(projectPath = '.', options = {}) {
    const parts = this.cliCommand.split(' ');
    const cmd = parts[0];
    const args = [...parts.slice(1), '--cwd', projectPath, '--yes'];
    if (options.production) args.push('--prod');
    if (options.name) args.push('--name', options.name);
    if (options.scope) args.push('--scope', options.scope);
    if (options.public) args.push('--public');
    return { cmd, args };
  }

  buildDeployCommand(projectPath, options) {
    return this.buildDeployCommandSync(projectPath, options);
  }

  buildEnvCommandSync(vars = {}, projectPath = '.') {
    const parts = this.cliCommand.split(' ');
    const cmd = parts[0];
    const commands = Object.entries(vars).map(([key, value]) => ({
      cmd,
      args: [...parts.slice(1), 'env', 'add', key, value, '--cwd', projectPath, '--yes'],
    }));
    return { commands, count: commands.length };
  }

  buildEnvCommand(vars, projectPath) {
    return this.buildEnvCommandSync(vars, projectPath);
  }

  buildLinkCommandSync(projectPath = '.') {
    const parts = this.cliCommand.split(' ');
    return { cmd: parts[0], args: [...parts.slice(1), 'link', '--cwd', projectPath, '--yes'] };
  }

  buildLinkCommand(projectPath) {
    return this.buildLinkCommandSync(projectPath);
  }

  toJSONSync() {
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

  toJSON() {
    return this.toJSONSync();
  }
}

if (require.main === module) {
  const skill = new OneClickVercel();
  const projectPath = process.argv[2] || '.';
  const isProd = process.argv.includes('--prod');
  const cmd = skill.buildDeployCommandSync(projectPath, { production: isProd });
  console.log('Run this command:\n');
  console.log(`${cmd.cmd} ${cmd.args.join(' ')}`);
}

module.exports = OneClickVercel;
