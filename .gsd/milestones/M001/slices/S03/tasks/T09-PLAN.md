# T09 Plan — Create .eslintrc.js

## Objective
Create ESLint config with minimal rules (8-10) to catch real issues without false positives.

## Files to Create
- `.eslintrc.js`

## Config Specification

```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs'
  },
  rules: {
    // Possible Errors
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-constant-condition': 'warn',
    
    // Best Practices
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    
    // Variables
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Style
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'no-trailing-spaces': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    '.vibe/',
    'coverage/',
    '*.test.js'
  ]
};
```

## Rules Rationale

| Rule | Level | Why |
|------|-------|-----|
| no-unused-vars | error | Catches dead code; ignore `_` prefix for intentional unused |
| no-constant-condition | warn | Catches `if (true)` but allows `while (true)` |
| eqeqeq | error | Enforces `===` over `==` |
| no-eval | error | Security |
| prefer-const | error | Modern JS best practice |
| no-var | error | No `var` in modern code |
| semi | error | Consistent semicolons |
| quotes | error | Single quotes, avoid escapes |
| no-trailing-spaces | error | Clean diffs |

## Verification
- File exists at `.eslintrc.js`
- `npx eslint --print-config .eslintrc.js` succeeds
- `npm run lint` exits 0 with 0 errors
- No false positives on existing codebase