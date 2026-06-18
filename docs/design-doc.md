# Design Doc: Vibe-Stack Repo Enhancement Roadmap

## What This Is

This repo is a **curated collection of AI tools and skills** for vibe coders — people who build software by describing what they want in plain language, not by writing code. An AI agent reads `SKILL.md`, finds tools in `catalog/tools.yaml`, and helps the vibe coder build, design, test, and ship.

**Current state**: 35 community-verified tools across 7 categories, 45 agent skills, 209 passing tests, auto-maintenance lifecycle.

---

## What We Learned From Mining 12 Top Repos

We cloned and analyzed 12 successful open-source AI repos to extract their best patterns. Here's what they do better than us:

### Our Gaps (Ranked by Opportunity)

| #   | Gap                              | Found In                             | What It Means                                                                                         |
| --- | -------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 1   | **Tool Registry**                | mastra, OpenHands SDK                | A central registry where tools register themselves with `is_usable()` checks. We hardcode tool lists. |
| 2   | **Async/Sync Parity**            | OpenHands SDK                        | Every method has both sync + async versions. We only have sync.                                       |
| 3   | **Skill Progressive Disclosure** | OpenHands SDK                        | Skills are described in 1-1024 chars with truncation. Our skill descriptions have no caps.            |
| 4   | **Settings Schema Export**       | OpenHands SDK, mastra                | Settings can be exported as a typed schema. We have no settings system.                               |
| 5   | **Package Split**                | OpenHands SDK, mastra                | Separate packages for SDK / tools / server. We have everything in one flat tree.                      |
| 6   | **Behavior Tests**               | OpenHands SDK                        | Tests that verify real agent behavior, not just unit tests. We only have unit tests.                  |
| 7   | **CI Quality Gates**             | software-agent-sdk, mastra, opencode | Pre-commit hooks + lint + typecheck + test + benchmark gates. We only have test suite.                |
| 8   | **Rules Engine**                 | mastra, opencode, penpot             | A formal rules framework with quality scoring. We have ad-hoc rules in evolution.json.                |
| 9   | **AGENTS.md Per Package**        | OpenHands SDK                        | Each package has its own AGENTS.md for AI developers. We have one global SKILL.md.                    |
| 10  | **Visual Pipeline Builder**      | langflow, dify                       | Drag-and-drop agent workflows. We only have code-based orchestration.                                 |

### Our Strengths (What We Already Do Well)

| Strength                       | Details                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| **Auto-maintenance lifecycle** | Only repo with a self-improving system (harness → telemetry → retro → learn → evolve) |
| **Cross-repo mining**          | Only repo that systematically audits competitors for patterns                         |
| **Catalog curation**           | 35 verified tools across 7 categories — most structured catalog                       |
| **Agent-native descriptions**  | Every tool has `what_it_does` + `how_agent_uses` (for AI agents, not humans)          |
| **Zero-risk direct push**      | YAML-only changes go straight to main without PR overhead                             |
| **Community verification**     | Every tool checked for stars, license, activity before inclusion                      |

---

## Enhancement Plan (MVP)

The **narrowest wedge** that proves value: pick the 3 gaps with highest impact and lowest cost.

### Priority 1: Tool Registry 🔧

**Cost**: Low | **Impact**: High

Replace hardcoded tool lists with a `ToolRegistry` class where tools register themselves and declare `is_usable()`:

- Skills register: `ToolRegistry.register('git-free-deploy', { isUsable: () => checkGitInstalled() })`
- Agent queries: `ToolRegistry.findUsable('deploy')` → returns only tools available on this machine

**Files affected**: `bin/skill-loader.js` → refactor into `lib/tool-registry.js`
**From**: mastra, OpenHands SDK

### Priority 2: AGENTS.md Per Section 📖

**Cost**: Low | **Impact**: High

Each major directory gets a short `AGENTS.md` explaining its purpose to AI agents:

