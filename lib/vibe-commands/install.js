const path = require('path');
const { detectIDE, installForIDE, syncToIDE } = require('../install-ide');

const IDE_FLAGS = {
  '--cursor': 'cursor',
  '--windsurf': 'windsurf',
  '--claude-code': 'claude-code',
};

const handler = (args = [], state) => {
  const projectRoot = process.cwd();
  const requested = args.map(a => IDE_FLAGS[a]).filter(Boolean);

  let targets;
  if (args.includes('--all')) {
    targets = ['cursor', 'windsurf', 'claude-code'];
  } else if (requested.length) {
    targets = requested;
  } else {
    const detected = detectIDE(projectRoot);
    if (!detected) {
      console.log(
        '  [install] Could not auto-detect an IDE. Pass --cursor, --windsurf, --claude-code, or --all.'
      );
      return { status: 'no-target' };
    }
    targets = [detected.name];
  }

  const results = {};
  for (const name of targets) {
    const ide = {
      name,
      configDir: path.join(projectRoot, name === 'claude-code' ? '.claude' : '.' + name),
      rulesFormat: name === 'cursor' ? '.mdc' : '.md',
    };

    const ruleResult = installForIDE(ide, projectRoot);
    let skillResult = null;
    if (name === 'claude-code') {
      skillResult = syncToIDE(ide, path.join(projectRoot, 'skills'));
    }

    results[name] = { rules: ruleResult, skills: skillResult };
    console.log(
      `\n  [install:${name}] Rules written: ${ruleResult.written.length}, errors: ${ruleResult.errors.length}`
    );
    if (skillResult) {
      console.log(
        `  [install:${name}] Skills synced: ${skillResult.written.length}, skipped: ${skillResult.skipped.length}`
      );
    }
  }

  console.log();
  return { status: 'ok', results };
};

module.exports = { handler };
