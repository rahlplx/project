# T09: Add ESLint config + lint script

## Plan
Add ESLint with standard rules to catch common JS errors and style issues.

## Files
- `.eslintrc.json` — ESLint configuration
- `package.json` — add `npm run lint` script
- `package.json` — add eslint devDependency

## Config
- Env: es2022, node, jest
- Extends: eslint:recommended
- Rules: no-unused-vars (warn), no-console (warn), eqeqeq (error)
- Ignore: node_modules/, .vibe/repo-mining/, .gsd/

## Must-haves
- `npm run lint` runs without errors on current codebase
- Warning-level rules don't block the command
- New violations in future commits will flag

## Verify
- `npm run lint` exits 0
- Intentionally adding `==` instead of `===` → lint flags it
- `npm test` still passes (lint is separate gate)
