const { test } = require('node:test');
const assert = require('node:assert/strict');
const { SubagentDispatch } = require('./subagent-dispatch');
const { sanitizeText } = require('../intent-capture');

test('sanitizeText strips control characters before buildNonInteractivePrompt', () => {
  const d = new SubagentDispatch();
  const malicious = 'do task\x00\x08\x0b\x0c\x0e hidden override';
  const sanitized = sanitizeText(malicious, 8000);
  assert.ok(!sanitized.includes('\x00'), 'null byte not stripped');
  assert.ok(!sanitized.includes('\x08'), 'backspace not stripped');
  const built = d.buildNonInteractivePrompt(sanitized, 'opencode');
  assert.ok(built.includes('do task'), 'clean content preserved');
  assert.ok(!built.includes('\x00'), 'null byte absent from built prompt');
});

test('sanitizeText enforces max prompt length of 8000 chars', () => {
  const huge = 'x'.repeat(20000);
  const sanitized = sanitizeText(huge, 8000);
  assert.ok(sanitized.length <= 8000, `prompt not bounded: ${sanitized.length}`);
});
