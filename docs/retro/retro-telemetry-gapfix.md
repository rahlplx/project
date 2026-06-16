# Retrospective: Telemetry Gap Fix

**Date:** 2026-06-14
**Phase:** done
**Focus:** Deep audit of telemetry spec gaps — commands tracking, corrections, per-phase task/review counts, tracker module

---

## Step 1: What Went Well

- **Complete gap audit in under 30s** — read all 4 telemetry source files (auto-maintain.js, vibe-telemetry.js, telemetry-aggregate.js, telemetry-status.js) and identified all 5 gaps against the spec
- **Telemetry tracker module** (`lib/telemetry-tracker.js`) — clean API: `recordCommand()`, `recordCorrection()`, `recordClarification()`, `consumeAndReset()`. All 4 tests pass.
- **`consumeAndReset()` pattern** — atomic snapshot + reset prevents double-counting and stale data. Initial code read tracker twice (once stale), caught and fixed in same cycle.
- **Session schema now matches spec** — `reviews_passed`, `reviews_failed`, `tasks_completed`, `tasks_failed`, `commands_run`, `user_interactions.commands_used` all populated from real data
- **Jest exclusion caught fast** — failed harness on first run, root cause (node:test test detected by Jest) identified quickly, fixed in package.json
- **All 14 harness checks pass** — 914 tests (762 Jest + 152 node:test)
- **`/vibe:learn` ran inline** — promoted `telemetry-spec-session-schema` to pattern, added Solutions section to INDEX.md

## Step 2: What Didn't

- **`telemetryInsights` ordering bug repeated** — defined `feedTelemetryToLearn` result AFTER `runLearn()` call in auto-maintain.js. Same class of bug from earlier session. Shows the learn/evolve wiring still isn't intuitive.
- **`consumeAndReset()` called twice** — initial code called `getTracker()` (read) AND `consumeAndReset()` (read+reset), so phases got pre-reset data while user_interactions got post-reset. Data was inconsistent for one harness cycle.
- **Harness cycle 10s-20s** — eslint scan is still the bottleneck (~6s). The `eslint-cache-flag` rule was added in the last evolve but not yet implemented.
- **`state-machine-valid` and `test-suite-always-run` harness checks** — both at 0 runs, never exercised. Need to either implement or retire.

## Step 3: Action Items

1. **Implement `compaction-dedup-window`** — compaction events fire 9+ times per cycle. Add a 5-min dedup window. This was a proposed rule from the last evolve but never coded.
2. **Implement `eslint-cache-flag`** — add `--cache` flag to the eslint harness check to bring cycle time under 10s.
3. **Repair `state-machine-valid` harness check** — either implement it (validate state.json state_machine matches [scope, build, verify, ship, evolve, done]) or retire it formally.

## Step 4: Compound Learnings

Written to `docs/solutions/telemetry-gap-fix-strategy.md`.

## Step 5: Close

- Phase: done
- 3 files changed: `lib/telemetry-tracker.js`, `.vibe/lifecycle/auto-maintain.js`, `.vibe/lifecycle/vibe-telemetry.js`
- 1 test file added: `lib/telemetry-tracker.test.js`
- 1 pattern added: `.vibe/learnings/patterns/telemetry-spec-session-schema.md`
- INDEX.md updated with Solutions section
