const { readState } = require('./state-helpers');

const handler = (args, state) => {
  const s = state || readState();
  console.log('\n  ═══ /vibe:done — Pipeline Complete ═══\n');
  console.log(`  Goal: ${s?.goal || '(no goal set)'}`);
  console.log('  Phase reached: done');
  console.log(
    '  Phases completed: think → plan → break → build → harness → review → ship → retro → learn → evolve'
  );
  if (s?.lifecycle?.maintenance_count !== null && s?.lifecycle?.maintenance_count !== undefined) {
    console.log(`  Maintenance cycles: ${s.lifecycle.maintenance_count}`);
  }
  console.log('\n  Next: start a new goal with: node bin/vibe.js think "your next project"');
  console.log('  Or review learnings: node bin/vibe.js telemetry\n');
  return { status: 'done' };
};

module.exports = { handler };
