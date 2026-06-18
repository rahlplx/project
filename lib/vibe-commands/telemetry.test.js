const { describe, it, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const child_process = require('child_process');

const originalExecFileSync = child_process.execFileSync;
let mockMode = 'ok'; // 'ok' | 'error'

child_process.execFileSync = (_cmd, args, _opts) => {
  if (mockMode === 'error') {
    throw new Error('subprocess failed');
  }
  // telemetry.js uses stdio: 'inherit' — return empty string for ok path
  return '';
};

const { handler } = require('./telemetry');

after(() => {
  child_process.execFileSync = originalExecFileSync;
});

describe('telemetry handler — ok path', () => {
  beforeEach(() => {
    mockMode = 'ok';
  });

  it('returns ok status when subprocess succeeds', () => {
    const result = handler([], {});
    assert.strictEqual(result.status, 'ok');
  });

  it('does not throw with null state', () => {
    assert.doesNotThrow(() => handler([], null));
  });

  it('accepts subcommand arg and returns ok', () => {
    const result = handler(['summary'], {});
    assert.strictEqual(result.status, 'ok');
  });
});

describe('telemetry handler — error path', () => {
  beforeEach(() => {
    mockMode = 'error';
  });

  it('returns error status when subprocess fails', () => {
    const result = handler([], {});
    assert.strictEqual(result.status, 'error');
    assert.ok(typeof result.error === 'string');
  });
});
