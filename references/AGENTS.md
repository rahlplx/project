# References: AGENTS.md

## Purpose

The `references/` directory contains phase guides for the auto pipeline. Each guide explains how to run one phase of the vibe-stack workflow, from ideation (think) through shipping (ship) to reflection (retro).

## File Map

| File | Phase | Trigger | What It Does |
|------|-------|---------|-------------|
| `init.md` | Init | startup | Project onboarding, stack detection, first-time setup |
| `vibe-think.md` | Think | `/vibe:think` | Product strategy, problem definition, success metrics |
| `vibe-plan.md` | Plan | `/vibe:plan` | Multi-perspective review, design doc pressure-testing |
| `vibe-break.md` | Break | `/vibe:break` | Milestone → task decomposition |
| `vibe-detect.md` | Detect | `/vibe:detect` | Auto-detect project stack (framework, build, test) |
| `vibe-design.md` | Design | `/vibe:design` | UI generation and approval |
| `vibe-build.md` | Build | `/vibe:build` | RED-GREEN-REFACTOR TDD implementation |
| `vibe-harness.md` | Harness | `/vibe:harness` | Production readiness validation (6 code-quality checks) |
| `vibe-review.md` | Review | `/vibe:review` | Multi-perspective code review |
| `vibe-qa.md` | QA | `/vibe:qa` | Browser-based UI testing with Chromium |
| `vibe-ship.md` | Ship | `/vibe:ship` | Release engineering, deploy, commit |
| `vibe-retro.md` | Retro | `/vibe:retro` | What happened, what we learned, what to improve |
| `vibe-learn.md` | Learn | `/vibe:learn` | Self-improvement — patterns, anti-patterns, quality scores |
| `vibe-evolve.md` | Evolve | `/vibe:evolve` | Auto-evolve rules, retire underperformers, propose new |
| `vibe-telemetry.md` | Telemetry | `/vibe:telemetry` | Usage diagnostics, phase durations, error trends |
| `vibe-auto.md` | Auto | `/vibe:auto` | Auto-mode state machine — full pipeline orchestration |
| `vibe-quick.md` | Quick | `/vibe:quick` | Compressed workflow for small changes |
| `vibe-resume.md` | Resume | `/vibe:resume` | Session recovery from state.json + handoff.md |
| `vibe-curation.md` | Curation | manual | Editorial rules for catalog management |

## How to Use

- Each guide maps to a `/vibe:<phase>` CLI command
- Read the guide for the phase you're about to run
- Guides assume you have read all earlier phase guides
- Create a new reference doc only when adding a new pipeline phase

## Cross-References

- `SKILL.md` for the full command list
- `.vibe/state.json` for current phase tracking
- `.vibe/lifecycle/` for auto-maintenance lifecycle
