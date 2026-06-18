const { listCommands, getCommand } = require('./index');
const { getProjectInfo, readState } = require('./state-helpers');

function showHelp(commandName) {
  if (commandName) {
    const cmd = getCommand(commandName);
    if (!cmd) {
      console.log(`Unknown command: ${commandName}`);
      return;
    }
    console.log(`\n  ${commandName} — ${cmd.description}`);
    console.log(`  Reference: ${cmd.ref}`);
    if (cmd.phase) console.log(`  Phase: ${cmd.phase}`);
    if (cmd.aliases.length) console.log(`  Aliases: ${cmd.aliases.join(', ')}`);
    console.log();
    return;
  }

  const state = readState();
  const info = getProjectInfo(state);

  console.log(`\n  \x1b[1mvibe-stack\x1b[0m — ${info.project}`);
  console.log(`  Phase: ${info.phase} | Mode: ${info.mode} | Agent: ${info.agent}`);
  console.log(`  Skills: ${info.skills} | Tests: ${info.tests} | Tools: ${info.tools}\n`);

  console.log('  \x1b[1mPhase Commands:\x1b[0m');
  for (const cmd of listCommands('phase')) {
    const active = cmd.phase === info.phase ? ' \x1b[32m<-- current\x1b[0m' : '';
    console.log(`    ${cmd.name.padEnd(14)} ${cmd.description}${active}`);
  }

  console.log('\n  \x1b[1mUtility Commands:\x1b[0m');
  for (const cmd of listCommands('utility')) {
    console.log(`    ${cmd.name.padEnd(14)} ${cmd.description}`);
  }

  console.log('\n  \x1b[1mOrchestration Commands:\x1b[0m');
  for (const cmd of listCommands('orchestration')) {
    console.log(`    ${cmd.name.padEnd(14)} ${cmd.description}`);
  }

  console.log('\n  \x1b[1mSkill Commands:\x1b[0m');
  console.log('    npx vibe-stack <skill-path> <method> [args]');
  console.log('    npx vibe-stack mcp');
  console.log('    npx vibe-stack list\n');

  console.log('  \x1b[1mPhase Pipeline:\x1b[0m');
  console.log(
    '    think → plan → break → build → harness → review → ship → retro → learn → evolve → done'
  );
  console.log('    (design runs during break if has_ui, qa runs during review if has_ui)');
  console.log('\n  \x1b[1mFlags:\x1b[0m');
  console.log('    --backtrack    Allow running a phase earlier than the current phase');
  console.log('                   e.g. node bin/vibe.js think --backtrack');
  console.log('    --from=<phase> Resume auto pipeline from a specific phase after failure');
  console.log('                   e.g. node bin/vibe.js auto --from=build\n');
}

const handler = args => {
  showHelp(args[0]);
  return { status: 'ok' };
};

module.exports = { handler, showHelp };
