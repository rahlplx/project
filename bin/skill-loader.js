#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { registry } = require('../lib/tool-registry');

function loadAllSkills() {
  const skillsDir = path.join(__dirname, '..', 'skills');
  const categories = fs.readdirSync(skillsDir);
  const skills = {};

  for (const cat of categories) {
    const catPath = path.join(skillsDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    const skillDirs = fs.readdirSync(catPath);
    for (const name of skillDirs) {
      const indexPath = path.join(catPath, name, 'index.js');
      if (fs.existsSync(indexPath)) {
        try {
          const mod = require(indexPath);
          let instance;
          if (typeof mod === 'function') {
            instance = new mod();
          } else if (typeof mod === 'object' && mod !== null) {
            instance = mod;
          } else {
            instance = {};
          }
          const entry = { mod, instance, category: cat, name };
          skills[`${cat}/${name}`] = entry;
          registry.register(`${cat}/${name}`, {
            category: cat,
            isUsable: () => fs.existsSync(indexPath),
            description: instance.description || '',
            factory: () => instance,
            metadata: { mod },
          });
        } catch (e) {
          console.error('SKIP: ' + cat + '/' + name + ' - ' + e.message);
        }
      }
    }
  }
  return skills;
}

function discoverTools(skills) {
  const tools = [];
  for (const [key, { instance }] of Object.entries(skills)) {
    const allMethodNames = new Set();
    const proto = Object.getPrototypeOf(instance);
    for (const name of Object.getOwnPropertyNames(proto)) allMethodNames.add(name);
    for (const name of Object.getOwnPropertyNames(instance)) allMethodNames.add(name);
    const methods = [...allMethodNames].filter(
      m =>
        typeof instance[m] === 'function' &&
        m !== 'constructor' &&
        m !== 'toJSON' &&
        !m.startsWith('_')
    );
    for (const method of methods) {
      const toolName = `${key}:${method}`.replace(/\//g, '_');
      tools.push({
        name: toolName,
        description: `${instance.description} — ${method}`,
        inputSchema: {
          type: 'object',
          properties: {
            _args: {
              type: 'array',
              items: { type: 'string' },
              description: 'Positional arguments',
            },
          },
        },
      });
    }
  }
  return tools;
}

function getRegisteredSkills() {
  return registry.getAll();
}

function getUsableSkills(category) {
  return registry.findUsable(category);
}

module.exports = { loadAllSkills, discoverTools, getRegisteredSkills, getUsableSkills };
