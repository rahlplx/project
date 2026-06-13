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
    const parts = [this.cliCommand, 'deploy', '--dir', `"${projectPath}"`];
    if (options.production) parts.push('--prod');
    if (options.site) parts.push('--site', options.site);
    if (options.message) parts.push('--message', `"${options.message}"`);
    parts.push('--json');
    return parts.join(' ');
  }

  buildInitCommand(projectPath = '.') {
    return `${this.cliCommand} init --cwd "${projectPath}"`;
  }

  buildOpenCommand() {
    return `${this.cliCommand} open:site`;
  }

  buildEnvCommand(vars = {}) {
    const cmds = Object.entries(vars).map(([key, value]) =>
      `${this.cliCommand} env:set ${key} "${value}"`
    );
    return { commands: cmds, count: cmds.length };
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
        env: 'skill.buildEnvCommand({ MY_KEY: "value" })'
      }
    };
  }
}

if (require.main === module) {
  const skill = new OneClickNetlify();
  const projectPath = process.argv[2] || '.';
  const isProd = process.argv.includes('--prod');
  const cmd = skill.buildDeployCommand(projectPath, { production: isProd });
  console.log('Run this command:\n');
  console.log(cmd);
}

module.exports = OneClickNetlify;
