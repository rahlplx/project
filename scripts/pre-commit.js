#!/usr/bin/env node
/**
 * Pre-commit hook for vibenexus.
 * To install: copy or symlink to .git/hooks/pre-commit
 * Or run: npx husky (if installed)
 *
 * Checks:
 * 1. YAML validity of catalog/tools.yaml
 * 2. File naming in skills/ and catalog/
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let exitCode = 0;

const changedFiles = execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' })
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean);

// Check 1: YAML validation on tools.yaml changes
if (changedFiles.some(f => f === 'catalog/tools.yaml' || f.startsWith('catalog/'))) {
  try {
    const yaml = fs.readFileSync('catalog/tools.yaml', 'utf8');
    require('js-yaml').load(yaml);
    console.log('  OK  catalog/tools.yaml is valid YAML');
  } catch (e) {
    console.error('  FAIL catalog/tools.yaml is not valid YAML:', e.message);
    exitCode = 1;
  }
}

// Check 2: File naming convention (kebab-case)
const namingViolations = changedFiles.filter(f => {
  const base = path.basename(f);
  return (
    (f.startsWith('skills/') || f.startsWith('catalog/')) &&
    /[A-Z_]/.test(base) &&
    !base.startsWith('AGENTS')
  );
});

if (namingViolations.length > 0) {
  console.warn('  WARN Files not in kebab-case:', namingViolations.join(', '));
}

process.exit(exitCode);
