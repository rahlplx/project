const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const child_process = require('child_process');
const path = require('path');

const originalExecFileSync = child_process.execFileSync;
let mockExecFileSync = () => '';
child_process.execFileSync = (...args) => mockExecFileSync(...args);

// Stub auto-maintain module to avoid real fs/git I/O
const Module = require('module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request && request.includes('auto-maintain')) {
    return {
      runLearn: () => ({ pattern_count: 3, anti_pattern_count: 1, uncaptured_solutions: [] }),
      runRetro: () => ({
        assessment: 'ok',
        harness_summary: { pass_rate: 1, failures: 0 },
        telemetry: { total_sessions: 1, recent_commits: [] },
      }),
    };
  }
  if (request && request.includes('git-learnings')) {
    return {
      extract: () => ({
        error: null,
        commitTypes: { feat: 2 },
        topChangedFiles: [],
        velocity: { commitsLast7Days: 5 },
        antiPatterns: [],
      }),
    };
  }
  return originalLoad.apply(this, arguments);
};

const { handler } = require('./learn');

after(() => {
  child_process.execFileSync = originalExecFileSync;
  Module._load = originalLoad;
});

describe('learn handler', () => {
  it('returns ok status with real auto-maintain stub', () => {
    const result = handler([], {});
    assert.strictEqual(result.status, 'ok');
  });

  it('does not throw with null state', () => {
    assert.doesNotThrow(() => handler([], null));
  });

  it('capture subcommand returns error when subprocess fails', () => {
    mockExecFileSync = () => {
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    };
    const result = handler(['capture'], {});
    assert.strictEqual(result.status, 'error');
    assert.ok(typeof result.error === 'string');
    mockExecFileSync = () => '';
  });

  it('capture subcommand ok branch returns ok status', () => {
    mockExecFileSync = () => '';
    const result = handler(['capture'], {});
    assert.strictEqual(result.status, 'ok');
  });

  it('ok result has learnResult field', () => {
    const result = handler([], {});
    if (result.status === 'ok') {
      assert.ok('learnResult' in result);
    }
  });
});
