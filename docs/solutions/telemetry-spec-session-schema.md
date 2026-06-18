# Solution: Telemetry Spec Alignment & Rich Session Schema

## Context

The telemetry system stored flat snapshot data — a single JSON blob per session. The telemetry spec called for rich hierarchical sessions with phases/errors/blockers/compaction/harness data, compaction detection, cross-project trends, and a CLI for inline diagnostics.

## Solution

### Session Schema (per spec)

Each telemetry session now captures:

- `session_id`, `project`, `started_at`, `ended_at`, `mode`
- `phases[]` — per-phase timing, commands executed, errors encountered
- `errors[]` — error type, message, resolution, stack trace
- `blockers[]` — blocker description, resolution, time lost
- `compaction` — `events[]` (symptom, recovery, token_recovered, time_lost_min) + `warning_signals`
- `harness` — checks_run, checks_passed, checks_failed, last_run_duration_ms
- `meta` — agent, version, session_count

### Compaction Detection

`detectRapidRestarts()` scans session gaps: if the last session ended < 60s ago, a compaction event is recorded with symptom/recovery/token_recovered estimates.

### CLI

`/vibe:telemetry status|trends|cross-project|errors|stuck|export` — 6 subcommands for inline diagnostics without reading raw files.

### Learn/Evolve Wiring

`feedTelemetryToLearn()` extracts harness failures, phase imbalances, and recurring errors. `runLearn()` now receives `(telemetry, telemetryInsights)` and scans blockage/solution patterns. `runEvolve()` targets lowest 20% of rules by quality score.

## Key Insight

A flat session log is nearly useless for diagnosis. The rich schema makes trends, stuck phases, and compaction visible without grepping raw JSON. The real win was wiring telemetry into the learn/evolve loop — now evolution proposals are grounded in actual usage data, not just manual retrospection.

## Files Changed

- `.vibe/lifecycle/auto-maintain.js` — `captureTelemetry()`, `detectRapidRestarts()`, `recordCompactionEvent()`, `feedTelemetryToLearn()`, `runLearn(telemetry, telemetryInsights)`, `runEvolve()` lowest-20% targeting
- `.vibe/lifecycle/vibe-telemetry.js` — new CLI with 6 subcommands
- `.vibe/lifecycle/vibe-learn-capture.js` — new capture CLI
- `.vibe/telemetry/sessions/` — 25 rich sessions
- `.vibe/telemetry/compaction.json` — compaction event log
- `.vibe/learnings/INDEX.md` — cross-references by technology, type, phase
