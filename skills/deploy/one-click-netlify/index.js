#!/usr/bin/env node

class OneClickNetlify {
  constructor(config = {}) {
    this.name = 'one-click-netlify';
    this.version = '1.0.0';
    this.description = 'Deploy any project to Netlify — wraps the Netlify CLI';
    this.cliCommand = config.cliCommand || 'npx netlify-cli';
  }

  validateConfig() {
    return { valid: true, message: 'Uses Netlify CLI — install with: npm i -g netlify-cli' };
  }

  buildDeployCommand(projectPath = '.', options = {}) {
    const parts = this.cliCommand.split(' ');
    const cmd = parts[0];
    const args = [...parts.slice(1), 'deploy', '--dir', projectPath];
    if (options.production) args.push('--prod');
    if (options.site) args.push('--site', options.site);
    if (options.message) args.push('--message', options.message);
    args.push('--json');
    return { cmd, args };
  }

  buildInitCommand(projectPath = '.') {
    const parts = this.cliCommand.split(' ');
    return { cmd: parts[0], args: [...parts.slice(1), 'init', '--cwd', projectPath] };
  }

  buildOpenCommand() {
    const parts = this.cliCommand.split(' ');
    return { cmd: parts[0], args: [...parts.slice(1), 'open:site'] };
  }

  buildEnvCommand(vars = {}) {
    const parts = this.cliCommand.split(' ');
    const cmd = parts[0];
    const commands = Object.entries(vars).map(([key, value]) => ({
      cmd,
      args: [...parts.slice(1), 'env:set', key, value],
    }));
    return { commands, count: commands.length };
  }

  toJSON() {
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
}

if (require.main === module) {
  const skill = new OneClickNetlify();
  const projectPath = process.argv[2] || '.';
  const isProd = process.argv.includes('--prod');
  const cmd = skill.buildDeployCommand(projectPath, { production: isProd });
  console.log('Run this command:\n');
  console.log(`${cmd.cmd} ${cmd.args.join(' ')}`);
}

module.exports = OneClickNetlify;
