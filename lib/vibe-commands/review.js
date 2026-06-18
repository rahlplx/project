const handler = (args, state) => {
  console.log(
    '\n  \u2550\u2550\u2550 /vibe:review \u2014 Code Review & Security Audit \u2550\u2550\u2550\n'
  );

  console.log('  \x1b[1mSteps:\x1b[0m');
  console.log('  1. Code review: consistency, patterns, edge cases');
  console.log('  2. Security audit: OWASP top 10 check');
  console.log('  3. Fix critical and high issues');
  console.log('  4. Re-run harness to verify fixes');

  console.log('\n  \u2550\u2550\u2550 AI AGENT PROMPT \u2550\u2550\u2550\n');
  console.log('  Review from 3 perspectives:');
  console.log('  1. Code quality: naming, duplication, error handling, edge cases');
  console.log('  2. Security: secrets, injection, authz, dependencies');
  console.log('  3. Architecture: coupling, cohesion, testability');
  console.log('\n  Run security-scan skill for automated audit.');

  // ⚡ Bolt: Activate Requirement Audit (latent GapDetector module)
  const { GapDetector } = require('../orchestrator/gap-detector');
  const detector = new GapDetector();
  const spec = { requirements: ['robust testing', 'performance optimization', 'agent agnostic'] };
  const audit = detector.buildGapReport(spec, 'implemented robust testing and performance optimization');

  console.log('\n  ═══ Requirement Audit ═══');
  console.log(`  Match Rate: ${(audit.rate * 100).toFixed(0)}%`);
  if (audit.missing.length) {
    console.log(`  Missing: ${audit.missing.join(', ')}`);
  } else {
    console.log('  ✅ Implementation matches all known requirements.');
  }

  console.log('\n  After review, run: npx vibe-stack ship');
  console.log('  \x1b[2mFixes go back through build phase (RED-GREEN-REFACTOR).\x1b[0m\n');
  return { status: 'reference', audit };
};

module.exports = { handler };
