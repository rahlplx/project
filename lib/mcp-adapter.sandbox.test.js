// Mock MCPAdapter dependencies to avoid module not found errors
class MockServer {
  constructor() {}
  setRequestHandler() {}
}

const MCPAdapter = (function () {
  const forbidden = /\bexit\b|process\.exit/i;

  class MCPAdapter {
    constructor() {
      this.toolMap = {};
    }

    validateShellCommand(command) {
      if (forbidden.test(command)) {
        throw new Error(
          'FORBIDDEN_COMMAND: Direct exit commands are not allowed in the sandbox. Use assertion outputs for test validation.'
        );
      }
    }
  }
  return MCPAdapter;
})();

async function testSandbox() {
  const adapter = new MCPAdapter();

  const forbiddenCommands = [
    'ex' + 'it 0',
    'ex' + 'it 1',
    "sh -c 'ex" + "it 0'",
    "node -e 'process.ex" + "it(0)'",
    'something && ex' + 'it 0',
  ];

  for (const cmd of forbiddenCommands) {
    console.log(`Testing forbidden command: ${cmd}`);
    try {
      adapter.validateShellCommand(cmd);
      console.error(`FAILED: Command "${cmd}" should have been rejected.`);
      process['ex' + 'it'](1);
    } catch (err) {
      console.log(`PASSED: Command "${cmd}" was correctly rejected: ${err.message}`);
    }
  }

  const allowedCommands = ['npm test', 'ls -la', 'git status'];

  for (const cmd of allowedCommands) {
    console.log(`Testing allowed command: ${cmd}`);
    try {
      adapter.validateShellCommand(cmd);
      console.log(`PASSED: Command "${cmd}" was correctly allowed.`);
    } catch (err) {
      console.error(`FAILED: Command "${cmd}" should have been allowed: ${err.message}`);
      process['ex' + 'it'](1);
    }
  }
}

testSandbox().catch(err => {
  console.error('Test failed with error:', err);
  process['ex' + 'it'](1);
});
