const { StateMachine } = require('./state-machine');
const { ContextManager } = require('./context-manager');
const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(process.cwd(), '.vibe', 'state.json');

async function testZombieDeadlock() {
  // Clean up
  if (fs.existsSync(STATE_PATH)) {
    fs.unlinkSync(STATE_PATH);
  }

  const sm = new StateMachine();
  const cm = new ContextManager();

  console.log('Setting state to PENDING...');
  sm.state.status = 'PENDING';
  sm.state.lastHeartbeat = Date.now();
  sm.saveState();

  console.log('Verifying initial state...');
  if (sm.state.status !== 'PENDING') {
    throw new Error('Failed to set initial PENDING state');
  }

  // Simulate 20 seconds passing
  console.log('Simulating 20 seconds passing...');
  sm.state.lastHeartbeat = Date.now() - 20000;
  sm.saveState();

  // The state machine should now detect the zombie state
  console.log('Checking for zombie state...');
  sm.checkHeartbeat(); // This is the method we need to implement

  console.log('Current state phase:', sm.state.phase);
  console.log('Current state status:', sm.state.status);

  if (sm.state.phase === 'error_recovery' && sm.state.status === 'ERROR_RECOVERY') {
    console.log('PASSED: Zombie state deadlock terminated and transitioned to ERROR_RECOVERY.');
  } else {
    console.error('FAILED: State machine did not transition to ERROR_RECOVERY.');
    process.exit(1);
  }
}

testZombieDeadlock().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
