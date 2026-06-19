#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const cmdDir = path.resolve(__dirname, '..', 'lib', 'vibenexus-commands');
const { readState, writeState } = require(path.join(cmdDir, 'state-helpers'));

function loadHandler(name) {
  const p = path.join(cmdDir, name + '.js');
  if (fs.existsSync(p)) return require(p);
  return null;
}

const mode = process.argv[2] || 'help';
const args = process.argv.slice(3);

console.log("═══ VibeNexus Core ═══");

const handlerMod = loadHandler(mode);
if (handlerMod && handlerMod.handler) {
  const state = readState() || { phase: 'scope', step: 0 };
  handlerMod.handler(args, state).then(res => {
    if (res && res.status === 'error') process.exit(1);
    process.exit(0);
  }).catch(err => {
    console.error("Fatal Error:", err.message);
    process.exit(1);
  });
} else {
  console.log("Commands: auto, status, harness, maintenance, help");
  if (mode !== 'help') {
    console.log("Unknown command:", mode);
    process.exit(1);
  }
}
