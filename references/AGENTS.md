# references/AGENTS.md

## Purpose
References are immutable architectural decisions, patterns, and specifications that agents consult during implementation. They don't change often.

## Structure
```
references/
├── AGENTS.md           # This file
├── vibe-think.md       # Think phase reference
├── vibe-plan.md        # Plan phase reference
├── vibe-break.md       # Break phase reference
├── vibe-build.md       # Build phase reference
├── vibe-review.md      # Review phase reference
├── vibe-harness.md     # Harness phase reference
├── vibe-ship.md        # Ship phase reference
├── vibe-retro.md       # Retro phase reference
├── vibe-learn.md       # Learn phase reference
├── vibe-evolve.md      # Evolve phase reference
├── vibe-auto.md        # Auto mode reference
├── vibe-quick.md       # Quick workflow reference
├── vibe-detect.md      # Stack detection reference
└── vibe-design.md      # Design phase reference
```

## Conventions
- One file per phase/command: `vibe-<phase>.md`
- Format: Process → Steps → Outputs → Decisions
- No implementation code — only process/spec
- Cross-referenced from `SKILL.md` and phase handoffs
- Updated only during `/vibe:evolve` or explicit decision

## Cross-References
- `SKILL.md` → Entry point, delegates to this file
- `.vibe/AGENTS.md` → Lifecycle uses references
- `docs/design-doc.md` → Architecture decisions reference these
- `plans/` → Implementation plans reference phase guides