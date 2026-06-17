const path = require('path');
const fs = require('fs');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:detect \u2014 Stack Detection \u2550\u2550\u2550\n');

  const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
  const pkgPath = path.join(PROJECT_ROOT, 'package.json');
  let framework = 'unknown',
    language = 'unknown',
    testFramework = 'unknown',
    buildCommand = null;

  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    language = 'javascript';

    if (pkg.devDependencies?.typescript || pkg.dependencies?.typescript) language = 'typescript';
    if (pkg.scripts?.test) {
      const t = pkg.scripts.test;
      if (t.includes('jest')) testFramework = 'jest';
      else if (t.includes('vitest')) testFramework = 'vitest';
      else if (t.includes('mocha')) testFramework = 'mocha';
      else if (t.includes('node --test') || t.includes('node--test')) testFramework = 'node:test';
      else testFramework = t;
    }
    if (pkg.scripts?.build) buildCommand = pkg.scripts.build;
    if (pkg.scripts?.dev)
      {framework = pkg.scripts.dev.includes('next')
        ? 'next'
        : pkg.scripts.dev.includes('vite')
          ? 'vite'
          : 'node';}
  }

  const tsconfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) language = 'typescript';

  console.log(`  Framework:     ${framework}`);
  console.log(`  Language:      ${language}`);
  console.log(`  Test:          ${testFramework}`);
  console.log(`  Build:         ${buildCommand || '(none)'}`);

  const stackFile = path.join(PROJECT_ROOT, '.vibe', 'stack.json');
  const stack = {
    framework,
    language,
    testFramework,
    testCommand: `npx ${testFramework}`,
    buildCommand,
    lintCommand: null,
  };
  fs.writeFileSync(stackFile, JSON.stringify(stack, null, 2) + '\n', 'utf8');
  console.log('\n  Written to .vibe/stack.json');
  return { status: 'ok', stack };
};

module.exports = { handler };
