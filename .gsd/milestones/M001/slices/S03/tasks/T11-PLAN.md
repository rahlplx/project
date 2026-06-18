# T11: Create GitHub workflow + README badge

## Plan
Create a GitHub Actions workflow that runs all quality gates on push and PR.
Add a status badge to README.md.

## Files
- `.github/workflows/quality-gates.yml` — new workflow
- `README.md` — add badge

## Workflow
```yaml
name: Quality Gates
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint           # S03 Gate
      - run: npm run typecheck      # S03 Gate (if exists, else skip)
      - run: npm test               # Existing gate
      - run: node -e "require('js-yaml').load(require('fs').readFileSync('catalog/tools.yaml','utf8'))"
```

## Badge
```markdown
[![Quality Gates](https://github.com/rahlplx/project/actions/workflows/quality-gates.yml/badge.svg)](https://github.com/rahlplx/project/actions/workflows/quality-gates.yml)
```

## Verify
- Workflow file is valid YAML
- Badge renders in README preview
- `npm test` still passes (no code changes)
