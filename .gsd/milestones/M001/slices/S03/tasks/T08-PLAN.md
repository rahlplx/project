# T08: Add pre-commit hooks

## Plan
Add pre-commit hooks using husky:
1. YAML validation: check catalog/tools.yaml is valid YAML on every commit
2. File naming: check that new files in skills/ and catalog/ use kebab-case
3. Test suite: run npm test on commit (as warning, not blocker — avoid slowing workflow)

## Files
- `package.json` — add husky + lint-staged devDeps
- `.husky/pre-commit` — new pre-commit hook script
- `.lintstagedrc.json` — lint-staged config

## Must-haves
- `git commit` triggers YAML validation on tools.yaml changes
- Invalid YAML blocks the commit with error message
- File naming violations print warnings (non-blocking)
- Install: `npx husky install`

## Verify
- `npx husky install` succeeds
- Breaking tools.yaml → commit blocked
- Adding file with wrong casing → warning printed
- `npm test` still passes