- `catalog/AGENTS.md` — how to add/find tools
- `skills/AGENTS.md` — how skills are structured
- `references/AGENTS.md` — how reference docs work
- `.vibe/AGENTS.md` — how the lifecycle works

**Files affected**: New files only (no code changes)
**From**: OpenHands SDK

### Priority 3: CI Quality Gates 🚪

**Cost**: Medium | **Impact**: High

Add pre-commit hooks + lint + typecheck to complement the test suite:

- Pre-commit: YAML validation, file naming conventions
- Lint: ESLint for JS files
- Typecheck: Add JSDoc types (no TS migration yet)
- CI: GitHub workflow that runs all gates

**Files affected**: `.github/workflows/`, `.husky/pre-commit`, `package.json`
**From**: software-agent-sdk, mastra, opencode

### Priority 4: Async/Sync Parity ⚡

**Cost**: Medium | **Impact**: Medium

Every skill method that has a sync version gets an async version:

- `skill.deploy()` → `skill.deploySync()` + `skill.deployAsync()`
- Async versions return Promises for concurrent execution
- Base class provides default delegation (sync → async wrap, async → sync await)

**Files affected**: `bin/skill-loader.js`, each skill's `index.js`
**From**: OpenHands SDK

### Priority 5: Settings Schema 📋

**Cost**: High | **Impact**: Medium

Export project settings as a typed schema that agents can read programmatically:

- `settings/schema.yaml` — defines all configurable settings
- `lib/settings.js` — loads, validates, exports settings
- Agents read settings at session start to understand project context

**Files affected**: New files
**From**: OpenHands SDK, mastra

---

## What's OUT of Scope (This Version)

| Feature                      | Why Not                                              |
| ---------------------------- | ---------------------------------------------------- |
| Visual pipeline builder      | Requires UI — too complex for MVP                    |
| Package split into monorepo  | Benefits not worth migration cost yet                |
| Behavior tests               | Need real agent framework first                      |
| Rules engine quality scoring | Already have evolution.json — iterate, don't replace |

---

## Success Metrics

| Metric          | Current          | Target                                    |
| --------------- | ---------------- | ----------------------------------------- |
| Tool Registry   | Hardcoded lists  | Plugable with is_usable()                 |
| AGENTS.md files | 0                | 4 (catalog, skills, references, .vibe)    |
| CI gates        | Test only (jest) | 4 gates (lint, typecheck, test, validate) |
| Async methods   | 0                | All 45 skills                             |
| Settings schema | None             | Exported programmatically                 |

---

## Use Cases (For Vibe Coders)

### "Make the deploy tools work on my machine"

**Before**: Agent tries all 3 deploy tools, some fail silently.
**After**: Agent calls `ToolRegistry.findUsable('deploy')` → only gets the 2 tools you have installed. Tells you why the 3rd is unavailable.

### "Why did this skill break?"

**Before**: No logs, no error tracking.
**After**: Settings schema logs tool usage. Agent checks: "Git-free-deploy failed because Git isn't installed. Want me to install it?"

### "How do I add a new tool?"

**Before**: Read SKILL.md, figure it out.
**After**: Read `catalog/AGENTS.md` → 3-step process with examples. Each step cross-referenced to actual files.

---

## Workflow Evolution — 5-Phase Adoption

Based on a comprehensive risk analysis against industry research (AI-DLC, Agentic Dev Playbook, ABIvan-Tech workflows, ShepAlderson/copilot-orchestra), the original 11-phase pipeline (think→plan→break→build→harness→review→ship→retro→learn→evolve→done) is being streamlined into a 5-phase model:

### New Phases

| Phase      | Merges From            | Rationale                                                                               |
| ---------- | ---------------------- | --------------------------------------------------------------------------------------- |
| **SCOPE**  | think + plan + break   | All pre-work in one phase with a structured template and readiness gate                 |
| **BUILD**  | build                  | Unchanged — TDD execution per atomic slice                                              |
| **VERIFY** | harness + review       | Combined into single fresh-context independent agent invocation with 7 structural scans |
| **SHIP**   | ship                   | Unchanged — push, handoff, re-scope                                                     |
| **EVOLVE** | retro + learn + evolve | Single SESSION-EVAL.json output instead of 3 separate phases                            |

