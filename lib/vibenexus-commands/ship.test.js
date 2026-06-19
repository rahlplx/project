const { describe, it, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const child_process = require('child_process');

// Mock before require so ship.js picks up the intercepted versions
const originalExecFileSync = child_process.execFileSync;
const originalExistsSync = fs.existsSync;

let mockExecFileSync = () => '';
let mockExistsSync = () => false;

child_process.execFileSync = (...args) => mockExecFileSync(...args);
fs.existsSync = (...args) => mockExistsSync(...args);

const { handler } = require('./ship');

function defaultExec(cmd, args) {
  if (cmd === 'git' && args && args.includes('status')) return '';
  if (cmd === 'git' && args && args.includes('rev-parse')) return 'main';
  if (cmd === 'npm' && args && args.includes('test')) return '';
  if (cmd === 'npm' && args && args.includes('audit')) {
    return JSON.stringify({ metadata: { vulnerabilities: {} } });
  }
  return '';
}

function defaultExists(p) {
  if (p && p.endsWith('package.json')) return true;
  return false;
}

after(() => {
  child_process.execFileSync = originalExecFileSync;
  fs.existsSync = originalExistsSync;
});

describe('ship handler — dry run', () => {
  beforeEach(() => {
    mockExecFileSync = defaultExec;
    mockExistsSync = defaultExists;
  });

  it('returns ok status on dry run (no --push)', () => {
    const result = handler([], {});
    assert.strictEqual(result.status, 'ok');
  });

  it('does not throw with null state', () => {
    assert.doesNotThrow(() => handler([], null));
  });

  it('returns trust-gate when --push used without confirm at low trust level', () => {
    const result = handler(['--push'], { trustLevel: 1 });
    assert.strictEqual(result.status, 'trust-gate');
  });
});

describe('ship handler — env-not-ignored guard', () => {
  beforeEach(() => {
    mockExecFileSync = defaultExec;
    mockExistsSync = defaultExists;
  });

  it('aborts --push when .env exists and is not gitignored', () => {
    mockExistsSync = p => {
      if (p && p.endsWith('.env')) return true;
      if (p && p.endsWith('package.json')) return true;
      return false;
    };
    mockExecFileSync = (cmd, args) => {
      if (cmd === 'git' && args && args.includes('check-ignore')) throw new Error('not ignored');
      return defaultExec(cmd, args);
    };
    const result = handler(['--push', '--confirm-push'], { trustLevel: 3 });
    assert.strictEqual(result.status, 'env-not-ignored');
  });

  it('proceeds when .env is gitignored', () => {
    mockExistsSync = p => {
      if (p && p.endsWith('.env')) return true;
      if (p && p.endsWith('package.json')) return true;
      return false;
    };
    const result = handler(['--push', '--confirm-push'], { trustLevel: 3 });
    assert.ok(['ok', 'error', 'tests-failed'].includes(result.status));
  });
});
