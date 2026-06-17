const path = require('path');

const handler = (args, state) => {
  try {
    const { main } = require(
      path.resolve(__dirname, '..', '..', '.vibe', 'lifecycle', 'auto-maintain')
    );
    return main().then(result => ({ status: 'ok', ...result }));
  } catch (e) {
    console.error(`  [maintenance] ERROR: ${e.message}`);
    return { status: 'error', error: e.message };
  }
};

module.exports = { handler };
