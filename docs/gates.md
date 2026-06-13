# Phase Gates: Vibe-Stack Pipeline

## Purpose

Every phase transition in the vibe-stack pipeline requires passing its quality gate. No phase advances without meeting its criteria. This prevents context loss and quality regressions between layers.

## Gate Summary

| Transition | Gate Name | Gate Keeper | Key Criteria |
|---|---|---|---|
| think -- plan | Problem Definition Gate | Orchestrator | Problem validated, success metrics defined, scope bounded |
| plan -- break | Plan Approval Gate | Orchestrator | Plan document approved, tasks enumerated, approach decided |
| break -- build | Slice Ready Gate | Orchestrator | Atomic tasks, dependencies mapped, TDD-ready per task |
| build -- harness | Implementation Gate | Orchestrator | All builds done, tests written, no reds, lint clean |
| harness -- review | Production Gate | Harness | 6 harness checks green, evolution checks pass |
| review -- ship | Quality Gate | Orchestrator | 0 CRITICAL, 0 HIGH issues, all REVIEW items resolved |
| ship -- retro | Deployment Gate | Orchestrator | Shipped to main, all CI gates passed, PR merged |
| retro -- learn | Learning Gate | Orchestrator | Retro written, patterns and pain points documented |
| learn -- evolve | Pattern Gate | Orchestrator | Learnings saved, rules distilled from experience |
| evolve -- done | Evolution Gate | Orchestrator | Rules promoted/retired, evolution.json updated, handoff written |

## Gate Criteria Per Transition

### think -- plan: Problem Definition Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Problem validated | Clear problem statement exists | Written in plan doc or think output |
| Success metrics defined | Measurable outcomes specified | Quantitative targets documented |
| Scope bounded | What is IN and OUT is clear | Scope section in plan document |
| User intent understood | User has confirmed direction | Confirmation from user interaction |

**Failure**: Return to think phase. Refine problem statement.

### plan -- break: Plan Approval Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Plan document complete | All sections filled | Plan document exists and is reviewed |
| Approach decided | Build vs. buy vs. defer decided | Decision documented in plan |
| Risk assessment done | Top risks identified | Risk section in plan document |
| Dependencies mapped | External deps known | Dependency list in plan |

**Failure**: Return to plan phase. Fill gaps in plan document.

### break -- build: Slice Ready Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Tasks are atomic | Each task fits one context window | Task list with size estimates |
| Dependencies mapped | Task order is clear | Dependency graph or ordered list |
| TDD-ready | Each task has test approach | Test strategy per task |
| No ambiguous tasks | Every task has clear acceptance criteria | Acceptance criteria per task |

**Failure**: Return to break phase. Decompose oversized tasks.

### build -- harness: Implementation Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| All tasks implemented | 100% task completion | Task list all checked |
| Tests pass | All tests green | Test run output |
| Lint clean | Zero errors | Lint run output |
| Typecheck clean | Zero errors | Typecheck run output |

**Failure**: Return to build phase. Fix failing tests/lint/typecheck.

### harness -- review: Production Gate

**Gate Keeper**: Harness phase

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Catalog YAML valid | Tools.yaml parses cleanly | Harness check output |
| Catalog category count | Min 3 tools per category | Harness check output |
| Test suite passes | All tests green | Harness check output |
| Pre-verify metadata | Evolution rules checked | Harness check output |
| No critical security issues | Zero CRITICAL findings | Security audit output |
| Handoff doc exists | .vibe/handoff.md present | File existence check |

**Failure**: Fix specific failed checks, re-run harness.

### review -- ship: Quality Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Code review complete | All files reviewed | Review artifact or sign-off |
| Security audit complete | No CRITICAL/HIGH issues | Security audit log |
| All review items resolved | Zero open review items | Review checklist |
| Tests still pass | All 213+ tests green | Test run output |

**Failure**: Fix review issues, re-run harness, re-review.

### ship -- retro: Deployment Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Committed to main | All changes committed | git log output |
| CI gates passed | Lint + test + typecheck | CI run output or local run |
| Branch merged or up to date | No divergence | git status |
| handoff.md updated | Current phase handoff written | File read check |

**Failure**: Complete CI steps, commit remaining changes.

### retro -- learn: Learning Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Retro written | What went well + what didn't | Retro file in learnings/ |
| Action items captured | Specific improvements listed | Retro file action items |
| Pain points documented | What was hard or slow | Retro file pain points |

**Failure**: Complete retro before advancing.

### learn -- evolve: Pattern Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Patterns extracted | At least one pattern doc | Pattern file in learnings/ |
| Anti-patterns noted | Pain points codified | Anti-pattern file if applicable |
| Quality scores considered | Low-quality rules flagged | Learn output |

**Failure**: Extract at least one pattern before advancing.

### evolve -- done: Evolution Gate

**Gate Keeper**: Orchestrator

| Criterion | Threshold | Evidence Required |
|-----------|-----------|-------------------|
| Rules updated | At least one proposed rule | evolution.json updated |
| Handoff written | Session summary complete | .vibe/handoff.md complete |
| State updated | phase=done, completed list current | state.json verified |

**Failure**: Complete evolution updates before marking done.

## Gate Failure Handling

```
IF gate FAILS:
  - Gate Keeper documents specific failure criteria
  - Orchestrator routes failures to responsible phase
  - Failed items re-enter appropriate phase mechanics
  - Maximum 3 gate re-attempts before escalation
  - Escalation: user decides to fix, descope, or accept with risk
```

## Cross-References

- `docs/handoffs/phase-gate.md` for the phase gate handoff template
- `docs/handoffs/AGENTS.md` for which handoff template to use
- `.vibe/state.json` for current phase tracking
- `.vibe/evolution.json` for active rules and harness checks
