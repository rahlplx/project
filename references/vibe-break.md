# vibe:break — Milestone to Task Decomposition

Breaks approved plan into independently-grabbable, context-window-sized units using GSD milestone→slice→task decomposition.

## When to Run

After `/vibe:plan` produces an approved plan document.

## Steps

### 1. Milestone Identification
From the plan, identify 3-7 major milestones. Each milestone must:
- Deliver user-visible value independently
- Be completable in 1-3 build sessions
- Have clear acceptance criteria
- Not depend on future milestones

### 2. Vertical Slice Decomposition
For each milestone, decompose into vertical slices:
- Each slice is a thin end-to-end feature (not a layer)
- Slices are ordered by dependency
- Each slice is independently testable

### 3. Task Breakdown
For each slice, list concrete tasks:
- RED: Write the test first
- GREEN: Implement to pass
- REFACTOR: Clean up
- VERIFY: Run tests + typecheck

Each task must fit in one context window (<50 files, <2000 lines changed).

### 4. Dependency Graph
Map dependencies between slices:
```
slice-A → slice-B → slice-C
       ↘ slice-D ↗
```

### 5. Output
Create `plans/break-<topic>.md` with:
- Milestones with acceptance criteria
- Slices per milestone (ordered)
- Tasks per slice (RED/GREEN/REFACTOR/VERIFY)
- Dependency graph
- Estimated effort per slice

## Reference
- GSD milestone→slice→task decomposition pattern
