const { readState } = require('./state-helpers');

// Command registry: maps command name to handler, phase, description, and reference
const registry = {};

function register(name, opts) {
  registry[name] = {
    handler: opts.handler,
    phase: opts.phase || null,
    description: opts.description || '',
    ref: opts.ref || `references/vibe-${name}.md`,
    aliases: opts.aliases || [],
    conditional: opts.conditional || false,  // requires has_ui
    category: opts.category || 'phase'       // phase|utility|orchestration
  };
  for (const alias of registry[name].aliases) {
    registry[alias] = registry[name];
  }
}

function getCommand(name) {
  return registry[name] || null;
}

function listCommands(category) {
  const all = Object.entries(registry)
    .filter(([, cmd]) => !cmd.aliases.includes(category)) // filter out aliases
    .filter(([key]) => !registry[key]?.aliases?.includes(key)); // no alias keys
  const seen = new Set();
  const unique = [];
  for (const [name, cmd] of all) {
    if (seen.has(cmd)) continue;
    seen.add(cmd);
    unique.push({ name, ...cmd });
  }
  if (category) return unique.filter(c => c.category === category);
  return unique;
}

function validatePhase(commandName, state) {
  const cmd = getCommand(commandName);
  if (!cmd || !cmd.phase) return { valid: true, message: null };

  const current = state.phase || 'think';
  const PHASE_ORDER = ['think', 'plan', 'break', 'build', 'harness', 'review', 'ship', 'retro', 'learn', 'evolve', 'done'];
  const currentIdx = PHASE_ORDER.indexOf(current);
  const cmdIdx = PHASE_ORDER.indexOf(cmd.phase);

  if (cmdIdx <= currentIdx) return { valid: true, message: null };
  if (cmdIdx === currentIdx + 1) return { valid: true, nextPhase: cmd.phase, message: null };

  return {
    valid: true,
    message: `\u26a0 Current phase is '${current}'. Expected '${cmd.phase}'. Use --force to run anyway.`
  };
}

module.exports = { register, getCommand, listCommands, validatePhase, registry };
