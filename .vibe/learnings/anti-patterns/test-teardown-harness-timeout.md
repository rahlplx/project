# Anti-Pattern: Test Teardown Causing Harness Timeouts

## Symptom
Harness runs take 2+ minutes because Jest test suites leak async handles (install-ide, telemetry-tracker). Worker processes fail to exit gracefully, forcing Jest to force-exit.

## Root Cause
Tests in `lib/install-ide.test.js` and `lib/telemetry-tracker.test.js` create async operations (timers, file watchers, child processes) that aren't cleaned up in `afterAll`/`afterEach`. Jest's `detectOpenHandles` shows active timers.

## How vibe-stack Should Catch It
Add a harness check that runs `npm test -- --detectOpenHandles` and fails if any leaks detected. Or add a timeout budget per test suite.

## Incident
- vibe-stack M001 (2026-06-18): cmd.harness duration 131s, Jest force-exits workers
- Pre-existing issue in install-ide.test.js, telemetry-tracker.test.js