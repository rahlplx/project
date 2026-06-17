# Solution: Telemetry Gap Fix Strategy

## Context

The telemetry spec specified rich session data (per-phase commands, tasks, reviews, user corrections, clarifications) but the implementation had 5 hardcoded/stub gaps:

1. `commands_run` per phase was always `[]`
2. `user_interactions.commands_used` was `{vibe:telemetry: 1}` (hardcoded)
3. `times_corrected_ai` / `times_asked_clarification` were always `0`
4. `tasks_completed` / `tasks_failed` were always `0`
5. `reviews_passed` / `reviews_failed` were missing entirely

## Solution

Created a `telemetry-tracker` module with a simple JSON file as the persistence layer:

```js
recordCommand('vibe:build'); // increment command counter
recordCorrection(); // increment correction counter
recordClarification(); // increment clarification counter
consumeAndReset(); // returns snapshot + resets for next cycle
```

The tracker file (`.vibe/telemetry/tracker.json`) persists between auto-maintenance cycles. `captureTelemetry()` calls `consumeAndReset()` exactly once, uses the snapshot for both phase-level `commands_run` and session-level `user_interactions`, then resets.

Per-phase `tasks_completed`/`tasks_failed`/`reviews_passed`/`reviews_failed` are derived from harness result history:

- `reviews_passed` = count of harness runs where ALL checks passed
- `reviews_failed` = count of harness runs where ANY check failed
- `tasks_completed` = passed harness runs (same as reviews_passed)
- `tasks_failed` = 1 if current phase appears in failed harness runs, else 0

## Key Insight

A tracker file with `consumeAndReset()` is simpler and more reliable than passing callbacks through the agent framework. The atomic snapshot prevents double-counting across maintenance cycles. The key mistake was calling both `getTracker()` (read-only) and `consumeAndReset()` (read+reset) — always use only `consumeAndReset()` to avoid stale reads.

## Files Changed

- `lib/telemetry-tracker.js` — new tracker module with JSON persistence
- `lib/telemetry-tracker.test.js` — 4 node:test tests
- `.vibe/lifecycle/auto-maintain.js` — `captureTelemetry()` consumes tracker, derives harness-based task/review counts
- `.vibe/lifecycle/vibe-telemetry.js` — records `vibe:telemetry <subcommand>` calls via `recordCommand()`
