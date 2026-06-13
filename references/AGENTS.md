# References: AGENTS.md

## Purpose

The `references/` directory contains phase guides for the auto pipeline. Each guide explains how to run one phase of the vibe-stack workflow, from ideation (think) through shipping (ship) to reflection (retro).

## File Map

| File | Phase | Trigger | What It Does |
|------|-------|---------|-------------|
| `vibe-think.md` | Think | `/vibe:think` | Product strategy, problem definition, success metrics |
| `vibe-plan.md` | Plan | `/vibe:plan` | Multi-perspective review, design doc pressure-testing |
| `vibe-break.md` | Break | `/vibe:break` | Milestone → task decomposition |
| `vibe-build.md` | Build | `/vibe:build` | RED-GREEN-REFACTOR TDD implementation |
| `vibe-harness.md` | Harness | `/vibe:harness` | Production readiness validation |
| `vibe-review.md` | Review | `/vibe:review` | Multi-perspective code review |
| `vibe-ship.md` | Ship | `/vibe:ship` | Release engineering, deploy, commit |
| `vibe-retro.md` | Retro | `/vibe:retro` | What happened, what we learned, what to improve |
| `vibe-curation.md` | Curation | manual | Editorial rules for catalog management |
| `vibe-design.md` | Design | `/vibe:design` | UI generation and approval |

## How to Use

- Each guide maps to a `/vibe:<phase>` CLI command
- Read the guide for the phase you're about to run
- Guides assume you have read all earlier phase guides
- Create a new reference doc only when adding a new pipeline phase

## Cross-References

- `SKILL.md` for the full command list
- `.vibe/state.json` for current phase tracking
- `.vibe/lifecycle/` for auto-maintenance lifecycle
