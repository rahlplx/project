'use strict';
const { describe, test, expect, beforeEach } = require('../jest-compat');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ── Gardener ────────────────────────────────────────────────────────────────
describe('gardener agent', () => {
  let gardener;
  let tmpDir;

  beforeEach(() => {
    // Fresh require per test (reset module state)
    Object.keys(require.cache).forEach(k => { if (k.includes('gardener')) delete require.cache[k]; });

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'garden-test-'));
    // Patch SESSIONS_DIR and RULES_FILE via env isn't possible without refactor,
    // so just test the exported API shape
    gardener = require('./gardener');
  });

  test('track returns entry with sessionId and ts', () => {
    const entry = gardener.track({ type: 'prompt', payload: 'hello' });
    expect(entry).toBeDefined();
    expect(typeof entry.sessionId).toBe('string');
    expect(entry.sessionId.length).toBe(16);
    expect(typeof entry.ts).toBe('number');
    expect(entry.type).toBe('prompt');
  });

  test('sessionId is stable within same process', () => {
    const id1 = gardener.sessionId();
    const id2 = gardener.sessionId();
    expect(id1).toBe(id2);
  });

  test('getLog returns tracked events', () => {
    gardener.track({ type: 'subagent', skill: 'vibe-review' });
    const log = gardener.getLog();
    expect(log.length).toBeGreaterThan(0);
    expect(log[log.length - 1].type).toBe('subagent');
  });

  test('track ignores non-object input', () => {
    const result = gardener.track(null);
    expect(result).toBeUndefined();
  });
});

// ── Security Guard ───────────────────────────────────────────────────────────
describe('security-guard agent', () => {
  let guard;

  beforeEach(() => {
    guard = require('./security-guard');
  });

  test('scan returns expected shape', () => {
    const result = guard.scan({ rootDir: path.resolve(__dirname, '../..') });
    expect(typeof result.scanned).toBe('number');
    expect(Array.isArray(result.findings)).toBe(true);
    expect(typeof result.evolvedRules).toBe('number');
    expect(typeof result.timestamp).toBe('string');
  });

  test('scan finds no high-severity issues in lib/ (excluding audit rule descriptions)', () => {
    const result = guard.scan({ rootDir: path.resolve(__dirname, '../..') });
    // Filter out skills/quality/security-audit/* — those files describe the patterns, not use them
    const highSeverity = result.findings.filter(f =>
      (f.id === 'A02-weak-hash' || f.id === 'A07-hardcoded-secret') &&
      !f.file.includes('security-audit') &&
      f.file.startsWith('lib/')
    );
    expect(highSeverity.length).toBe(0);
  });
});

// ── Injection Menu ───────────────────────────────────────────────────────────
describe('injection-menu', () => {
  let menu;

  beforeEach(() => {
    Object.keys(require.cache).forEach(k => { if (k.includes('injection-menu')) delete require.cache[k]; });
    menu = require('./injection-menu');
  });

  test('default mode is adaptive', () => {
    expect(menu.getMode()).toBe('adaptive');
  });

  test('setMode changes mode', () => {
    menu.setMode('on');
    expect(menu.getMode()).toBe('on');
  });

  test('setMode rejects invalid mode', () => {
    expect(() => menu.setMode('invalid')).toThrow('Invalid mode');
  });

  test('shouldInject on=true always', () => {
    menu.setMode('on');
    expect(menu.shouldInject('anything', 'vibe-plan')).toBe(true);
  });

  test('shouldInject off=false always', () => {
    menu.setMode('off');
    expect(menu.shouldInject('deploy my app', 'vibe-deploy')).toBe(false);
  });

  test('shouldInject adaptive triggers on keyword', () => {
    menu.setMode('adaptive');
    expect(menu.shouldInject('can you review my code', 'vibe-review')).toBe(true);
  });

  test('shouldInject adaptive triggers on explicit slash command', () => {
    menu.setMode('adaptive');
    expect(menu.shouldInject('/vibe-security scan my app', 'vibe-security')).toBe(true);
  });

  test('shouldInject adaptive skips irrelevant message', () => {
    menu.setMode('adaptive');
    expect(menu.shouldInject('what time is it', 'vibe-plan')).toBe(false);
  });

  test('caveman defaults to active', () => {
    expect(menu.isCavemanActive()).toBe(true);
  });

  test('menuStatus includes mode and caveman', () => {
    const status = menu.menuStatus();
    expect(status).toContain('adaptive');
    expect(status).toContain('caveman');
  });
});
