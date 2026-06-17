# Solution: Shipping Catalog-Only Changes Without PRs

## Context

The curated catalog (`catalog/tools.yaml`) is plain YAML with no executable code.
Adding a tool means 1 new YAML block — no tests change, no imports added, no runtime impact.

## Solution

Skip the PR workflow for catalog-only changes. Commit directly to main:

```
git add catalog/tools.yaml plans/think-deeper-catalog.md .vibe/state.json
git commit -m "feat(catalog): ..."
git push
```

## Key Insight

PRs exist to catch regressions. If the change is purely data (not code), and validation
passes (YAML syntax, test suite), the PR is overhead with zero safety benefit.

The same logic applies to config files, documentation, and catalog entries — if changing
it cannot break the test suite or the app, ship it directly.

## Files Changed

- `catalog/tools.yaml` — added 12 tools across 3 commits, all direct-to-main
- No regressions across 22 commits of catalog work
