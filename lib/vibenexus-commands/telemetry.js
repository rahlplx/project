const path = require('path');
const { execFileSync } = require('child_process');

const handler = (args, state) => {
  const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
  const telemetryCli = path.join(PROJECT_ROOT, '.vibe', 'lifecycle', 'vibe-telemetry.js');
  const subcommand = args[0] || 'status';

  try {
    execFileSync(process.execPath, [telemetryCli, subcommand, ...args.slice(1)], {
      cwd: PROJECT_ROOT,
      timeout: 30000,
      encoding: 'utf8',
      stdio: 'inherit',
    });
    return { status: 'ok' };
  } catch (e) {
    console.error(`  [telemetry] error: ${e.message}`);
    return { status: 'error', error: e.message };
  }
};

module.exports = { handler };
