const { describe, test, expect, beforeAll } = require('./jest-compat');
const { Linter } = require('eslint');
const config = require('../.eslintrc.js');

describe('ESLint Config', () => {
  let linter;

  beforeAll(() => {
    linter = new Linter();
  });

  test('config is valid object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  test('config has required properties', () => {
    expect(config.env).toBeDefined();
    expect(config.parserOptions).toBeDefined();
    expect(config.rules).toBeDefined();
    expect(config.ignorePatterns).toBeDefined();
  });

  test('config parses without errors', () => {
    const testCode = `
      const x = 1;
      function foo() { return x; }
      module.exports = foo;
    `;

    const messages = linter.verify(testCode, config, {
      filename: 'test.js',
    });

    const configErrors = messages.filter(m => m.ruleId === null);
    expect(configErrors).toHaveLength(0);
  });

  test('ignorePatterns includes node_modules', () => {
    expect(config.ignorePatterns).toContain('node_modules/');
  });

  test('no-unused-vars is warn level', () => {
    expect(config.rules['no-unused-vars'][0]).toBe('warn');
  });

  test('prefer-const is warn level', () => {
    expect(config.rules['prefer-const']).toBe('warn');
  });
});
