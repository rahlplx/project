#!/usr/bin/env node

/**
 * /vibe:learn capture - Record learnings during build phase
 * 
 * Usage:
 *   vibe:learn capture pattern "Name" "Problem" "Solution"
 *   vibe:learn capture anti-pattern "Name" "Symptom" "Root Cause"
 *   vibe:learn capture workaround "Desc" "Fix"
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const LEARNINGS_DIR = path.join(ROOT, '.vibe', 'learnings');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function capturePattern(name, problem, solution, whenToUse) {
  const slug = slugify(name);
  const filePath = path.join(LEARNINGS_DIR, 'patterns', `${slug}.md`);
  
  if (fs.existsSync(filePath)) {
    console.log(`Pattern '${name}' already exists at ${filePath}`);
    return;
  }

  const content = `# Pattern: ${name}

## Problem
${problem}

## Solution
${solution}

## When to Use
${whenToUse || 'Not specified'}

## Files Changed
-

## Tested On
${new Date().toISOString().split('T')[0]}
`;

  ensureDir(path.join(LEARNINGS_DIR, 'patterns'));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Pattern saved: ${filePath}`);
}

function captureAntiPattern(name, symptom, rootCause, prevention) {
  const slug = slugify(name);
  const filePath = path.join(LEARNINGS_DIR, 'anti-patterns', `${slug}.md`);

  if (fs.existsSync(filePath)) {
    console.log(`Anti-pattern '${name}' already exists at ${filePath}`);
    return;
  }

  const content = `# Anti-Pattern: ${name}

## Symptom
${symptom}

## Root Cause
${rootCause}

## How vibenexus Should Catch It
${prevention || 'Add to harness or review phase'}

## Incident
${new Date().toISOString().split('T')[0]}
`;

  ensureDir(path.join(LEARNINGS_DIR, 'anti-patterns'));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Anti-pattern saved: ${filePath}`);
}

// Main
const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
  case 'pattern':
    if (args.length < 4) {
      console.log('Usage: vibe:learn capture pattern "Name" "Problem" "Solution" ["When to Use"]');
      process.exit(1);
    }
    capturePattern(args[1], args[2], args[3], args[4]);
    break;

  case 'anti-pattern':
    if (args.length < 4) {
      console.log('Usage: vibe:learn capture anti-pattern "Name" "Symptom" "Root Cause" ["Prevention"]');
      process.exit(1);
    }
    captureAntiPattern(args[1], args[2], args[3], args[4]);
    break;

  default:
    console.log(`
/vibe:learn capture — Record learnings during build

Usage:
  vibe:learn capture pattern "Name" "Problem" "Solution" ["When to Use"]
  vibe:learn capture anti-pattern "Name" "Symptom" "Root Cause" ["Prevention"]

Examples:
  vibe:learn capture pattern "Rate Limiting Middleware" "API rate limits cause 429 errors" "Add express-rate-limit to all routes" "Any Express API project"
  vibe:learn capture anti-pattern "API Keys in Frontend" "API keys exposed in client bundle" "Keys hardcoded in .env files shipped to client" "Add security-scan harness check"
`);
    process.exit(1);
}