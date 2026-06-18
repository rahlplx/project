# vibe:retro — Retrospective & Learning Capture

Captures what happened, what was learned, and what to improve. Concludes the full pipeline.

## When to Run

After `/vibe:ship` completes. Final phase before DONE.

## Steps

### 1. What Went Well
- What worked as expected or exceeded expectations?
- What practices should be continued?
- What tools or skills were most effective?

### 2. What Didn't Go Well
- Where did we get stuck?
- What was harder than expected?
- What practices failed or slowed us down?

### 3. Action Items
- 3-5 concrete improvements for next iteration
- Owner (if applicable)
- How to verify improvement

### 4. Save Learnings
- Write to `.vibe/learnings/retro-YYYY-MM-DD.md`
- Include metrics: tasks completed, issues found, time spent
- Update `CLAUDE.md` or `AGENTS.md` if new patterns discovered

### 5. Phase Cleanup
- Delete plan files for completed work
- Archive or remove stale handoffs
- Mark phase as DONE in state.json

## Output
`.vibe/learnings/retro-YYYY-MM-DD.md` with sections: Went Well, Didn't Go Well, Action Items, Metrics

## Reference
- gstack `/retro` methodology
- `skills/progress/tracker` — progress tracking
- `skills/knowledge/` — knowledge management skills
