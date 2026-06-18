#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');
const { readdirSync, readFileSync, statSync } = require('fs');
const path = require('path');

const LIB_DIR = path.resolve(__dirname, '..', 'lib');

function glob(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...glob(full));
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      results.push(full);
    }
  }
  return results;
}

function usesNodeTest(file) {
  try {
    const content = readFileSync(file, 'utf8');
    return content.includes("require('node:test')") || content.includes('jest-compat');
  } catch {
    return false;
  }
}

const files = glob(LIB_DIR).filter(usesNodeTest);

if (!files.length) {
  console.log('No node:test files found.');
  process.exit(0);
}

console.log(`Running ${files.length} node:test files...`);

try {
  execFileSync('node', ['--test', ...files], { stdio: 'inherit', timeout: 180000 });
} catch (e) {
  process.exit(e.status || 1);
}
