# Plan: Design Doc Enhancement Roadmap — Implementation

## 1. CEO Review (Product Perspective)

### What's the 10-star version of this?
The Vibe-Stack repo transforms from a static tool catalog into an **active development partner**:
- Agent auto-discovers what tools the user has installed and only recommends usable ones
- Every directory has AI-readable docs so the agent never asks "how do I add a tool?"
- CI gates catch every quality regression before it ships
- The 5-phase pipeline runs so smoothly the user only needs to say "ship this" at the end
- The agent self-improves after every session by writing structured eval output

### What's the narrowest wedge that proves demand?
**Priority 2 — AGENTS.md per section.** Zero code changes. Pure documentation. It proves the thesis: AI-readable docs in every directory measurably improve agent performance. If this doesn't work, nothing else matters.

**Implementation**: 4 files, ~50 lines each, one commit. Run `npm test` to confirm zero regressions. Done in under 5 minutes.

### What's definitely OUT of scope for this version?
| Item | Why Out |
|------|---------|
| Async/sync parity across all 50 skills | Touches every skill file — too broad for this cycle |
| Settings schema export | High cost (new schema system), medium impact |
| Package split into monorepo | Benefits don't justify migration cost |
| Visual pipeline builder | Requires UI — not applicable to this repo |
| Behavior tests | Need a real agent framework first |
| CI GitHub Actions workflow | We're local-only; GitHub Actions is optional infra |

---

## 2. Eng Review (Architecture)

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CURRENT STATE                                 │
│                                                                      │
│  SKILL.md ──→ Agent reads ──→ catalog/tools.yaml ──→ 35 tools       │
│                                     │                                │
│                                     ↓                                │
│                              bin/skill-loader.js ──→ 50 skills       │
│                                     │                                │
│                                     ↓                                │
│                              No filtering, no is_usable()            │
│                              All skills loaded blindly              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        TARGET STATE (This Cycle)                     │
│                                                                      │
│  SKILL.md ────→ catalog/AGENTS.md (how to add/find)                 │
│                   skills/AGENTS.md  (skill structure)                │
│                   references/AGENTS.md (reference docs)              │
│                   .vibe/AGENTS.md   (lifecycle)                      │
│                                                                      │
│  lib/tool-registry.js ──→ ToolRegistry.register('name', {           │
│                              isUsable: () => checkInstalled()        │
│                            })                                        │
│                            │                                         │
│                            ↓                                         │
│                   Agent: ToolRegistry.findUsable('category')         │
│                            │                                         │
│                            ↓                                         │
│                   Only returns tools available on machine            │
│                                                                      │
│  CI Gates: lint + typecheck + test + validate                        │
│   (eslint config added, pre-commit hook wired)                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow (Tool Registry)

