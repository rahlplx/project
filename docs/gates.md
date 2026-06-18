# Phase Gates: Vibe-Stack 5-Phase Pipeline

## Purpose

Every phase transition in the vibe-stack pipeline requires passing its quality gate. No phase advances without meeting its criteria. This prevents context loss and quality regressions between layers.

## Gate Summary

| Transition     | Gate Name           | Gate Keeper       | Key Criteria                                                                   |
| -------------- | ------------------- | ----------------- | ------------------------------------------------------------------------------ |
| SCOPE → BUILD  | Readiness Gate      | Agent             | SCOPE.md complete, user signed off, risks registered, test convention declared |
| BUILD → VERIFY | Implementation Gate | Agent             | All tasks built, tests pass, lint clean, build output captured                 |
| VERIFY → SHIP  | Quality Gate        | Independent Agent | 7 scans passed, verify-report.json written, 0 CRITICAL/HIGH issues             |
| SHIP → EVOLVE  | Deployment Gate     | Agent             | Committed to main, handoff written, re-scope done for next cycle               |
| EVOLVE → done  | Evolution Gate      | Agent             | SESSION-EVAL.json written, state.json updated, patterns extracted              |

## Gate Criteria Per Transition

### SCOPE → BUILD: Readiness Gate

**Gate Keeper**: Agent

| Criterion                | Threshold                        | Evidence Required                  |
| ------------------------ | -------------------------------- | ---------------------------------- |
| SCOPE.md exists          | File present with all 8 fields   | Read SCOPE.md                      |
| Goal defined             | Clear outcome statement          | Goal field filled                  |
| Deliverables listed      | Specific files to change/create  | Deliverables field filled          |
| Completion criteria set  | How we know it's done            | Completion criteria field filled   |
| Test convention declared | Which test framework to use      | Test convention field filled       |
| Risk register populated  | Known risks for this unit        | Risk register field filled         |
| Setup steps complete     | Pre-requisites done              | Setup steps field filled or "none" |
| User signed off          | User confirmed "yes, build this" | Sign-off line in SCOPE.md          |
| No BLOCKED fields        | All required fields have content | Automated check                    |

**Plan Delta**: If scope changes mid-BUILD, write `SCOPE-DELTA.md` with sections: What Changed, Why, Impact. Then re-enter this gate.

**Failure**: Do not advance to BUILD. Fill gaps or resolve BLOCKED items.

### BUILD → VERIFY: Implementation Gate

**Gate Keeper**: Agent

| Criterion             | Threshold                       | Evidence Required         |
| --------------------- | ------------------------------- | ------------------------- |
| All tasks implemented | 100% of deliverable files exist | File existence check      |
| Tests pass            | All tests green                 | Test run output           |
| Build output captured | Diff of changed files           | git diff or file snapshot |
| No RED tests          | TDD discipline maintained       | Test run output           |

**Failure**: Return to BUILD phase. Fix failing tests or incomplete tasks.

### VERIFY → SHIP: Quality Gate

**Gate Keeper**: Independent Agent (fresh context, /clear from BUILD)

| Criterion          | Threshold                                    | Evidence Required      |
| ------------------ | -------------------------------------------- | ---------------------- |
| Structural scan    | File tree, naming conventions, YAML validity | Scan output            |
| Security scan      | No CRITICAL/HIGH patterns                    | Security scan output   |
| Test suite         | All tests pass (770+ baseline)               | Test run output        |
| Index integrity    | discovery-index.json matches filesystem      | Index check output     |
| Catalog validity   | tools.yaml parses + quality scores OK        | Catalog check output   |
| Evolution check    | No regressions in active rules               | Evolution check output |
| verify-report.json | Written with structured results              | File read check        |

**Failure**: Return to BUILD. Fix specific failed checks.

### SHIP → EVOLVE: Deployment Gate

**Gate Keeper**: Agent

| Criterion            | Threshold                           | Evidence Required                      |
| -------------------- | ----------------------------------- | -------------------------------------- |
| Committed and pushed | All changes on remote               | git log output                         |
| Handoff written      | Session summary in .vibe/handoff.md | File read check                        |
| Re-scope check done  | Next SCOPE.md considered            | Written re-scope note or next-SCOPE.md |

**Failure**: Complete git operations or handoff before advancing.

### EVOLVE → done: Evolution Gate

**Gate Keeper**: Agent

| Criterion                 | Threshold                                | Evidence Required          |
| ------------------------- | ---------------------------------------- | -------------------------- |
| SESSION-EVAL.json written | Structured eval of this cycle            | File read check            |
| Patterns extracted        | At least one new pattern or anti-pattern | Pattern file in learnings/ |
| state.json updated        | phase=done, completed list updated       | state.json verified        |
| INDEX.md rebuilt          | All learnings cross-referenced           | INDEX.md read check        |

**Failure**: Complete evolution artifacts before marking done.

## Gate Failure Handling

```
IF gate FAILS:
  - Gate Keeper documents specific failure criteria
  - Agent routes failures to responsible phase
  - Failed items re-enter appropriate phase mechanics
  - Maximum 3 gate re-attempts before escalation
  - Escalation: user decides to fix, descope, or accept with risk
```

## Gate Automation

Gates are auto-checked during phase transitions. The agent reads the gate criteria, validates each criterion, and only advances when all pass. The user is only asked for HITL at two gates: Readiness (scope sign-off) and Deployment (ship approval).

## Cross-References

- `docs/workflow/SCOPE.md` for the SCOPE template
- `docs/workflow/VERIFY.md` for the VERIFY template and independent agent protocol
- `.vibe/state.json` for current phase tracking
- `.vibe/evolution.json` for active rules and harness checks
- `plans/plan-workflow-evolution.md` for the full stress-tested plan
