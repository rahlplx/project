#!/usr/bin/env node

class Rollback {
  constructor() {
    this.name = 'rollback';
    this.version = '1.0.0';
    this.description = 'One-click rollback — undo changes safely';
  }

  buildCommand(type, ref) {
    const commands = {
      'undo-commit': { cmd: `git revert ${ref || 'HEAD'}`, desc: 'Creates a new commit that undoes the specified commit (safe for shared repos)', safe: true },
      'undo-last-commit': { cmd: 'git reset --soft HEAD~1', desc: 'Undoes the last commit but keeps changes staged', safe: true },
      'undo-all-local': { cmd: 'git checkout -- .', desc: 'Discards all unstaged local changes', safe: false, warning: 'This permanently discards uncommitted changes.' },
      'reset-to-commit': { cmd: `git reset --hard ${ref || 'HEAD~1'}`, desc: 'Resets to a specific commit, discarding all changes since', safe: false, warning: 'This permanently deletes all changes after the target commit.' },
      'revert-file': { cmd: `git checkout -- ${ref || 'file.js'}`, desc: 'Revert a specific file to its last committed state', safe: true },
      'stash-pop': { cmd: 'git stash pop', desc: 'Restore the most recently stashed changes', safe: true },
      'undo-merge': { cmd: `git revert ${ref || 'HEAD'} -m 1`, desc: 'Undo a merge commit', safe: true }
    };
    return commands[type] || { error: `Unknown rollback type: ${type}` };
  }

  suggestRecovery(scenario) {
    const lower = scenario.toLowerCase();
    if (/wrong commit/i.test(lower)) return { type: 'undo-commit', command: this.buildCommand('undo-commit', 'HEAD'), explanation: 'Creates a new commit that undoes the bad one — safe for teams.' };
    if (/delete.*file|accidentally.*remove/i.test(lower)) return { type: 'revert-file', command: this.buildCommand('revert-file'), explanation: 'Restores the file from the last commit.' };
    if (/merge.*wrong|wrong.*merge/i.test(lower)) return { type: 'undo-merge', command: this.buildCommand('undo-merge', 'HEAD'), explanation: 'Undoes the merge while keeping branch history.' };
    if (/start over|everything.*wrong|reset/i.test(lower)) return { type: 'reset-to-commit', command: this.buildCommand('reset-to-commit'), explanation: 'Resets everything to a known good state.', warning: 'This is destructive. Make sure you have a backup.' };
    return { type: 'undo-last-commit', command: this.buildCommand('undo-last-commit'), explanation: 'Safely undo your last commit.' };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = Rollback;
