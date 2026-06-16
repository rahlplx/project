const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:qa \u2014 Browser Testing \u2550\u2550\u2550\n');
  console.log('  Runs browser-based UI tests with Chromium.');
  console.log('  Pipeline: browser-test \u2192 find-bugs \u2192 fix \u2192 regression');
  console.log('\n  \x1b[2mRequires has_ui=true. Install Playwright: npx playwright install chromium\x1b[0m\n');
  return { status: 'reference' };
};

module.exports = { handler };
