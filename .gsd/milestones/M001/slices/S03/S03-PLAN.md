# S03 Plan — CI Quality Gates

## Slice Goal
Add lint, typecheck, and validate gates to complement existing test suite (4 total gates).

## Must-Haves
- `.eslintrc.js` — ESLint config with 8-10 minimal rules
- `.husky/pre-commit` — pre-commit hook (eslint + YAML validation)
- `lib/lint-config.test.js` — validates ESLint config parses
- Harness updated with lint + typecheck gates
- Typecheck: `tsc --checkJs` on JSDoc-annotated source

## Tasks

| Task | Description | Files |
|------|-------------|-------|
| T09 | Create .eslintrc.js | `.eslintrc.js` |
| T10 | Create .husky/pre-commit | `.husky/pre-commit` |
| T11 | Write lint-config.test.js | `lib/lint-config.test.js` |
| T12 | Update harness with lint/typecheck | `lib/harness.test.js`, `package.json` |

## Verification
- ESLint config parses without errors
- Pre-commit hook runs eslint + YAML validation
- Lint config test passes
- Harness includes lint + typecheck gates
- `npm run lint` — 0 errors
- `npm run typecheck` — 0 errors
- `npm test` — 1,165 passing
- `npm run format:check` — passes

## Risk
MEDIUM — Config changes can cause false positives. Mitigations: pin ESLint version, test before shipping, pre-commit skips if eslint missing.