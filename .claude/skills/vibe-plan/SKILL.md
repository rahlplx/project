---
name: vibe-plan
description: "Break down any feature, project, or task into a structured execution plan with
  dependencies, effort estimates, and parallel execution opportunities. Use when: starting
  a new feature, planning a sprint, decomposing complex work, or before spawning parallel
  agents. Outputs a task board and dependency map. Wraps: planning-agent, task-coordinator,
  tracker, spec-driven, parallel-exec skills."
argument-hint: "[feature description] [--sprint N-days] [--parallel] [--from-prd]"
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Bash(cat .vibe/projects/*/PRD.md 2>/dev/null)
  - Bash(cat .vibe/projects/*/PROJECT.md 2>/dev/null)
  - Bash(node skills/workflow/planning-agent/index.js*)
  - Bash(node skills/progress/tracker/index.js*)
  - Bash(node skills/orchestration/task-coordinator/index.js*)
  - AskUserQuestion
---

# Vibe-Plan — Feature & Sprint Planning

## Dispatcher

- No args → ask what to plan, then decompose
- `{feature description}` → plan that specific feature
- `--sprint {N}` → constrain plan to N-day sprint (prune lower priority tasks)
- `--parallel` → identify which tasks can run in parallel (agent dispatch mode)
- `--from-prd` → load features from `.vibe/projects/{slug}/PRD.md` and plan all Must items

---

## Step 1 — Load Context

If `.vibe/projects/{slug}/PROJECT.md` exists: read it for tech stack and constraints.
If `.vibe/projects/{slug}/PRD.md` exists: read it for feature list and acceptance criteria.
If neither exists: ask user to describe what they're building (trigger Phase 1 via `/vibe`).

---

## Step 2 — Task Decomposition

Break the feature/project into atomic tasks. Rules for atomic tasks:
- Each task takes 1–4 hours max (if larger, decompose further)
- Each task has a clear "done" definition
- Each task produces a concrete artifact or behavior
- Tasks do NOT combine multiple concerns (no "build auth + profile page" — split them)

### Task Categories

| Category | Examples |
|----------|---------|
| **Setup** | Create file/folder, install package, configure env |
| **Data** | Define schema, write migration, add seed data |
| **Backend** | API endpoint, service logic, middleware, job |
| **Frontend** | Component, page, styling, state management |
| **Test** | Unit test, integration test, E2E test |
| **Docs** | README section, API doc, inline comments |
| **Deploy** | Config, CI step, environment setup |

### Task Format

Each task:
```
TASK-{N}: {Task Name}
  Category: {category}
  Effort: {S=1-2h | M=2-4h | L=4-8h}
  Priority: {Must | Should | Could}
  Depends on: TASK-{N}, TASK-{N} (or "none")
  Done when: {specific, verifiable condition}
  Acceptance test: {how to verify it's complete}
```

---

## Step 3 — Dependency Graph

Map which tasks must complete before others can start.

```
DEPENDENCY MAP:
━━━━━━━━━━━━━━
TASK-01 (DB schema) ──────────────────────┐
TASK-02 (API endpoint) ← needs TASK-01    │
TASK-03 (Frontend form) ← needs TASK-02   │
TASK-04 (Auth middleware) ────────────────┤
TASK-05 (Protected routes) ← needs TASK-04│
TASK-06 (Unit tests) ← needs TASK-02     ─┤
TASK-07 (E2E tests) ← needs TASK-03,05   ─┘

PARALLEL OPPORTUNITIES:
  Wave 1 (can start now):    TASK-01, TASK-04
  Wave 2 (after Wave 1):     TASK-02, TASK-05
  Wave 3 (after Wave 2):     TASK-03, TASK-06
  Wave 4 (after Wave 3):     TASK-07
```

---

## Step 4 — Sprint Fit (if `--sprint N`)

Given N days of work (assume 5 productive hours/day):

```
SPRINT {N}-DAY CAPACITY: {N*5}h available

FIT ANALYSIS:
  Must tasks:   {N} tasks × avg {N}h = {N}h total — {FITS | OVER BY {N}h}
  Should tasks: {N} tasks — {INCLUDE | DEFER}
  Could tasks:  {defer to next sprint}

RECOMMENDATION:
  {If over capacity}: Cut {task name} — {rationale} — {impact of deferring}
  {If under capacity}: Add {task name} from Should list — {value}
```

---

## Step 5 — Parallel Agent Dispatch (`--parallel`)

Identify tasks safe to run in parallel across agents:

Rules for parallel safety:
- Tasks with no shared file dependencies can run simultaneously
- Tasks that write to different files/endpoints are safe
- Tasks that share state (same DB table, same config file) must be sequential

```
PARALLEL DISPATCH PLAN:
━━━━━━━━━━━━━━━━━━━━━━
Agent 1 (Wave 1): TASK-01 — DB schema migration
  Files: db/migrations/xxx_create_users.sql
  No conflicts with other Wave 1 tasks ✅

Agent 2 (Wave 1): TASK-04 — Auth middleware
  Files: middleware/auth.js, middleware/roles.js
  No conflicts with Agent 1 ✅

Coordination point: After Wave 1 completes → run Wave 2
  Sync file: .vibe/state.json → set wave1_complete: true
```

---

## Output: Task Board

Write to `.vibe/projects/{slug}/tasks.json` if `--save` or user confirms:

```json
{
  "sprint": { "days": 5, "capacity_hours": 25 },
  "tasks": [
    {
      "id": "TASK-01",
      "name": "Create user table migration",
      "category": "Data",
      "effort": "S",
      "priority": "Must",
      "depends_on": [],
      "done_when": "Migration runs cleanly on fresh DB, users table exists with all fields",
      "status": "todo"
    }
  ],
  "waves": [
    { "wave": 1, "tasks": ["TASK-01", "TASK-04"] },
    { "wave": 2, "tasks": ["TASK-02", "TASK-05"] }
  ]
}
```

### Kanban Render

```
TASK BOARD — {feature name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TODO              IN PROGRESS      DONE
─────────────     ─────────────    ─────────────
TASK-01 [S]  →
TASK-02 [M]  →
TASK-04 [S]  →
TASK-06 [M]  →

Total: {N} tasks | {N}h estimated | Sprint: {N} days

Next: TASK-01 and TASK-04 can start immediately (Wave 1)
Run /vibe-tdd {TASK-01 description} to begin with tests first
```
