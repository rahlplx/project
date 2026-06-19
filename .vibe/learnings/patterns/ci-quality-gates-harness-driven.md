# Pattern: CI Quality Gates Driven by Harness Validation

## Problem
Projects add lint/typecheck gates but they drift out of sync with the actual codebase. Gates pass in CI but fail locally, or vice versa. No single source of truth for gate status.

## Solution
Make the harness the single source of truth for all quality gates:
1. Harness runs all gates (lint, typecheck, test, validate, security)
2. Harness gates are the canonical pass/fail signal
3. Pre-commit hook runs quick subset (eslint + YAML)
4. `lint-config.test.js` validates ESLint config parses
5. Typecheck gate runs `tsc --checkJs` on JSDoc source
6. All gates visible in one harness output

## When to Use
- Adding quality gates to a project
- Need unified view of all gate status
- Want pre-commit + CI parity

## Files Changed
- `.eslintrc.js` — 9 rules, warnings for style, errors for bugs
- `.husky/pre-commit` — eslint + YAML validation
- `lib/lint-config.test.js` — validates ESLint config
- `.vibe/lifecycle/auto-maintain.js` — harness gates for lint + typecheck
- `lib/auto-maintain.test.js` — tests harness gate count

## Tested On
- vibe-stack M001 (2026-06-18): lint 0 errors, typecheck passes, 19 harness checks (3 new)