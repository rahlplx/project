# Pattern: Skill Structural Linter

## Problem
How to ensure all skill files in a multi-contributor collection follow consistent structural conventions.

## Solution
Create a lint checker that validates every `index.js` skill file for:
1. **Exports**: `module.exports` must exist (error if missing)
2. **Class pattern**: if class-based, check for `this.name` and `this.description` (warning if missing)
3. **Script pattern**: if no class, check that `module.exports` has exported keys (warning if empty)
4. **File size**: minimum meaningful content threshold (warning if too short)

## When to Use
- Pre-commit hook to validate new skills
- Harness check to catch regressions
- Onboarding new contributors to your skill format

## Implementation
- `lib/lint-skills.js` — Node.js, no dependencies
- Dual pattern support: class-based and script-based skills
- CLI mode: `node lib/lint-skills.js`
- Harness integration: check #7 in auto-maintain.js

## What Worked
- **Separate lintFile function** with optional content parameter — enables unit testing without temp files
- **`[\s\S]*?` for multi-line regex** — handles both single-line and multi-line `module.exports = { ... }` syntax
- **WARN vs ERR distinction** — structural issues warn, missing exports errors. Prevents false-positive pipeline failures.

## What Didn't Work
- `[^}]*` regex for extracting export keys — fails on multi-line exports (fixed to `[\s\S]*?` during review)

## Files Changed
- `lib/lint-skills.js` — main implementation
- `lib/lint-skills.test.js` — 10 tests
- `.vibe/lifecycle/auto-maintain.js` — harness check #7
- `lib/auto-maintain.test.js` — updated for 7 checks

## Tested On
Vibe-Stack Curated Collection, 2026-06-14 — 45 skills, 39 clean, 6 warnings, 0 errors
