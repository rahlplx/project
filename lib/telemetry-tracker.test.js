const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.resolve(__dirname, '..', '.vibe', 'telemetry', 'tracker.json');

describe('telemetry-tracker', () => {
  let backup = null;

  beforeEach(() => {
    if (fs.existsSync(TRACKER_PATH)) {
      backup = fs.readFileSync(TRACKER_PATH, 'utf8');
    }
  });

  afterEach(() => {
    if (backup !== null) {
      fs.writeFileSync(TRACKER_PATH, backup, 'utf8');
    } else if (fs.existsSync(TRACKER_PATH)) {
      fs.unlinkSync(TRACKER_PATH);
    }
  });

  it('recordCommand tracks command usage', () => {
    const { recordCommand, getTracker } = require('../lib/telemetry-tracker');
    recordCommand('vibe:telemetry');
    recordCommand('vibe:telemetry');
    recordCommand('vibe:build');
    const t = getTracker();
    assert.strictEqual(t.commands_used['vibe:telemetry'], 2);
    assert.strictEqual(t.commands_used['vibe:build'], 1);
  });

  it('recordCorrection increments counter', () => {
    const { recordCorrection, getTracker } = require('../lib/telemetry-tracker');
    recordCorrection();
    recordCorrection();
    const t = getTracker();
    assert.strictEqual(t.times_corrected_ai, 2);
  });

  it('recordClarification increments counter', () => {
    const { recordClarification, getTracker } = require('../lib/telemetry-tracker');
    const before = getTracker().times_asked_clarification;
    recordClarification();
    const t = getTracker();
    assert.strictEqual(t.times_asked_clarification, before + 1);
  });

  it('consumeAndReset returns snapshot and clears tracker', () => {
    const {
      recordCommand,
      recordCorrection,
      consumeAndReset,
      getTracker,
    } = require('../lib/telemetry-tracker');
    recordCommand('vibe:test');
    recordCorrection();
    const snapshot = consumeAndReset();
    assert.strictEqual(snapshot.commands_used['vibe:test'], 1);
    assert.strictEqual(snapshot.times_corrected_ai, 1);
    const fresh = getTracker();
    assert.deepStrictEqual(fresh.commands_used, {});
    assert.strictEqual(fresh.times_corrected_ai, 0);
    assert.strictEqual(fresh.times_asked_clarification, 0);
  });
});
