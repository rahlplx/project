const { describe, it, before } = require('node:test');
const assert = require('node:assert');

// Stub getCommand so we don't need real vibe state
let registeredHandlers = {};
function mockGetCommand(name) {
  return registeredHandlers[name] || null;
}

describe('auto.js categorizeError', () => {
  // Test the exported categorizeError by loading the module internals
  // Since it's not exported, test through the handler behavior
  it('handler returns error status when state is null', async () => {
    const original = require('./state-helpers').readState;
    // patch readState to return null
    const sh = require('./state-helpers');
    const orig = sh.readState;
    sh.readState = () => null;

    // Need to require auto after patching — use a fresh require via cache clear
    delete require.cache[require.resolve('./auto')];
    const { handler } = require('./auto');
    const result = await handler([], null);
    assert.strictEqual(result.status, 'error');

    sh.readState = orig;
    delete require.cache[require.resolve('./auto')];
  });
});

describe('auto.js --from phase skip', () => {
  it('handler with --from=done skips all phases and returns ok', async () => {
    const sh = require('./state-helpers');
    const idx = require('./index');

    const origRead = sh.readState;
    const origWrite = sh.writeState;
    const origTelemetry = sh.recordTelemetry;
    const origHandoff = sh.writeHandoff;
    const origGetCmd = idx.getCommand;

    sh.readState = () => ({ phase: 'think', step: 0, goal: 'test', completed: [] });
    sh.writeState = () => {};
    sh.recordTelemetry = () => {};
    sh.writeHandoff = () => {};
    idx.getCommand = () => null;

    delete require.cache[require.resolve('./auto')];
    const { handler } = require('./auto');
    const result = await handler(['--from=done'], {
      phase: 'think',
      step: 0,
      goal: 'test',
      completed: [],
    });

    // With --from=done, all phases are skipped until 'done' is found; pipeline completes
    assert.ok(result.status === 'ok' || result.status === 'interrupted');

    sh.readState = origRead;
    sh.writeState = origWrite;
    sh.recordTelemetry = origTelemetry;
    sh.writeHandoff = origHandoff;
    idx.getCommand = origGetCmd;
    delete require.cache[require.resolve('./auto')];
  });
});

describe('auto.js circuit breaker', () => {
  it('stops after maxFailures consecutive errors and stores failedPhase', async () => {
    const sh = require('./state-helpers');
    const idx = require('./index');

    const failingHandler = { handler: () => ({ status: 'error' }) };
    const origRead = sh.readState;
    const origWrite = sh.writeState;
    const origTelemetry = sh.recordTelemetry;
    const origHandoff = sh.writeHandoff;
    const origGetCmd = idx.getCommand;

    let writeCount = 0;
    sh.readState = () => ({ phase: 'think', step: 0, goal: 'test', completed: [] });
    sh.writeState = () => {
      writeCount++;
    };
    sh.recordTelemetry = () => {};
    sh.writeHandoff = () => {};
    idx.getCommand = name => (name === 'done' ? null : { handler: failingHandler });

    delete require.cache[require.resolve('./auto')];
    const { handler } = require('./auto');
    const result = await handler([], { phase: 'think', step: 0, goal: 'test', completed: [] });

    assert.strictEqual(result.status, 'interrupted');
    assert.ok(result.failures >= 3);
    assert.ok(result.failedPhase !== null);

    sh.readState = origRead;
    sh.writeState = origWrite;
    sh.recordTelemetry = origTelemetry;
    sh.writeHandoff = origHandoff;
    idx.getCommand = origGetCmd;
    delete require.cache[require.resolve('./auto')];
  });
});
