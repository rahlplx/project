# Anti-Pattern: ESLint no-control-regex for ANSI Patterns

## Symptom
ESLint `no-control-regex` rule fires on regex patterns containing `\x1b` (escape character). Used in ANSI strip functions for terminal output cleaning.

## Root Cause
ESLint's `no-control-regex` rule disallows control characters in regex patterns. ANSI escape sequences start with `\x1b` (ESC), which triggers this rule even when the regex is intentionally matching ANSI codes.

## How vibe-stack Should Catch It
1. **ESLint config override** - Add rule exception for files that legitimately use ANSI patterns
2. **Alternative approach** - Use `String.fromCharCode(27)` in an IIFE to avoid the literal in source
3. **Lint exception comment** - `// eslint-disable-next-line no-control-regex` with justification

## Example
```javascript
// BAD - triggers no-control-regex
const ansiRegex = /\x1b\[[0-9;]*m/g;

// GOOD - IIFE avoids literal
const ansiRegex = (() => {
  const esc = String.fromCharCode(27);
  return new RegExp(esc + '\\[[0-9;]*m', 'g');
})();
```

## Incident
vibe-stack, 2026-06-14: token-optimizer.js ANSI regex triggered ESLint error. Fixed with IIFE pattern.

## Prevention
- Add `no-control-regex` exception to `.eslintrc.js` for lib/ files
- Document IIFE pattern in coding standards
- Use utility function for ANSI stripping instead of inline regex
