# T07: Create .vibe/AGENTS.md

## Plan
Write `.vibe/AGENTS.md` explaining the internal lifecycle system.

Sections:
- Purpose: what .vibe/ contains (lifecycle, telemetry, evolution)
- File index: lifecycle.json, state.json, evolution.json, maintenance-log.json, learnings/
- How the auto-maintenance cycle works (harness → telemetry → retro → learn → evolve)
- When to increment interaction_count in lifecycle.json
- How rules in .vibe/rules/ are created and retired
- Cross-reference: SKILL.md for lifecycle trigger, docs/design-doc.md for roadmap

## Style
Write for AI agent reader (this is read by the agent at session start).
Be precise about file paths and trigger conditions.

## Files
- `.vibe/AGENTS.md` — new file
