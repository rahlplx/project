#!/usr/bin/env node
const path = require('path');

// Bootstrap: load all vibenexus commands
const cmdDir = path.resolve(__dirname, '..', 'lib', 'vibenexus-commands');
const { register, validatePhase } = require(path.join(cmdDir, 'index'));
const { readState, writeState, recordTelemetry, advancePhase, writeHandoff, writeJSON } = require(
  path.join(cmdDir, 'state-helpers')
);

// Register basic commands for VibeNexus CLI
const commandDefs = [
  { name: 'auto', desc: 'Full VibeNexus pipeline state machine' },
  { name: 'status', desc: 'Read VibeNexus state and render dashboard' },
  { name: 'help', desc: 'Show VibeNexus command reference' },
  { name: 'harness', desc: 'Production readiness validation' },
  { name: 'maintenance', desc: 'Run VibeNexus auto-maintenance cycle' },
];

for (const def of commandDefs) {
  register(def.name, {
    handler: (args) => {
       console.log(`[VibeNexus] Running ${def.name}...`);
       // Implementation deferred to vibenexus-commands handlers
    },
    description: def.desc,
  });
}

console.log("═══ VibeNexus CLI ═══");
if (process.argv.includes('help')) {
  console.log("Commands:");
  commandDefs.forEach(d => console.log(`  - ${d.name}: ${d.desc}`));
}
