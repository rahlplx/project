#!/usr/bin/env node
const { loadAllSkills, getRegisteredSkills, getUsableSkills } = require('./skill-loader');

const mode = process.argv[2];

if (mode === 'mcp' || mode === '--mcp') {
  require('./mcp-server');
  return;
}

const skills = loadAllSkills();
const keys = Object.keys(skills);

if (!mode || mode === '--help' || mode === '-h') {
  console.log(`
  vibe-stack — 55+ AI agent skills for vibe coders

  USAGE:
    npx vibe-stack <skill-path> <method> [args...]
    npx vibe-stack mcp          (start MCP server for AI agents)
    npx vibe-stack list         (list all skills)
    npx vibe-stack list --all   (list all registered tools)
    npx vibe-stack --help       (this message)

  EXAMPLES:
    npx vibe-stack deploy/one-click-vercel buildDeployCommand .
    npx vibe-stack progress/error-translator translate "ECONNREFUSED"
    npx vibe-stack quality/vibe-review review "const x = 1;"

  PLATFORM CONFIG (for AI agent integration):
    Add to your agent's MCP tools config:
    {
      "mcpServers": {
        "vibe-stack": {
          "command": "npx",
          "args": ["vibe-stack", "mcp"]
        }
      }
    }
`);
  process.exit(0);
}

if (mode === 'list' || mode === 'ls') {
  const filterCat = process.argv[3];
  const showAll = process.argv.includes('--all');
  if (showAll || filterCat === '--all') {
    const all = getRegisteredSkills();
    console.log('\n  All registered tools (' + all.length + '):\n');
    for (const e of all) {
      console.log('  [' + e.category + '] ' + e.name);
    }
    console.log();
    process.exit(0);
  }
  if (filterCat) {
    const usable = getUsableSkills(filterCat);
    console.log('\n  Usable tools in [' + filterCat + '] (' + usable.length + '):\n');
    for (const e of usable) {
      console.log('    ' + e.name);
    }
    console.log();
    process.exit(0);
  }
  const byCat = {};
  for (const key of keys) {
    const cat = key.split('/')[0];
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(key.split('/')[1]);
  }
  console.log('\n  Available skills (' + keys.length + '):\n');
  for (const [cat, names] of Object.entries(byCat)) {
    console.log('  ' + cat + '/');
    names.forEach(n => console.log('    ' + n));
  }
  console.log();
  process.exit(0);
}

const skillKey = mode;
const method = process.argv[3];
const args = process.argv.slice(4);

const entry = skills[skillKey];
if (!entry) {
  console.error('Unknown skill: ' + skillKey);
  console.error('Run: npx vibe-stack list');
  process.exit(1);
}

const { instance } = entry;
if (!method) {
  const proto = Object.getPrototypeOf(instance);
  const methods = Object.getOwnPropertyNames(proto).filter(
    m => typeof instance[m] === 'function' && m !== 'constructor' && m !== 'toJSON'
  );
  console.error('Available methods for ' + skillKey + ': ' + methods.join(', '));
  process.exit(1);
}

if (typeof instance[method] !== 'function') {
  console.error('Unknown method: ' + method);
  process.exit(1);
}

try {
  const result = instance[method](...args);
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
