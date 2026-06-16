const path = require('path');

const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:harness \u2014 Production Readiness Gate \u2550\u2550\u2550\n');
  try {
    const { runHarness } = require(path.resolve(__dirname, '..', '..', '.vibe', 'lifecycle', 'auto-maintain'));
    const results = runHarness();
    let passCount = 0, failCount = 0;
    for (const r of results) {
      const icon = r.pass ? '\u2713' : '\u2717';
      console.log(`  ${icon} ${r.check}: ${r.pass ? 'pass' : 'FAIL'}`);
      passCount += r.pass ? 1 : 0;
      failCount += r.pass ? 0 : 1;
    }
    const allPassed = failCount === 0;
    console.log(`\n  Result: ${passCount}/${results.length} passed${failCount > 0 ? `, ${failCount} failed` : ''}`);
    console.log(`  Health: ${allPassed ? '\u2713 ALL CHECKS PASS' : '\u2717 GATE NOT CLEARED'}\n`);

    if (!allPassed) {
      console.log('  \x1b[2mFix failures above, then re-run: npx vibe-stack harness\x1b[0m\n');
    }
    return { status: allPassed ? 'pass' : 'fail', results };
  } catch (e) {
    console.error(`  [harness] ERROR: ${e.message}`);
    return { status: 'error', error: e.message };
  }
};

module.exports = { handler };
