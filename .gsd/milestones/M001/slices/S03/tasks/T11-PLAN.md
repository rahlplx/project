# T11 Plan — Write lint-config.test.js

## Objective
Create test that validates ESLint config parses without errors.

## Files to Create
- `lib/lint-config.test.js`

## Test Specification

```javascript
const { Linter } = require('eslint');
const fs = require('fs');
const path = require('path');

describe('ESLint Config', () => {
  let linter;
  let config;
  
  beforeAll(() => {
    linter = new Linter();
    // Load the actual config
    config = require('../../.eslintrc.js');
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
      filename: 'test.js'
    });
    
    // Should not have config parsing errors
    const configErrors = messages.filter(m => m.ruleId === null);
    expect(configErrors).toHaveLength(0);
  });
  
  test('rules are valid rule IDs', () => {
    const ruleIds = Object.keys(config.rules || {});
    for (const ruleId of ruleIds) {
      // Each rule should be loadable by ESLint
      expect(() => {
        linter.defineRule(ruleId, require(`eslint/lib/rules/${ruleId}`));
      }).not.toThrow();
    }
  });
  
  test('ignorePatterns includes node_modules', () => {
    expect(config.ignorePatterns).toContain('node_modules/');
  });
});
```

## Verification
- File exists at `lib/lint-config.test.js`
- `npx jest lib/lint-config.test.js` passes
- Test runs as part of `npm test`
- Catches config regression if `.eslintrc.js` breaks