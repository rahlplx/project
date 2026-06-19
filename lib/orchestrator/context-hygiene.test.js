const { ContextManager } = require('./context-manager');
const fs = require('fs');
const path = require('path');

async function testContextHygiene() {
  const cm = new ContextManager();

  const oldContext =
    'This is a core context with terminology like Engine, Sub-agent, and Execution. It contains enough words to make shingles work correctly and maintain semantic stability across transitions.';
  const highDriftContext =
    'Completely different stuff about flowers and gardening without any technical terms. Roses are red, violets are blue, this context is new and has nothing to do with the previous one.';
  const lowDriftContext =
    'This is a core context with terminology like Engine, Sub-agent, and Execution. It contains enough words to make shingles work correctly and maintain semantic stability across transitions.';

  console.log('Testing identical update (should pass)...');
  const result1 = cm.updateContextWithSafety(oldContext, lowDriftContext);
  if (result1) {
    console.log('Identical update PASSED.');
  } else {
    console.error('Identical update FAILED (rejected incorrectly).');
    process.exit(1);
  }

  console.log('Testing high drift update (should fail)...');
  const result2 = cm.updateContextWithSafety(oldContext, highDriftContext);
  if (!result2) {
    console.log('High drift update REJECTED as expected. PASSED.');
  } else {
    console.error('High drift update FAILED (accepted incorrectly).');
    process.exit(1);
  }
}

testContextHygiene().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
