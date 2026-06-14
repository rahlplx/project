const { describe, it, beforeEach } = require('node:test');
const assert = require('assert');
const { TokenOptimizer } = require('./token-optimizer');

describe('TokenOptimizer', () => {
  beforeEach(() => {
    TokenOptimizer.setDefaultMaxTokens(4000);
  });

  it('estimates tokens correctly', () => {
    assert.strictEqual(TokenOptimizer.estimateTokens(''), 0);
    assert.strictEqual(TokenOptimizer.estimateTokens('a'), 1);
    assert.strictEqual(TokenOptimizer.estimateTokens('abcd'), 1);
    assert.strictEqual(TokenOptimizer.estimateTokens('abcde'), 2);
    assert.strictEqual(TokenOptimizer.estimateTokens('x'.repeat(400)), 100);
  });

  it('strips ANSI escape codes', () => {
    const input = '\x1b[31mred\x1b[0m text \x1b[1mbold\x1b[0m';
    const output = TokenOptimizer.stripANSI(input);
    assert.strictEqual(output, 'red text bold');
    assert.ok(!output.includes('\x1b['));
  });

  it('handles empty string in stripANSI', () => {
    assert.strictEqual(TokenOptimizer.stripANSI(''), '');
    assert.strictEqual(TokenOptimizer.stripANSI(null), '');
  });

  it('does not truncate when under limit', () => {
    const text = 'short text';
    const result = TokenOptimizer.truncate(text, 1000);
    assert.strictEqual(result.text, 'short text');
    assert.strictEqual(result.truncated, false);
    assert.strictEqual(result.originalTokens, 3); // 10 chars / 4 = 2.5 -> ceil = 3
  });

  it('truncates when over limit', () => {
    const text = 'x'.repeat(20000);
    const result = TokenOptimizer.truncate(text, 1000);
    assert.strictEqual(result.truncated, true);
    assert.ok(result.text.includes('[... truncated'));
    assert.ok(result.originalTokens > 1000);
    assert.ok(result.truncatedTokens > 0);
  });

  it('preserves first 50% and last 20% when truncating', () => {
    const prefix = 'START_';
    const suffix = '_END';
    const middle = 'x'.repeat(20000);
    const text = prefix + middle + suffix;
    const result = TokenOptimizer.truncate(text, 1000);
    assert.ok(result.text.startsWith('START_'));
    assert.ok(result.text.endsWith('_END'));
  });

  it('sanitizes Error objects', () => {
    const err = new Error('ENOENT: File not found');
    err.code = 'ENOENT';
    const sanitized = TokenOptimizer.sanitizeError(err);
    assert.strictEqual(sanitized.message, 'ENOENT: File not found');
    assert.strictEqual(sanitized.code, 'ENOENT');
    assert.ok(sanitized.suggestion.includes('path exists'));
    assert.ok(sanitized.timestamp);
  });

  it('sanitizes plain strings', () => {
    const sanitized = TokenOptimizer.sanitizeError('Something went wrong');
    assert.strictEqual(sanitized.message, 'Something went wrong');
    assert.strictEqual(sanitized.code, -32603);
  });

  it('sanitizes null/undefined', () => {
    const sanitized = TokenOptimizer.sanitizeError(null);
    assert.strictEqual(sanitized.message, 'Unknown error');
    assert.strictEqual(sanitized.code, -32603);
  });

  it('infers suggestions for common errors', () => {
    const econn = TokenOptimizer.sanitizeError(new Error('ECONNREFUSED: connection refused'));
    assert.ok(econn.suggestion.includes('service is running'));

    const eacces = TokenOptimizer.sanitizeError(new Error('EACCES: permission denied'));
    assert.ok(eacces.suggestion.includes('permissions'));

    const enoent = TokenOptimizer.sanitizeError(new Error('ENOENT: no such file'));
    assert.ok(enoent.suggestion.includes('path exists'));

    const json = TokenOptimizer.sanitizeError(new Error('Unexpected token in JSON'));
    assert.ok(json.suggestion.includes('JSON'));
  });

  it('wraps result with truncation', () => {
    const result = { data: 'x'.repeat(20000) };
    const wrapped = TokenOptimizer.wrapResult(result, 1000);
    assert.strictEqual(wrapped.truncated, true);
    assert.ok(wrapped.text.includes('[... truncated'));
  });

  it('wraps error with isError flag', () => {
    const err = new Error('Test error');
    const wrapped = TokenOptimizer.wrapError(err);
    assert.strictEqual(wrapped.isError, true);
    assert.ok(wrapped.content[0].text.includes('Test error'));
    assert.ok(wrapped.content[0].text.includes('suggestion'));
    assert.ok(wrapped.originalError);
  });

  it('configures default max tokens', () => {
    TokenOptimizer.setDefaultMaxTokens(100);
    assert.strictEqual(TokenOptimizer.getDefaultMaxTokens(), 100);
    TokenOptimizer.setDefaultMaxTokens(4000);
  });
});