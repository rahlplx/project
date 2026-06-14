# Plan: Workflow Evolution — 11-Phase → 5-Phase Pipeline

## 1. CEO Review (Product Perspective)

### What's the 10-star version of this?
A fully autonomous pipeline where the agent:
1. **Scopes** work in structured SCOPE.md with completion criteria, test conventions, risk register, setup steps
2. **Builds** using TDD with RED-GREEN-MUTATE-KILL-REFACTOR per atomic slice
3. **Verifies** with an independent agent invocation (fresh context, reads only SCOPE.md + build output), running 7 structural scans
4. **Ships** to main with auto-push, handoff capture, and re-scope for next cycle
5. **Evolves** by writing SESSION-EVAL.json (not retro+learn+evolve spread across 3 phases)

The agent never asks "what now?" — it reads the phase, executes, and advances. The only HITL (human-in-the-loop) gates are:
- **Scope sign-off** before BUILD (user confirms: "yes, build this")
- **Ship approval** (user confirms: "yes, push this")

Everything else (VERIFY, EVOLVE) is fully automated.

### What's the narrowest wedge that proves demand?
**Single cycle dry-run**: Take one real backlog item — say, a small fix/add — run it through SCOPE → BUILD → VERIFY → SHIP → EVOLVE end-to-end. Measure:
- How long does each phase take?  
- Does the independent VERIFY actually catch things BUILD missed?  
- Does EVOLVE produce useful SESSION-EVAL.json output?

If the dry-run beats the 11-phase cycle on wall-clock time AND quality (fewer regressions), the 5-phase wins.

### What's definitely OUT of scope for this version?
| Feature | Why Out |
|---------|---------|
| Full state machine rewrite | Incremental — keep state.json format, just change `state_machine` field |
| New UI/dashboard | No UI in this repo — agent-operates only |
| PR-based workflow | Direct-push model stays (zero-risk YAML/config changes → main) |
| Cloud deployment | No deploy target — this is a local repo |
| Multi-agent orchestration | Single agent (me), single workspace |
| External CI runners | GitHub Actions optional, not required — local gates only |

---

