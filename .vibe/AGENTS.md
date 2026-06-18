# .vibe/AGENTS.md

## Purpose
The `.vibe/` directory powers the autonomous lifecycle and self-improvement system of vibe-stack. An AI agent reads these files at session start to understand the project state and what maintenance work is needed.

## Structure
```
.vibe/
├── AGENTS.md              # This file
├── state.json             # Current phase, milestone, interaction count
├── lifecycle.json         # Session counters, trigger thresholds
├── evolution.json         # Active/retired/proposed rules, harness checks
├── maintenance-log.json   # Log of auto-maintenance runs
├── handoff.md             # Session summary for agent handoff
├── learnings/             # Pattern docs from past work
├── lifecycle/             # Auto-maintenance orchestrator
├── telemetry/             # Usage data and repo-mining insights
└── tools/                 # Internal tools (e.g., repo-miner.js)
```

## Conventions
- `state.json.phase` drives pipeline: think → plan → break → build → harness → review → ship → retro → learn → evolve → done
- `lifecycle.json.interaction_count >= 10` OR `days_since_maintenance >= 7` triggers auto-maintenance
- `evolution.json` has: `active` (enforced), `retired` (removed with reason), `proposed` (under consideration), `harness_checks` (validated during harness)
- `handoff.md` written at every phase transition
- Auto-maintenance sequence: harness → telemetry → retro → learn → evolve

## Cross-References
- `SKILL.md` → Entry point, delegates to this file
- `references/vibe-*.md` → Phase execution references
- `docs/gates.md` → Phase gate criteria
- `docs/handoffs/AGENTS.md` → Handoff template guide
- `references/vibe-retro.md` → Retro phase
- `references/vibe-evolve.md` → Evolution rules