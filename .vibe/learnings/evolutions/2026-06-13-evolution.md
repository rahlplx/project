# Evolution: 2026-06-13

## Summary
First evolution cycle. Cleaned up rule classification (rules vs anti-patterns),
retired non-applicable rules, and created 3 new process/harness rules from
pipeline-3 learnings.

## Changes

### RETIRED (4)
- `tdd.md` → retired. No production code in curation projects.
- `mid-file-yaml-edits.md` → reclassified as anti-pattern (was incorrectly in rules)
- `incremental-catalog-runs.md` → reclassified as anti-pattern
- `verify-before-describe.md` → reclassified as anti-pattern

### PROMOTED (3)
- `agent-native-catalog.md` → hard requirement, quality 1.0
- `yaml-only-direct-push.md` → best practice, quality 1.0
- `auto-pipeline-for-curation.md` → cross-domain pattern, quality 1.0

### CREATED (3)
- `rules/pre-verify-tool-metadata.md` — harness check for research phase
- `rules/batch-catalog-additions.md` — process rule for plan phase
- `rules/append-not-insert-yaml.md` — process rule for build phase

## Trigger
`/vibe:evolve` after pipeline-3 retro.

## Approved By
User decision: "deep audit and then apply all systematically"
