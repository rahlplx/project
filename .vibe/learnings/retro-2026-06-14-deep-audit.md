# Retro: Deep Audit + Fix Pipeline

## What Went Well

- **Deep audit caught 15 cross-ref inconsistencies** — 5-perspective review (Security, Code Quality, Testing, Docs, Cross-Ref) found issues that single-perspective would miss
- **Jest `.vibe` regex bug identified correctly** — after exhausting many false paths, the root cause (unscaped dot in regex pattern) was found via first-principles reasoning about how Jest handles testPathIgnorePatterns
- **Parallel subagent test creation worked** — 4 subagents wrote 168 tests for 12 skills in parallel, all passing on first full suite run
- **execSync→execFileSync migration clean** — all 3 migrated files pass tests, no regressions
- **Harness maintenance #6** — all 7 checks pass, 49 suites, 425 tests

## What Didn't

- **Orphaned test diagnosis took too long** — spent multiple rounds on Haste map collisions, cache clearing, directory renames before discovering the simpler regex root cause
- **Subagent investigation misattributed cause** — the first subagent suggested Haste map collisions, which turned out to be a secondary concern. The primary cause was the regex bug
- **Test file content was never the issue** — both orphaned test files were valid Jest tests, wasted effort examining file encoding, shebangs, permissions

## Action Items

1. **Add Jest config regex warning to CLAUDE.md** — document that testPathIgnorePatterns and modulePathIgnorePatterns use regex matching, not glob
2. **Write execFileSync pattern** — document the security migration for future reference
3. **Write test-for-every-skill pattern** — codify the minimum test requirement for skills

## Metrics

- **Tests**: 247 → 425 (+178)
- **Suites**: 35 → 49 (+14)
- **Harness checks**: 6 described → 7 actual (doc updated)
- **Security fixes**: 3 files migrated
- **Untested skills**: 12 → 0
- **Files created**: 13 new test files + 1 new lib file
- **Files modified**: 12 files (security, config, docs, harness)
