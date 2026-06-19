const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const VIBE_DIR = path.join(PROJECT_ROOT, '.vibenexus');
const STATE_PATH = path.join(VIBE_DIR, 'state.json');
const HANDOFF_PATH = path.join(VIBE_DIR, 'handoff.md');

function ensureVibeDir() {
  if (!fs.existsSync(VIBE_DIR)) fs.mkdirSync(VIBE_DIR, { recursive: true });
}

function readJSON(p) {
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {}
  return null;
}

function writeJSON(p, d) {
  ensureVibeDir();
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
}

function readState() { return readJSON(STATE_PATH); }

function writeState(state) {
  state.updated = new Date().toISOString();
  writeJSON(STATE_PATH, state);
}

function writeHandoff(from, to, context) {
  const content = `# VibeNexus Handoff: ${from} -> ${to}
Timestamp: ${new Date().toISOString()}

## Context
${context}

## Iron Laws
- Zero Slop
- 100% Telemetry
- Zero-Latency Routing
`;
  ensureVibeDir();
  fs.writeFileSync(HANDOFF_PATH, content);
}

const PHASE_ORDER = ['scope', 'build', 'verify', 'ship', 'evolve'];

module.exports = { readState, writeState, writeJSON, writeHandoff, PHASE_ORDER };
