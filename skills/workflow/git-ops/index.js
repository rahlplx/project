#!/usr/bin/env node

const { SkillBase } = require('../../../lib/skill-base.js');
const { execFileSync } = require('child_process');

class GitOps extends SkillBase {
  constructor() {
    super();
    this.name = 'git-ops';
    this.version = '1.0.0';
    this.description = 'Git operations without CLI knowledge — wraps git CLI';
  }

  run(action, args = {}) {
    const result = this.buildCommand(action, args);
    if (result.error) return result;
    try {
      const output = execFileSync('git', result.gitArgs, {
        encoding: 'utf-8',
        cwd: args.cwd || process.cwd(),
      });
      return {
        success: true,
        action,
        command: result.display,
        description: result.desc,
        output: output.trim(),
      };
    } catch (err) {
      return {
        success: false,
        action,
        command: result.display,
        error: err.stderr?.trim() || err.message,
      };
    }
  }

  buildCommand(action, args = {}) {
    const files = args.files || '.';
    const message = args.message || 'Update';
    const name = args.name || '';
    const branch = args.branch || 'main';
    const remote = args.remote || 'origin';
    const stashAction = args.action || '';

    const commands = {
      init: {
        gitArgs: ['init'],
        cmd: 'git init',
        display: 'git init',
        desc: 'Initialize a new git repository',
      },
      status: {
        gitArgs: ['status'],
        cmd: 'git status',
        display: 'git status',
        desc: 'Check current repository status',
      },
      add: {
        gitArgs: ['add', files],
        cmd: `git add ${files}`,
        display: `git add ${files}`,
        desc: 'Stage files for commit',
      },
      commit: {
        gitArgs: ['commit', '-m', message],
        cmd: `git commit -m "${message}"`,
        display: `git commit -m "${message}"`,
        desc: 'Commit staged changes',
      },
      branch: {
        gitArgs: ['branch'],
        cmd: 'git branch',
        display: 'git branch',
        desc: 'List branches',
      },
      'branch-create': {
        gitArgs: ['branch', name],
        cmd: `git branch ${name}`,
        display: `git branch ${name}`,
        desc: 'Create a branch',
      },
      checkout: {
        gitArgs: ['checkout', branch],
        cmd: `git checkout ${branch}`,
        display: `git checkout ${branch}`,
        desc: 'Switch branches',
      },
      'checkout-new': {
        gitArgs: ['checkout', '-b', branch],
        cmd: `git checkout -b ${branch}`,
        display: `git checkout -b ${branch}`,
        desc: 'Create and switch branches',
      },
      pull: {
        gitArgs: ['pull', remote, branch],
        cmd: `git pull ${remote} ${branch}`,
        display: `git pull ${remote} ${branch}`,
        desc: 'Pull latest changes',
      },
      push: args.first
        ? {
            gitArgs: ['push', '--set-upstream', 'origin', branch],
            cmd: `git push --set-upstream origin ${branch}`,
            display: `git push --set-upstream origin ${branch}`,
            desc: 'Push changes to remote',
          }
        : {
            gitArgs: ['push', remote, branch],
            cmd: `git push ${remote} ${branch}`,
            display: `git push ${remote} ${branch}`,
            desc: 'Push changes to remote',
          },
      log: {
        gitArgs: ['log', '--oneline', '--graph', '-10'],
        cmd: 'git log --oneline --graph -10',
        display: 'git log --oneline --graph -10',
        desc: 'Show recent commits',
      },
      diff: {
        gitArgs: ['diff'],
        cmd: 'git diff',
        display: 'git diff',
        desc: 'Show unstaged changes',
      },
      stash: stashAction
        ? {
            gitArgs: ['stash', stashAction],
            cmd: `git stash ${stashAction}`,
            display: `git stash ${stashAction}`,
            desc: 'Manage stash',
          }
        : {
            gitArgs: ['stash'],
            cmd: 'git stash',
            display: 'git stash',
            desc: 'Temporarily save changes',
          },
      merge: {
        gitArgs: ['merge', branch],
        cmd: `git merge ${branch}`,
        display: `git merge ${branch}`,
        desc: 'Merge a branch into current',
      },
    };
    return commands[action] || { error: `Unknown action: ${action}` };
  }

  suggestWorkflow(type) {
    const workflows = {
      feature: [
        'git checkout -b feat/my-feature',
        '# Make changes...',
        'git add .',
        'git commit -m "feat: description"',
        'git push --set-upstream origin feat/my-feature',
        '# Open a PR on GitHub',
      ],
      fix: [
        'git checkout -b fix/bug-description',
        '# Make changes...',
        'git add .',
        'git commit -m "fix: description"',
        'git push --set-upstream origin fix/bug-description',
        '# Open a PR on GitHub',
      ],
      simple: ['git add .', 'git commit -m "Update"', 'git push'],
    };
    return workflows[type] || workflows.simple;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = GitOps;
