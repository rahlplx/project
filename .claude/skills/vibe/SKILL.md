---
name: vibe-orchestrator
description: "The primary orchestrator for the 10-phase VibeNexus pipeline.
  Use for: starting projects, planning features, and managing the end-to-end lifecycle.
  Phases: think, plan, break, build, harness, review, ship, retro, learn, evolve.
  Maintains state in .vibe/state.json and follows the 'Iron Law' of handoffs."
argument-hint: "[think|plan|break|build|harness|review|ship|retro|learn|evolve] [args]"
version: 1.1.0
allowed-tools:
  - Read
  - Write
  - Bash(mkdir -p .vibe/*)
  - Bash(cat .vibe/*)
  - Bash(ls .vibe/*)
  - WebSearch
  - WebFetch
  - Agent
  - AskUserQuestion
---

# VibeNexus Orchestrator — Unified Pipeline

This orchestrator manages the full lifecycle of a vibe project. It coordinates multiple
expert personas and enforces quality gates at every layer transition.

## The 10-Phase Pipeline

### Layer: Strategy
1. **think** → Problem definition, user analysis, solution sketch, MVP scoping.
2. **plan** → Multi-perspective review, risk assessment, acceptance criteria.

### Layer: Planning
3. **break** → Milestone-to-task decomposition with sizing (using Architect persona).
4. **design** → UI generation and approval via Stitch (if UI present).

### Layer: Execution
5. **build** → RED-GREEN-REFACTOR implementation. Auto-dispatch of subagents.

### Layer: Validation
6. **harness** → Mandatory production readiness gate (7 automated checks).
7. **review** → Multi-perspective code review and security audit (OWASP).
8. **qa** → Browser-based UI testing (if UI present).

### Layer: Delivery & Learning
9. **ship** → Release engineering: git sync, push, PR, and one-click deployment.
10. **retro** → Retrospective, pattern extraction, and rule evolution via `vibe:evolve`.

---

## State & Handoffs

- **State**: Tracked in `.vibe/state.json`.
- **The Iron Law**: A full handoff document MUST be written to `docs/handoffs/` between
  major layer transitions (e.g., Planning → Execution). Lightweight notes are written
  for intra-layer steps.

---

## Phase Dispatcher

Read `$ARGUMENTS` and route to the corresponding phase guide in `references/` or
execute the underlying logic in `lib/vibe-commands/`.

- `think` / `plan` → Strategy phases.
- `break` / `design` → Planning phases.
- `build` → Execution (TDD workflow).
- `harness` / `review` / `qa` → Validation gates.
- `ship` → Delivery.
- `retro` / `learn` / `evolve` → Improvement cycle.

---

## Model Routing Table

| Task | Model | Rationale |
|------|-------|-----------|
| Strategy & Planning | sonnet | High reasoning capability |
| Architecture & Security | opus | Critical safety decisions |
| Build (Subagents) | haiku | Fast, cost-effective execution |
| Retro & Evolution | sonnet | Pattern recognition |
