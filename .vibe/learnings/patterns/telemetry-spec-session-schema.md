# Pattern: Telemetry Spec Session Schema

## Problem
Flat session snapshots (single JSON blob) provide no diagnostic value. Trends, stuck phases, compaction, and per-phase breakdowns require hierarchical session data.

## Solution
Design sessions with rich schema:
- `phases` — per-phase timing, commands_run, tasks_completed/failed, reviews_passed/failed
- `errors` — error type, message, resolution per phase
- `blockers` — description, resolution, time lost
- `compaction` — events (symptom, recovery, token_recovered) + warning signals
- `harness` — checks_run, checks_passed, checks_failed, failures
- `user_interactions` — commands_used tracked via persistent tracker file
- `meta` — session/interaction counts, tools_discovered, skills_total, tests_passing

Use a tracker module (`telemetry-tracker.js`) to accumulate command usage, corrections, and clarifications between maintenance cycles. `consumeAndReset()` returns the snapshot and resets for the next cycle.

## When to Use
Any project with telemetry instrumentation that needs actionable diagnostic data beyond raw session counts.

## Files Changed
- `.vibe/lifecycle/auto-maintain.js` — `captureTelemetry()` with rich schema
- `lib/telemetry-tracker.js` — command/correction/clarification tracker

## Tested On
vibenexus, 2026-06-14
