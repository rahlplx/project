#!/usr/bin/env node

const { SkillBase } = require('../../../lib/skill-base.js');

class OneClickNetlify extends SkillBase {
  constructor(config = {}) {
    super();
    this.name = 'one-click-netlify';
    this.version = '1.0.0';
    this.description = 'Deploy any project to Netlify - wraps the Netlify CLI';
    this.cliCommand = config.cliCommand || 'npx netlify-cli';
  }

  validateConfigSync() {
    return { valid: true, message: 'Uses Netlify CLI - install with: npm i -g netlify-cli' };
  }

  validateConfig() {
    return this.validateConfigSync();
  }

  buildDeployCommandSync(projectPath = '.', options = {}) {
    const parts = this.cliCommand.split(' ');
    const cmd = parts[0];
    const args = [...parts.slice(1), 'deploy', '--dir', projectPath];
    if (options.production) args.push('--prod');
    if (options.site) args.push('--site', options.site);
    if (options.message) args.push('--message', options.message);
    args.push('--json');
    return { cmd, args };
  }

  buildDeployCommand(projectPath, options) {
    return this.buildDeployCommandSync(projectPath, options);
  }

  buildInitCommandSync(projectPath = '.') {
    const parts = this.cliCommand.split(' ');
    return { cmd: parts[0], args: [...parts.slice(1), 'init', '--cwd', projectPath] };
  }

  buildInitCommand(projectPath) {
    return this.buildInitCommandSync(projectPath);
  }

  buildOpenCommandSync() {
    const parts = this.cliCommand.split(' ');
    return { cmd: parts[0], args: [...parts.slice(1), 'open:site'] };
  }

  buildOpenCommand() {
    return this.buildOpenCommandSync();
  }

  buildEnvCommandSync(vars = {}) {
    const parts = this.cliCommand.split(' ');
    const cmd = parts[0];
    const commands = Object.entries(vars).map(([key, value]) => ({
      cmd,
      args: [...parts.slice(1), 'env:set', key, value],
    }));
    return { commands, count: commands.length };
  }

  buildEnvCommand(vars) {
    return this.buildEnvCommandSync(vars);
  }

  toJSONSync() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      dependencies: ['Netlify CLI (npm i -g netlify-cli)'],
      usage: {
        deploy: 'skill.buildDeployCommand("./dist", { production: true })',
        init: 'skill.buildInitCommand()',
        env: 'skill.buildEnvCommand({ MY_KEY: "value" })',
      },
    };
  }

  toJSON() {
    return this.toJSONSync();
  }
}

if (require.main === module) {
  const skill = new OneClickNetlify();
  const projectPath = process.argv[2] || '.';
  const isProd = process.argv.includes('--prod');
  const cmd = skill.buildDeployCommandSync(projectPath, { production: isProd });
  console.log('Run this command:\n');
  console.log(`${cmd.cmd} ${cmd.args.join(' ')}`);
}

module.exports = OneClickNetlify;
