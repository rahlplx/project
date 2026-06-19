# Anti-Pattern: Skip Test Verification on Docs-Only Changes

## Symptom
Docs-only changes (no code touched) completed without running `npm test` to verify zero regressions. While no regressions were expected, the validation was skipped entirely.

## Root Cause
Assumption that "no code changes = no possible regression." But harness checks may reference config values that changed (e.g., state.json state_machine) or doc paths that test setups expect.

## How VibeNexus Should Catch It
Add to the SHIP gate: "Run full test suite" regardless of whether code or docs were changed. The test suite is the only reliable zero-regression indicator.

## Incident
VibeNexus workflow evolution, 2026-06-14. No actual regression occurred, but the gap is logged as a procedural miss.