```
Agent query: "find me a deploy tool"
         │
         ↓
ToolRegistry.findUsable('deploy')
         │
         ↓
  ┌─────────────────┐
  │ git-free-deploy  │ ← isUsable: () => exec('git --version').ok
  │ one-click-netlify│ ← isUsable: () => which('netlify-cli').ok
  │ one-click-vercel │ ← isUsable: () => which('vercel-cli').ok
  └─────────────────┘
         │
         ↓
Agent returns: [git-free-deploy, one-click-netlify]
(vercel excluded — CLI not installed, agent explains why)
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| ToolRegistry | `lib/tool-registry.js` | Registry class with register/findUsable/findAll |
| skill-loader | `bin/skill-loader.js` | Refactored to use ToolRegistry instead of hardcoded lists |
| AGENTS.md (4) | `catalog/`, `skills/`, `references/`, `.vibe/` | AI-readable directory docs |
| ESLint config | `.eslintrc.js` | Lint gate for JS files |
| Pre-commit hook | `.husky/pre-commit` | Quick checks before commit |

### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| No tools registered | Registry returns empty array; agent tells user "no usable tools found" |
| isUsable() throws | Registry catches, logs error, returns false for that tool |
| Multiple tools same name | Last registered wins (registration is a Map) |
| AGENTS.md already exists | Skip creation (idempotent) |
| ESLint not installed | Lint gate skips if eslint not in node_modules |
| Pre-commit hook fails | Git allows commit with --no-verify; warning logged |

### Test Matrix

| Test Layer | What It Covers | File |
|------------|----------------|------|
| Registry unit | register, findUsable, findAll, edge cases | `lib/tool-registry.test.js` |
| Registry integration | Real isUsable() checks (git --version) | `lib/tool-registry.test.js` |
| AGENTS.md existence | All 4 files exist with required sections | `lib/harness.test.js` |
| ESLint config validity | Config parses, rules are valid | `lib/lint-config.test.js` |

### Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| isUsable() blocks on network | Agent hangs | Add timeout (3s default) to isUsable checks |
| ToolRegistry not imported | Skills loaded old way | import check in harness: verify registry is used |
| AGENTS.md content stale | Agent gets wrong info | Content review in VERIFY phase (structural scan) |
| ESLint rule conflict | Lint fails on valid code | Pin ESLint config version; test before shipping |

### Dependencies

| Dependency | Version | Why |
|------------|---------|-----|
| Node.js | 18+ | Runtime |
| npm | Any | lint gate (npx eslint) |
| Git | Any | isUsable() checks for git tools |
| Husky | 9+ | Pre-commit hooks (optional — skip if not installed) |

---

## 3. Design Review

**Skip**: No UI in this repo. Design review is N/A.

---

## 4. Implementation Plan

### Chosen Priorities (This Cycle)

| Priority | Why Now |
|----------|---------|
| **P2: AGENTS.md per section** | Zero code, proves concept, high impact |
| **P1: Tool Registry** | Highest impact, low code cost, blocks no other work |
| **P3: CI Quality Gates** | Medium cost, high impact — after registry is wired |

### Task 1: Create 4 AGENTS.md files
- `catalog/AGENTS.md` — how to add/find tools
- `skills/AGENTS.md` — how skills are structured
- `references/AGENTS.md` — how reference docs work
- `.vibe/AGENTS.md` — already exists (check content, update if needed)
- **Test**: File existence check + required section check in harness

### Task 2: Implement ToolRegistry
- **File**: `lib/tool-registry.js` — class with:
  - `register(name, { isUsable, metadata })`
  - `findUsable(category)` — returns only tools where isUsable() returns true
  - `findAll()` — returns all registered tools
  - `getUnusable(category)` — returns unusable tools with reasons
- **Refactor**: `bin/skill-loader.js` to use ToolRegistry instead of hardcoded list
- **Test**: `lib/tool-registry.test.js` — register, findUsable, findUnusable, edge cases

### Task 3: Add CI Quality Gates
- **ESLint**: `.eslintrc.js` with basic rules (no-unused-vars, semi, quotes)
- **Pre-commit**: `.husky/pre-commit` — runs eslint, YAML validation
- **Lint config test**: `lib/lint-config.test.js` — config parses
- **Harness update**: Add lint + typecheck to auto-maintain.js harness checks

### Task 4: Update Design Doc
- Mark priorities 1-3 as "in progress" or "completed"
- Add CI gates to success metrics
- Note Tool Registry API decisions

---

## 5. Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| AC1 | 4 AGENTS.md files exist | File existence check |
| AC2 | ToolRegistry class with register/findUsable/findAll | Unit tests pass |
| AC3 | skill-loader.js uses ToolRegistry | Code review |
| AC4 | ESLint config exists and parses | ESLint config test |
| AC5 | Pre-commit hook file exists | File check |
| AC6 | All existing 638 Jest tests still pass | npm test |
| AC7 | AGENTS.md content review passes | Each file has required sections |

---

## 6. Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Which priority first | P2 (AGENTS.md) → P1 (Registry) → P3 (CI Gates) | Zero-risk docs first, then code, then infra |
| Registry API | class with register/findUsable/isUsable | Matches mastra/OpenHands SDK patterns |
| isUsable timeout | 3s default | Prevents network hangs during tool discovery |
| Pre-commit vs full CI | Pre-commit (quick) + GitHub Actions (optional full) | Both — matches opencode pattern |
| ESLint rules | Minimal set (8-10 rules) | Avoids false positives; expand later |
