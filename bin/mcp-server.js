#!/usr/bin/env node
const { loadAllSkills } = require('./skill-loader');
const { createMCPServer } = require('../lib/mcp-adapter');

async function main() {
  const skills = loadAllSkills();
  const server = createMCPServer(skills);
  await server.start();
}

main().catch(err => {
  console.error('MCP Server failed to start:', err);
  process.exit(1);
});
