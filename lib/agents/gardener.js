'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SESSIONS_DIR = path.resolve(__dirname, '../../.vibe/telemetry/sessions');
const RULES_FILE = path.resolve(__dirname, '../../.vibe/rules/gardener-rules.json');

let _sessionId = null;
const _events = [];

/** Returns or creates the current session ID (resets per process). */
function sessionId() {
  if (!_sessionId) _sessionId = crypto.randomBytes(8).toString('hex');
  return _sessionId;
}

/**
 * Tracks a gardener event (prompt, subagent call, skill invocation, context snapshot).
 * Appends to in-memory log and flushes to .vibe/telemetry/sessions/garden-{date}.json.
 */
function track(event) {
  if (!event || typeof event !== 'object') return;
  const entry = {
    sessionId: sessionId(),
    ts: Date.now(),
    ...event,
  };
  _events.push(entry);
  _flush();
  _evolveRules(entry);
  return entry;
}

function _flush() {
  try {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const file = path.join(SESSIONS_DIR, `garden-${date}.json`);
    const existing = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, 'utf8'))
      : { sessions: [] };
    const otherEvents = Array.isArray(existing.sessions)
      ? existing.sessions.filter(e => e.sessionId !== sessionId())
      : [];
    existing.sessions = [...otherEvents, ..._events];
    fs.writeFileSync(file, JSON.stringify(existing, null, 2) + '\n', 'utf8');
  } catch {
    /* non-fatal */
  }
}

/**
 * Self-wiring: after each event, update gardener-rules.json with observed
 * patterns (prompt types, subagent call frequency, skill hotspots).
 */
function _evolveRules(entry) {
  try {
    fs.mkdirSync(path.dirname(RULES_FILE), { recursive: true });
    const rules = fs.existsSync(RULES_FILE)
      ? JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'))
      : { version: 1, patterns: {}, connectors: [] };

    const type = entry.type || 'unknown';
    rules.patterns[type] = (rules.patterns[type] || 0) + 1;

    if (entry.skill && !rules.connectors.includes(entry.skill)) {
      rules.connectors.push(entry.skill);
    }

    rules.last_updated = new Date().toISOString();
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2) + '\n', 'utf8');
  } catch {
    /* non-fatal */
  }
}

/** Returns current in-memory event log for this session. */
function getLog() {
  return [..._events];
}

/** Returns the evolved rules snapshot. */
function getRules() {
  try {
    return fs.existsSync(RULES_FILE) ? JSON.parse(fs.readFileSync(RULES_FILE, 'utf8')) : null;
  } catch {
    return null;
  }
}

module.exports = { track, sessionId, getLog, getRules };
