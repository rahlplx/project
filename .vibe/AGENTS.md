# .vibe: AGENTS.md

## Purpose

The `.vibe/` directory powers the autonomous lifecycle and self-improvement system of vibe-stack. An AI agent reads these files at session start to understand the project state and what maintenance work is needed.

## File Index

| File | Purpose |
|------|---------|
| `state.json` | Current phase, milestone, interaction count, completed items |
| `lifecycle.json` | Session counters, trigger thresholds for auto-maintenance |
| `evolution.json` | Active rules, retired rules, proposed rules, harness checks |
| `maintenance-log.json` | Log of auto-maintenance runs |
| `handoff.md` | Current session summary for agent handoff |
| `learnings/` | Pattern docs captured from past work |
| `lifecycle/` | Auto-maintenance orchestrator (`auto-maintain.js`) |
| `telemetry/` | Usage data and repo-mining insights |
| `tools/` | Internal tools (e.g., `repo-miner.js`) |

## Auto-Maintenance Lifecycle

The lifecycle runs **autonomously** when:
- `interaction_count >= 10`, or
- `days_since_last >= 7`

Sequence:
1. **Harness** — validate production readiness (check evolution.json rules)
2. **Telemetry** — increment counters, log activity
3. **Retro** — capture learnings from current session
4. **Learn** — distill patterns into `learnings/`
5. **Evolve** — promote/demote rules in `evolution.json`

Trigger: `node .vibe/lifecycle/auto-maintain.js`
Or let the agent detect the threshold at session start.

## Lifecycle State Fields

In `state.json`:
- `phase`: current pipeline phase (think/plan/break/build/harness/review/ship/retro/learn/evolve/done)
- `step`: phase step number (0 = not started)
- `interaction_count`: total interactions since last maintenance
- `completed`: array of milestone names

In `lifecycle.json`:
- `last_maintenance`: ISO timestamp of last maintenance run
- `interaction_count`: running counter
- `config.interaction_threshold`: when to auto-trigger (default: 10)
- `config.days_threshold`: time-based trigger (default: 7)

## Rules System

Rules in `evolution.json` are divided into:
- `active`: rules currently enforced (e.g., agent-native-catalog, yaml-only-direct-push)
- `retired`: rules that were tested and removed (with reason)
- `proposed`: rules being considered (not yet enforced)
- `harness_checks`: rules validated during harness phase

Each rule has:
- `id`: unique identifier
- `description`: what to do
- `rationale`: why it exists
- `trigger`: when it applies
- `severity`: error/warning/info

## How to Update

- Increment `interaction_count` in both `state.json` and `lifecycle.json` after each significant interaction
- After maintenance, reset `interaction_count` to 0 and update `last_maintenance`
- Add completed milestones to `state.json.completed` array
- When creating a rule, add it to `evolution.json.proposed` first, then promote after verification

## Cross-References

- `SKILL.md` for lifecycle trigger conditions
- `docs/design-doc.md` for the enhancement roadmap
- `references/vibe-retro.md` for retro phase
- `references/vibe-curation.md` for curation rules
