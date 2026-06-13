# Design Doc: Vibe-Stack Repo Enhancement Roadmap

## What This Is

This repo is a **curated collection of AI tools and skills** for vibe coders — people who build software by describing what they want in plain language, not by writing code. An AI agent reads `SKILL.md`, finds tools in `catalog/tools.yaml`, and helps the vibe coder build, design, test, and ship.

**Current state**: 35 community-verified tools across 7 categories, 45 agent skills, 209 passing tests, auto-maintenance lifecycle.

---

## What We Learned From Mining 12 Top Repos

We cloned and analyzed 12 successful open-source AI repos to extract their best patterns. Here's what they do better than us:

### Our Gaps (Ranked by Opportunity)

| # | Gap | Found In | What It Means |
|---|-----|----------|---------------|
| 1 | **Tool Registry** | mastra, OpenHands SDK | A central registry where tools register themselves with `is_usable()` checks. We hardcode tool lists. |
| 2 | **Async/Sync Parity** | OpenHands SDK | Every method has both sync + async versions. We only have sync. |
| 3 | **Skill Progressive Disclosure** | OpenHands SDK | Skills are described in 1-1024 chars with truncation. Our skill descriptions have no caps. |
| 4 | **Settings Schema Export** | OpenHands SDK, mastra | Settings can be exported as a typed schema. We have no settings system. |
| 5 | **Package Split** | OpenHands SDK, mastra | Separate packages for SDK / tools / server. We have everything in one flat tree. |
| 6 | **Behavior Tests** | OpenHands SDK | Tests that verify real agent behavior, not just unit tests. We only have unit tests. |
| 7 | **CI Quality Gates** | software-agent-sdk, mastra, opencode | Pre-commit hooks + lint + typecheck + test + benchmark gates. We only have test suite. |
| 8 | **Rules Engine** | mastra, opencode, penpot | A formal rules framework with quality scoring. We have ad-hoc rules in evolution.json. |
| 9 | **AGENTS.md Per Package** | OpenHands SDK | Each package has its own AGENTS.md for AI developers. We have one global SKILL.md. |
| 10 | **Visual Pipeline Builder** | langflow, dify | Drag-and-drop agent workflows. We only have code-based orchestration. |

### Our Strengths (What We Already Do Well)

| Strength | Details |
|----------|---------|
| **Auto-maintenance lifecycle** | Only repo with a self-improving system (harness → telemetry → retro → learn → evolve) |
| **Cross-repo mining** | Only repo that systematically audits competitors for patterns |
| **Catalog curation** | 35 verified tools across 7 categories — most structured catalog |
| **Agent-native descriptions** | Every tool has `what_it_does` + `how_agent_uses` (for AI agents, not humans) |
| **Zero-risk direct push** | YAML-only changes go straight to main without PR overhead |
| **Community verification** | Every tool checked for stars, license, activity before inclusion |

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

| Feature | Why Not |
|---------|---------|
| Visual pipeline builder | Requires UI — too complex for MVP |
| Package split into monorepo | Benefits not worth migration cost yet |
| Behavior tests | Need real agent framework first |
| Rules engine quality scoring | Already have evolution.json — iterate, don't replace |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Tool Registry | Hardcoded lists | Plugable with is_usable() |
| AGENTS.md files | 0 | 4 (catalog, skills, references, .vibe) |
| CI gates | Test only (jest) | 4 gates (lint, typecheck, test, validate) |
| Async methods | 0 | All 45 skills |
| Settings schema | None | Exported programmatically |

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

## Open Questions

1. Should async/sync parity use Promises or callbacks? (Proposal: Promises, matches Node ecosystem)
2. Should the Tool Registry auto-discover skills from the filesystem or require explicit registration? (Proposal: Explicit — simpler, more reliable)
3. Should CI gates run pre-commit or pre-push? (Proposal: Both — quick checks pre-commit, full suite pre-push)

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
