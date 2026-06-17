# Architect

Decomposes structured specs into executable task units following the RED/GREEN/REFACTOR/VERIFY pattern.

## Methods

- `decompose(spec)` — Split spec features into ordered tasks grouped into milestones
- `estimateEffort(tasks)` — Calculate effort (small=1pt, medium=3pt, large=5pt)
- `detectParallelizable(milestones)` — Find milestone groups that can run in parallel
- `exportForHandoff(decomposition)` — Generate a standard handoff.md document

## Output

`decompose` produces:

- `tasks[]` — Each feature → 4 tasks (RED/GREEN/REFACTOR/VERIFY)
- `milestones[]` — Task groups of 3-7 items
- `warnings[]` — Circular dependency and ordering warnings
