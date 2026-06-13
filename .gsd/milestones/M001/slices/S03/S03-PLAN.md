# S03: CI Quality Gates

Add automation gates beyond the existing test suite:
pre-commit hooks, linting, typechecking, and a GitHub workflow.

## Must-haves
- Pre-commit hook: validates YAML syntax in catalog/tools.yaml
- Pre-commit hook: checks file naming conventions (kebab-case)
- ESLint config: basic JS linting rules
- JSDoc typecheck: basic type coverage on key files
- GitHub workflow: runs all gates (lint → typecheck → test → validate)
- Badge in README showing workflow status

## Non-Goals
- Full TypeScript migration (too expensive)
- 100% type coverage (just key files)
- Custom ESLint plugins (standard rules only)

## Tasks
T08: Add pre-commit hooks
T09: Add ESLint config + lint script  
T10: Add JSDoc typecheck script
T11: Create GitHub workflow + README badge
