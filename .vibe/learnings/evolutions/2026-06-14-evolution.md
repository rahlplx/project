# Evolution: Telemetry & Session Diagnostics

**Date:** 2026-06-14
**Previous version:** 2.7.0
**New version:** 2.8.0
**Evolution count:** 10

## Changes Applied

### RETIRED (2)

| Rule | Score | Reason |
|------|-------|--------|
| `batch-catalog-additions` | null (0 fires) | Never exercised. Anti-pattern covered by `auto-pipeline-for-curation` pattern. |
| `append-not-insert-yaml` | null (0 fires) | Never exercised. Anti-pattern covered by `edit-tool-for-yaml-blocks` pattern. |

### NEW RULES (4)

| Rule | Source | Purpose |
|------|--------|---------|
| `compaction-dedup-window` | Retro action item | 5-min dedup prevents compaction event spam on rapid session restarts |
| `eslint-cache-flag` | Retro action item | Use `--cache` flag in eslint harness check to reduce ~6s bottleneck |
| `index-md-crossref-validation` | Retro action item | New harness check: every pattern/anti-pattern must appear in at least one cross-ref table |
| `unified-test-convention` | Anti-pattern cluster | Consolidates 3 testing anti-patterns into one rule: node:test + always-run + no regex in jest config |

### PROMOTED (2)

| Rule | From | Status |
|------|------|--------|
| `state-json-sync-on-ship` | proposed_rules → active | Auto-update state.json phase after git commit |
| `temp-file-gitignore` | proposed_rules → active | Add *.tmp.js patterns to .gitignore |

## Trigger

Manual `/vibe:evolve` after `/vibe:retro` (telemetry & session diagnostics sprint).

## Snapshot

- 28 active rules (was 24)
- 4 retired rules (was 4, no change — swap of 2 in/2 out)
- 1 pending proposed (independent-verify-agent)
- 0 pending proposed_rules (was 2, both promoted)