## 2. Eng Review (Architecture)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       5-PHASE PIPELINE                              │
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  │  SCOPE   │───→│  BUILD   │───→│  VERIFY  │───→│  SHIP    │───→│  EVOLVE  │
│  │          │    │          │    │          │    │          │    │          │
│  │ 1. Read  │    │ 1. RED   │    │ 1. Struct│    │ 1. Push  │    │ 1. Eval  │
│  │    gate  │    │ 2. GREEN │    │    scan  │    │ 2. Hand- │    │    write │
│  │ 2. Fill  │    │ 3. MUTATE│    │ 2. Sec   │    │    off   │    │ 2. Index │
│  │    scope │    │ 4. KILL  │    │    scan  │    │ 3. Re-   │    │    update│
│  │ 3. User  │    │ 5. REFAC │    │ 3. Test  │    │    scope │    │ 3. State │
│  │    signs │    │ 6. Per   │    │ 4. Index │    │    check │    │    →done │
│  │ 4. →BUILD│    │    slice │    │ 5. Catalog│    │ 4. →EVOL │    │          │
│  └──────────┘    └──────────┘    │ 6. Quality│    └──────────┘    └──────────┘
│                                   │ 7. Eval   │
│                                   │  /clear    │
│                                   │ fresh agent│
│                                   └──────────┘
│                                                                     │
│  HITL Gates:  [SCOPE → BUILD]  [SHIP → EVOLVE]                     │
│                                                                     │
│  Plan Delta:  If scope changes mid-BUILD → write SCOPE-DELTA.md    │
│               + re-enter readiness gate                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
SCOPE.md (created) ──────────────→ BUILD agent reads for context
                                          │
                                          ↓
                              Build output (files changed, test results)
                                          │
                                          ↓
                              SCOPE.md + build output ──→ VERIFY agent
                                                           (fresh context, /clear'd)
                                                           │
                                                           ↓
                                                    verify-report.json
                                                           │
                                                           ↓
                              SHIP reads verify-report + commit status
                                                           │
                                                           ↓
                              SHIP writes handoff ──→ EVOLVE reads handoff
                                                           │
                                                           ↓
                                                    SESSION-EVAL.json
                                                    state.json → phase=done
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| SCOPE.md | `docs/workflow/SCOPE.md` | Template with 8 required fields |
| VERIFY.md | `docs/workflow/VERIFY.md` | 7-step check sequence + report schema |
| Plan Delta | `docs/workflow/SCOPE-DELTA.md` | Scope change doc (exist when needed) |
| State machine | `.vibe/state.json` | `state_machine` array + `phase` string |
| Gates | `docs/gates.md` | 5 gates instead of 10 |
| Design doc | `docs/design-doc.md` | §"Workflow Evolution — 5-Phase Adoption" |

### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| VERIFY fails | BUILD must fix; VERIFY re-runs on new build output |
| SHIP rejected (user says no) | phase stays SHIP; write note in handoff; retry on next session |
| SCOPE is empty/BLOCKED | Readiness gate BLOCKS →BUILD; agent must fill before proceeding |
| Mid-BUILD scope change | Write SCOPE-DELTA.md; re-run readiness gate; old build output archived |
| VERIFY agent can't read build output | Stale file? Retry once; if still fails, fallback to inline VERIFY |
| Tests changed while building | Re-run full test suite during VERIFY; if pre-existing failures, document in verify-report |

### Test Matrix

| Test Layer | What It Covers | Tool |
|------------|----------------|------|
| Unit tests | Individual functions, registry logic | Jest |
| Integration | Tool discovery, quality scoring | Jest (suite-level) |
| Structural scan | File tree, naming conventions, YAML validity | node:test |
| Security scan | CRITICAL/HIGH patterns in skills | Security harness check |
| Index integrity | discovery-index.json matches filesystem | Index harness check |

### Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| SCOPE.md incomplete | BUILD starts without context → wrong work | Readiness gate blocks |
| VERIFY misses a bug | Bug ships to main | SHIP gate requires verify-report.json |
| Push fails (git conflict) | Work not persisted | Retry; if conflict, merge then push |
| state.json corruption | Phase tracking lost | Validate state.json before writes; backup on read |
| CRLF/lint noise | Git diff polluted | .gitattributes handles it; ignore cosmetic diffs |

### Dependencies

| Dependency | Version | Why |
|------------|---------|-----|
| Node.js | 18+ | Jest runner, scripts |
| git | Any | Version control, push |
| npm test | Project-configured | Runs all 770+ tests |

---

## 3. Design Review

**Skip**: This project has no UI. Design review is N/A for a CLI/agent-operated catalog repo.

(If we later add a UI dashboard for the pipeline, the design scoring would apply: layout 0-10, typography 0-10, color 0-10, motion 0-10, accessibility 0-10, each with a "what a 10 looks like" explanation.)

---

## 4. Risk Assessment

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R1 | VERIFY agent misinterprets build output | Medium | Medium | verify-report.json schema is strict; SCOPE.md + file diff provides objective input |
| R2 | /clear between BUILD and VERIFY loses handoff state | Low | High | Write handoff.md before /clear; VERIFY agent reads handoff.md at start |
| R3 | User doesn't like 5-phase workflow | Low | High | Keep state_machine configurable; can revert to 11-phase via state.json edit |
| R4 | SCOPE.md template too heavy for small tasks | Medium | Low | Add "quick" variant: required fields only (5 instead of 8) |
| R5 | CRLF noise on Windows blocks clean diff | High | Low | .gitattributes text=auto; ignore cosmetic whitespace in VERIFY |
| R6 | Plan Delta never used (scope never changes mid-BUILD) | Medium | Low | No harm — file just never gets created. Zero cost. |

## 5. Implementation Tasks

### Task 1: State machine + phase transition
**Files**: `.vibe/state.json`
**Change**: Update `state_machine` array to `["scope","build","verify","ship","evolve","done"]`. Ensure `phase` matches current (should be `"done"` → will change when dry-run starts).
**Test**: `state.json` parses, `state_machine` has exactly 6 values, `phase` is a valid entry.

### Task 2: Create SCOPE.md template
**Files**: `docs/workflow/SCOPE.md`
**Content**: Template with 8 required fields:
- Goal (what's the outcome)
- Deliverables (specific files to change/create)
- Completion criteria (how we know it's done)
- Test convention (which test framework, pattern to follow)
- Risk register (known risks for this unit)
- Setup steps (pre-requisites)
- Scope delta format (Plan Delta reference)
- Sign-off line (user confirms before BUILD)

### Task 3: Create VERIFY.md template
**Files**: `docs/workflow/VERIFY.md`
**Content**: 7-step check sequence:
1. Structural scan — file tree, naming, YAML validity
2. Security scan — CRITICAL/HIGH pattern check
3. Test suite — all tests pass
4. Index integrity — discovery-index.json matches filesystem
5. Catalog validity — tools.yaml parses + quality scores OK
6. Evolution check — no regressions in active rules
7. verify-report.json — output schema defined
Plus: independent agent protocol (read SCOPE.md + build output, /clear from BUILD)

### Task 4: Create SCOPE-DELTA.md template
**Files**: `docs/workflow/SCOPE-DELTA.md`
**Content**: "What changed, why, impact" mini-template. Created only when scope changes mid-BUILD.

### Task 5: Update design doc
**Files**: `docs/design-doc.md`
**Change**: Add §"Workflow Evolution — 5-Phase Adoption" after "Use Cases" section. Documents the decision, architecture, and migration path.

### Task 6: Rewrite gates.md
**Files**: `docs/gates.md`
**Change**: Replace 10-gate table with 5-gate table:
- SCOPE → BUILD: Readiness Gate
- BUILD → VERIFY: Implementation Gate
- VERIFY → SHIP: Quality Gate
- SHIP → EVOLVE: Deployment Gate
- EVOLVE → done: Evolution Gate
Each with: gate keeper, key criteria, failure handling.

## 6. Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| AC1 | .vibe/state.json state_machine updated | Read state.json, confirm array |
| AC2 | SCOPE.md template exists at docs/workflow/SCOPE.md | File exists check |
| AC3 | VERIFY.md template exists at docs/workflow/VERIFY.md | File exists check |
| AC4 | SCOPE-DELTA.md template exists at docs/workflow/SCOPE-DELTA.md | File exists check |
| AC5 | design-doc.md has §"Workflow Evolution" section | Read design-doc.md, confirm section |
| AC6 | gates.md has exactly 5 gates | Read gates.md, count gate table entries |
| AC7 | All 770+ existing tests still pass | npm test output |

## 7. Open Questions

1. Should SCOPE.md have a "quick" variant (5 fields instead of 8) for trivial tasks?
   - Proposal: Yes — add `scope: quick` or `scope: full` mode field.
2. Should VERIFY run inline (same agent) or separate agent invocation?
   - Proposal: Separate — community pattern from ShepAlderson/copilot-orchestra.
   - Risk: /clear loses state. Mitigation: handoff.md bridge.
3. Should EVOLVE produce SESSION-EVAL.json or keep retro+learn+evolve files?
   - Proposal: Replace with single SESSION-EVAL.json structured output. Simpler, machine-readable, AI-parsable.

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Phase count | 5 (scope, build, verify, ship, evolve, done) | Merged think+plan+break into SCOPE, removed review (replaced by structural scan in VERIFY), merged retro+learn+evolve into EVOLVE |
| VERIFY model | Separate agent invocation with /clear | Community-validated pattern; catches blind spots |
| HITL gates | 2 (SCOPE → BUILD, SHIP → EVOLVE) | Scope sign-off and ship approval — everything else automated |
| Plan Delta | Optional file (created on-demand) | Zero-cost; only exists when scope changes mid-BUILD |
| SESSION-EVAL.json | Single file replaces retro+learn+evolve | Machine-readable, AI-parsable, simpler workflow |
