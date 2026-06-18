const { SubagentDispatch } = require('./subagent-dispatch');

async function testRateLimiter() {
  const dispatch = new SubagentDispatch();
  // Set a small rate for testing: 2 requests per second
  // Bucket starts with 2 tokens.
  dispatch.setRateLimit(2, 1000);

  console.log('Dispatching 5 concurrent requests...');
  const startTime = Date.now();
  const promises = [];

  for (let i = 0; i < 5; i++) {
    const subagent = dispatch.create(`task-${i}`, { task: 'test' });
    promises.push(dispatch.dispatch(subagent, 'test prompt'));
  }

  await Promise.all(promises);
  const duration = Date.now() - startTime;
  console.log(`Total duration: ${duration}ms`);

  // 5 requests with capacity 2 and 2 per second:
  // R1: 0ms
  // R2: 0ms
  // R3: 500ms
  // R4: 1000ms
  // R5: 1500ms
  // Each takes ~100ms to execute.
  // Total duration should be around 1600ms.
  if (duration >= 1500) {
    console.log('PASSED: Requests were spaced out by the rate limiter.');
  } else {
    console.error(`FAILED: Requests were too fast (${duration}ms). Rate limiter not working.`);
    process.exit(1);
  }
}

testRateLimiter().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