### Key Changes

1. **Readiness gate before BUILD**: SCOPE.md must have all required fields filled; if any are BLOCKED/empty, the gate prevents advancement (AI-DLC backpressure pattern)
2. **Independent VERIFY agent**: Separate agent invocation with `/clear` between BUILD and VERIFY — fresh context reads only SCOPE.md + build output (ShepAlderson/copilot-orchestra pattern)
3. **Plan Delta for scope changes**: If scope changes mid-BUILD, agent writes SCOPE-DELTA.md with "what changed, why, impact" and re-enters readiness gate (ABIvan-Tech pattern)
4. **Single EVOLVE output**: SESSION-EVAL.json replaces retro.md + patterns/ + anti-patterns/ + evolution.json updates — machine-readable, AI-parsable

### Migration Path

The 5-phase model is adopted immediately for new work. The 11-phase state machine entry in `.vibe/state.json` is replaced. Existing completed milestones remain unchanged.

---

## Open Questions

1. Should async/sync parity use Promises or callbacks? (Proposal: Promises, matches Node ecosystem)
2. Should the Tool Registry auto-discover skills from the filesystem or require explicit registration? (Proposal: Explicit — simpler, more reliable)
3. Should CI gates run pre-commit or pre-push? (Proposal: Both — quick checks pre-commit, full suite pre-push)

---

## Review Feedback (from /vibe:plan)

### CEO Review (Product)

| Key Input | Incorporated |
|-----------|--------------|
| 10-star version = agent auto-discovers + explains why tools are unusable | Added to use cases: "why is tool X unavailable?" |
| Narrowest wedge = AGENTS.md per section (zero code, proves concept) | Priority order: AGENTS.md → Tool Registry → CI Gates |
| OUT of scope: async/sync parity, settings schema, monorepo, visual builder, behavior tests, GitHub Actions | Confirmed as deferred |

### Eng Review (Architecture)

| Key Input | Incorporated |
|-----------|--------------|
| isUsable() needs 3s timeout to prevent network hangs | Added to Tool Registry spec |
| Registry should return BOTH usable AND unusable tools with reasons | Added getUnusable() method |
| Test matrix needs 4 layers: unit, integration, existence, config | Added to test plan |
| Async primitive: Promises (standard Node.js) | Decision logged |
| Skill registration: Explicit (ToolRegistry.register) | Decision logged |
| CI gate timing: Both pre-commit (quick) + CI (full) | Decision logged |
| Registry API: Class with register/findUsable/findAll/getUnusable | Decision logged |

### Design Review

**N/A** — CLI-only repo, no UI surfaces.

### Implementation Order (This Cycle)

1. **AGENTS.md per section** — 4 files, zero code, proves concept
2. **Tool Registry** — highest impact, lowest code cost
3. **CI Quality Gates** — ESLint + pre-commit + harness update

See `plans/plan-design-doc-implementation.md` for full breakdown.

---

## Current vs. Enhanced

### Before (Current)

```
SKILL.md                ← One file tells agent everything
catalog/tools.yaml      ← 35 tools, flat
bin/skill-loader.js     ← Loads all skills, no filtering
.vibe/evolution.json    ← Ad-hoc rule tracking
45 skills               ← All sync methods
1 test gate             ← jest only
```

### After (Enhanced)

```
SKILL.md                ← Entry point, delegates to section AGENTS.md
catalog/AGENTS.md       ← How to add/find tools
skills/AGENTS.md        ← How skills are structured
references/AGENTS.md    ← How reference docs work
.vibe/AGENTS.md         ← How lifecycle works
catalog/tools.yaml      ← Same 35+ tools
lib/tool-registry.js    ← Registry with is_usable() filtering
lib/settings.js         ← Exported settings schema
45 skills               ← All methods have sync + async versions
4 test gates            ← lint, typecheck, test, validate
```
