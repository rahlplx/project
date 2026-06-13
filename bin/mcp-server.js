#!/usr/bin/env node
const readline = require('readline');
const { loadAllSkills, discoverTools } = require('./skill-loader');

const skills = loadAllSkills();
const tools = discoverTools(skills);
const toolMap = {};
for (const [key, { instance }] of Object.entries(skills)) {
  const allNames = new Set();
  const proto = Object.getPrototypeOf(instance);
  for (const n of Object.getOwnPropertyNames(proto)) allNames.add(n);
  for (const n of Object.getOwnPropertyNames(instance)) allNames.add(n);
  const methods = [...allNames].filter(m =>
    typeof instance[m] === 'function' && m !== 'constructor' && m !== 'toJSON' && !m.startsWith('_')
  );
  for (const method of methods) {
    const toolName = `${key}:${method}`.replace(/\//g, '_');
    toolMap[toolName] = { instance, method };
  }
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on('line', line => {
  let req;
  try { req = JSON.parse(line.trim()); } catch { return; }

  const { id, method, params } = req;

  switch (method) {
    case 'initialize':
      send({
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'vibe-stack', version: '1.0.0' }
        }
      });
      break;

    case 'notifications/initialized':
      break;

    case 'tools/list':
      send({ jsonrpc: '2.0', id, result: { tools } });
      break;

    case 'tools/call': {
      const { name, arguments: args } = params;
      const entry = toolMap[name];
      if (!entry) {
        send({ jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool: ${name}` } });
        break;
      }
      try {
        const result = entry.instance[entry.method](...(args?._args || []));
        send({
          jsonrpc: '2.0', id,
          result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
        });
      } catch (err) {
        send({ jsonrpc: '2.0', id, error: { code: -32603, message: err.message } });
      }
      break;
    }

    case 'ping':
      send({ jsonrpc: '2.0', id, result: {} });
      break;

    default:
      send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method: ${method}` } });
  }
});
