const { describe, it } = require('node:test');
const assert = require('node:assert');
const { scanCode, COMPLEXITY_THRESHOLD } = require('./complexity-scan');

describe('complexity-scan', () => {
  it('should return clean for simple code', () => {
    const code = 'function greet(name) {\n  return "hello " + name;\n}';
    const result = scanCode(code);
    assert.strictEqual(result.clean, true);
    assert.strictEqual(result.findings.length, 0);
  });

  it('should flag a deeply branched function', () => {
    const code = `
function process(x) {
  if (x > 0) {
    if (x > 10) {
      for (let i = 0; i < x; i++) {
        if (i % 2 === 0) {
          while (i > 0) {
            if (i && x) {
              switch(i) {
                case 1: break;
                default: break;
              }
            }
            i--;
          }
        }
      }
    }
  }
}`;
    const result = scanCode(code);
    assert.ok(result.findings.length > 0);
    assert.ok(result.findings[0].score >= COMPLEXITY_THRESHOLD);
  });

  it('should report the threshold in results', () => {
    const result = scanCode('function x() {}');
    assert.strictEqual(result.threshold, COMPLEXITY_THRESHOLD);
  });

  it('should count high-complexity findings separately', () => {
    const code = `
function f(a, b, c, d, e, f) {
  if (a) { if (b) { if (c) { if (d) { if (e && f || a) { return 1; } } } } }
  if (a && b && c) { for (let i = 0; i < 10; i++) { if (i % 2) { } } }
  return 0;
}`;
    const result = scanCode(code);
    assert.strictEqual(typeof result.highComplexity, 'number');
  });

  it('should handle empty input gracefully', () => {
    assert.doesNotThrow(() => scanCode(''));
    assert.doesNotThrow(() => scanCode(null));
  });
});
