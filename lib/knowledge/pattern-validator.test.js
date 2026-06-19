const { describe, test, expect } = require('../jest-compat');

const { validatePattern } = require('./pattern-validator');

describe('pattern validator', () => {
  test('validates a good pattern', () => {
    const pattern = {
      name: 'Auth Pattern',
      category: 'auth',
      description: 'Use NextAuth.js for authentication',
      confidence: 0.8,
    };
    const result = validatePattern(pattern);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('rejects pattern without name', () => {
    const pattern = {
      category: 'auth',
      description: 'Use NextAuth.js for authentication',
      confidence: 0.8,
    };
    const result = validatePattern(pattern);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  test('rejects pattern without category', () => {
    const pattern = {
      name: 'Auth Pattern',
      description: 'Use NextAuth.js for authentication',
      confidence: 0.8,
    };
    const result = validatePattern(pattern);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Category is required');
  });

  test('rejects pattern without description', () => {
    const pattern = {
      name: 'Auth Pattern',
      category: 'auth',
      confidence: 0.8,
    };
    const result = validatePattern(pattern);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Description is required');
  });

  test('rejects pattern with confidence < 0', () => {
    const pattern = {
      name: 'Auth Pattern',
      category: 'auth',
      description: 'Use NextAuth.js for authentication',
      confidence: -0.1,
    };
    const result = validatePattern(pattern);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Confidence must be between 0 and 1');
  });

  test('rejects pattern with confidence > 1', () => {
    const pattern = {
      name: 'Auth Pattern',
      category: 'auth',
      description: 'Use NextAuth.js for authentication',
      confidence: 1.1,
    };
    const result = validatePattern(pattern);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Confidence must be between 0 and 1');
  });

  test('collects multiple errors', () => {
    const pattern = {};
    const result = validatePattern(pattern);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
