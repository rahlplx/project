#!/usr/bin/env node

class GitOps {
  constructor() {
    this.name = 'git-ops';
    this.version = '1.0.0';
    this.description = 'Git operations without CLI knowledge — generates git commands';
  }

  buildCommand(action, args = {}) {
    const commands = {
      init: { cmd: 'git init', desc: 'Initialize a new git repository' },
      status: { cmd: 'git status', desc: 'Check current repository status' },
      add: { cmd: `git add ${args.files || '.'}`, desc: 'Stage files for commit' },
      commit: { cmd: `git commit -m "${args.message || 'Update'}"`, desc: 'Commit staged changes' },
      branch: { cmd: `git branch ${args.name || ''}`, desc: 'List or create branches' },
      checkout: { cmd: `git checkout ${args.name || 'main'}`, desc: 'Switch branches' },
      pull: { cmd: `git pull ${args.remote || 'origin'} ${args.branch || 'main'}`, desc: 'Pull latest changes' },
      push: { cmd: args.first ? `git push --set-upstream origin ${args.branch || 'main'}` : `git push ${args.remote || 'origin'} ${args.branch || ''}`, desc: 'Push changes to remote' },
      log: { cmd: 'git log --oneline --graph -10', desc: 'Show recent commits' },
      diff: { cmd: 'git diff', desc: 'Show unstaged changes' },
      stash: { cmd: `git stash ${args.action || ''}`, desc: 'Temporarily save changes' },
      merge: { cmd: `git merge ${args.branch || ''}`, desc: 'Merge a branch into current' }
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
        '# Open a PR on GitHub'
      ],
      fix: [
        'git checkout -b fix/bug-description',
        '# Make changes...',
        'git add .',
        'git commit -m "fix: description"',
        'git push --set-upstream origin fix/bug-description',
        '# Open a PR on GitHub'
      ],
      simple: [
        'git add .',
        'git commit -m "Update"',
        'git push'
      ]
    };
    return workflows[type] || workflows.simple;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = GitOps;
