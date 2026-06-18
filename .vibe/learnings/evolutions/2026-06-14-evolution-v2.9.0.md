# Evolution v2.9.0 — 2026-06-14

## Changes

| Change | Item | Details |
|--------|------|---------|
| RETIRE | `test-suite-always-run` | 0 runs, never exercised, redundant with `test-suite` |
| PROMOTE | `state-machine-valid` | Now implemented as harness Check 15, 1 run all pass |
| PROMOTE | `state-json-sync-on-ship` | promoted → active (v2.9.0) |
| PROMOTE | `temp-file-gitignore` | promoted → active (v2.9.0) |
| REMOVE | `workflow-5-phase-gate` | Superseded by `state-machine-valid` check |

## Rationale

- `test-suite-always-run` was proposed as a guardrail but never needed — `test-suite` already runs unconditionally
- `state-machine-valid` was added as Check 15 during retro action items — now verified
- `state-json-sync-on-ship` and `temp-file-gitignore` were promoted from proposed and had lingered as `promoted` status — full active status aligns with their intent
- `workflow-5-phase-gate` was the original proposal that state-machine-valid replaces; cleaned up

## Active Stats

- Active rules: 33 (was 32, +2 promoted -1 retired = +1 net, but also -1 harness check)
- Harness checks: 13 (was 14, -1 retired)
- Retired rules: 6 (was 5)
- Proposed rules: 1 (was 2)
