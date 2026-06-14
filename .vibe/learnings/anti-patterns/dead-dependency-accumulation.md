# Anti-Pattern: Dead Dependency Accumulation

## Symptom
`package.json` contains dependencies that are never imported in source code. In vibe-stack: `chalk ^5.3.0` and `ora ^7.0.1` were declared but zero callers existed across 50 skills and all lib/bin files.

## Root Cause
Dependencies added on assumption of future use, or copied from templates, without verification. ESM-only packages (chalk v5+, ora v7+) in CommonJS projects create silent foot-guns: they install but `require()` fails in older Node, or works in Node 22+ but masks the fact they're unused.

## How vibe-stack Should Catch It
1. **Dead dependency audit at PR time** - Script that compares `package.json` dependencies against actual `require()`/`import` calls in source
2. **Lint rule** - Flag dependencies not referenced in any `.js` file (excluding test files for devDependencies)
3. **CI check** - Fail build if dead deps detected

## Incident
vibe-stack, 2026-06-14: chalk and ora removed after audit found zero `require('chalk')` or `require('ora')` calls. 15 packages pruned from node_modules.

## Prevention
- Add `dead-dep-audit` to pre-push hooks
- Include in harness checks
- Template projects should start with minimal deps