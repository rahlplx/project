# vibe:auto — Autonomous Full Pipeline

Builds, reviews, and ships the entire project without intervention using GSD auto-mode state machine.

## When to Run

When the user wants fully autonomous execution: "build it all", "ship it", "go ahead".

## Phases (executed sequentially)

### Phase 1: think
- Run `/vibe:think` autonomously
- Generate think document from project context
- Determine MVP scope

### Phase 2: plan
- Run `/vibe:plan` autonomously
- Generate plan with milestones

### Phase 3: break
- Run `/vibe:break` autonomously
- Decompose into context-sized tasks

### Phase 4: build
- For each task: RED → GREEN → REFACTOR → VERIFY
- Auto-dispatch subagents
- No user interaction during build
- On failure: retry once, then skip with note

### Phase 5: harness
- Run all 6 production readiness checks
- Fix any failures automatically
- Loop until pass

### Phase 6: review
- Auto-review all code
- Fix critical and major issues
- Skip minor issues (log them)

### Phase 7: ship
- Sync, test, push, PR
- Auto-merge if all checks pass
- Deploy

### Phase 8: retro
- Generate retro document
- Capture learnings
- Mark DONE

## State Updates
After each phase: update state.json, write handoff, instruct /clear.
No user prompts during auto mode — all decisions are pre-encoded.

## Reference
- GSD auto-mode state machine
- All vibe:* reference files for detailed steps
