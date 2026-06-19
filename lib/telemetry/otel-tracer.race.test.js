const { getTracer } = require('./otel-tracer');
const fs = require('fs');
const path = require('path');

async function testRaceCondition() {
  const tracer = getTracer('race-test', process.cwd());
  const exportDir = path.join(process.cwd(), '.vibe', 'telemetry', 'otel');
  const spanFile = path.join(exportDir, 'spans.jsonl');

  // Clean up
  if (fs.existsSync(spanFile)) {
    fs.unlinkSync(spanFile);
  }

  console.log('Starting concurrent writes...');
  const iterations = 100;
  const promises = [];

  for (let i = 0; i < iterations; i++) {
    promises.push(
      new Promise(resolve => {
        const span = tracer.startSpan(`span-${i}`);
        // Simulate some work
        setTimeout(() => {
          span.end();
          resolve();
        }, Math.random() * 10);
      })
    );
  }

  await Promise.all(promises);
  console.log('Finished concurrent writes. Waiting for flush...');

  // Wait for the 500ms debounce
  await new Promise(resolve => setTimeout(resolve, 1000));

  const content = fs.readFileSync(spanFile, 'utf8');
  const lines = content.trim().split('\n');
  console.log(`Total spans written: ${lines.length}`);

  if (lines.length !== iterations) {
    console.error(`FAILED: Expected ${iterations} spans, but found ${lines.length}`);
    process.exit(1);
  } else {
    console.log('PASSED: All spans written correctly.');
  }
}

testRaceCondition().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
