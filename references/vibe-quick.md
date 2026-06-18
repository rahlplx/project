# vibe:quick — Compressed Workflow for Small Changes

For small, well-understood changes that do not need the full pipeline. Skips think/plan/break phases.

## When to Run

When the change is:
- A single bug fix (< 50 lines changed)
- A simple feature addition (< 100 lines)
- Documentation update
- Configuration change
- Dependency update

Do NOT use for:
- New features requiring architectural decisions
- Multi-file refactors
- Changes affecting security or data integrity
- Changes with complex test requirements

## Steps (Compressed)

### 1. Understand
- Confirm the exact change needed
- No strategy or planning overhead

### 2. Implement
- Write test first (TDD still applies)
- Implement
- Verify tests pass

### 3. Quick Review
- Self-review the change
- Check for obvious issues
- No formal review process

### 4. Ship
- Commit with conventional commit message
- Push directly (no PR needed for trivial changes)
- Or open quick PR for visibility

### 5. Captures
- Log in `.vibe/learnings/quick-changes.md` if the change revealed a pattern

## Reference
- v1.1: Compressed workflow
- Bypasses: think, plan, break, harness, review, qa, retro
