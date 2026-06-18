# docs/handoffs: AGENTS.md

## Purpose

Standardized handoff templates for every type of agent-to-agent transition in the vibe-stack pipeline. Consistent handoffs prevent context loss -- the #1 cause of multi-agent coordination failure.

## File Index

| File | When to Use |
|------|-------------|
| `standard.md` | Routine work transfer between agents or phases |
| `qa-pass.md` | QA approves a task -- forward to next step |
| `qa-fail.md` | QA rejects a task -- return with fix instructions |
| `escalation.md` | Task exceeds retry limit -- escalate to orchestrator |
| `phase-gate.md` | Moving between pipeline phases |
| `sprint.md` | End of sprint boundary |
| `incident.md` | Active incident response handoff |

## Usage

Each template uses Markdown table headers for structured fields. Fill in all bracketed `[Field]` values. Leave no empty sections -- if a section has no content, write "None" explicitly.

## Lifecycle Integration

The auto-maintain cycle (`node .vibe/lifecycle/auto-maintain.js`) reads `docs/gates.md` during the harness phase to verify phase transitions have proper gate evidence. Handoff files in this directory are referenced by the maintainer for post-phase documentation.

## Cross-References

- `docs/gates.md` for phase gate criteria
- `.vibe/handoff.md` for the current active handoff
- `references/vibe-build.md` for build-phase handoff protocol
- `references/vibe-review.md` for review-phase gate expectations
