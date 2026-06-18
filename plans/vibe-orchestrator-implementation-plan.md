# Vibe-Stack Orchestrator: Deep-Research Implementation Plan

> 5-angle web search synthesis | Self-critique | Step-by-step with rationale | Why this, not alternatives

---

## Part 1: Self-Critique of Original Plan

| Issue                                 | Original Plan                                 | Reality (Research-Corrected)                                                                                                                                                                                                                                                         | Impact                            |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| **Directory path**                    | `.claude/skills/vibe-orchestrator/SKILL.md`   | Correct — `.claude/skills/<name>/SKILL.md` IS the canonical path (official docs). Old `.claude/commands/*.md` still works but is legacy.                                                                                                                                             | ✅ No change                      |
| **`description` auto-trigger**        | Assumed it triggered auto-invocation          | Confirmed: `description` is always in Claude's context (~150 tokens). Full skill body loads on match. `disable-model-invocation: true` disables this.                                                                                                                                | ✅ Confirmed                      |
| **File size guidance**                | 200-300 lines                                 | Official soft limit: **500 lines**. After compaction, only **5,000 tokens** re-attach per skill; multiple skills share **25,000-token** budget. 200-300 is safe but doesn't need to be the limit.                                                                                    | ⚠️ Underestimated — can go higher |
| **CLAUDE.md "Skill Routing" section** | "Add `## Skill Routing` section to CLAUDE.md" | This is a **gstack-specific convention**, not a Claude Code feature. Claude Code routes natively via `description` frontmatter. Adding a routing section to CLAUDE.md duplicates functionality already provided by the skill system.                                                 | ❌ Wrong — remove this            |
| **Always-on vs opt-in decision**      | Not addressed                                 | **Critical design decision**: Per official docs and multiple production examples, CLAUDE.md = always-on advisory behavior; slash commands = opt-in workflow triggers. An orchestrator whose Phase 1 must fire on first message belongs in CLAUDE.md. Heavy phases belong in a skill. | ❌ Missed                         |
| **Monolithic skill structure**        | One big SKILL.md                              | Impeccable's CLAUDE.md warns: "**menu pollution problem is real**." gstack uses 60+ skill dirs. Best practice: one primary skill (`/vibe`) with lazy-loaded reference files per phase.                                                                                               | ❌ Wrong structure                |
| **State persistence design**          | Not specified                                 | Production architectures (Praetorian, gstack) use dual-tier: ephemeral JSON (runtime) + persistent YAML manifests (cross-session). Must define schema upfront.                                                                                                                       | ❌ Missing                        |
| **`allowed-tools` spec**              | Not specified                                 | Production skills explicitly list tools. Missing this causes unnecessary permission prompts every invocation.                                                                                                                                                                        | ❌ Missing                        |
| **CLAUDE.md enforcement reality**     | Assumed compliance                            | Research finding: "CLAUDE.md gets 25-40% compliance; hooks get ~95%." CLAUDE.md is advisory — Claude may ignore it late in sessions. Critical rules need hooks, not just CLAUDE.md text.                                                                                             | ❌ Missed — compliance gap        |
| **Hooks for hard enforcement**        | Not mentioned                                 | `settings.json` hooks provide **deterministic** enforcement vs CLAUDE.md's advisory behavior. `PreToolUse` can block tool calls; `PostToolUse` can enforce quality gates; `Stop` can block session end.                                                                              | ❌ Missing a full layer           |
| **Token budget design**               | Not considered                                | `description` + `when_to_use` truncated at **1,536 chars**. A poorly written 2,000-char description is silently truncated, breaking auto-trigger logic.                                                                                                                              | ❌ Missing                        |

**Net verdict**: The original plan had the right directory and surface understanding. It missed: the always-on vs. opt-in split, lazy-loading for size management, state persistence schema, hook-based enforcement, and token budget constraints.

---

## Part 2: Research Synthesis (Cross-Verified, 5 Angles, 15+ Sources)

### 2.1 Official Claude Code Skills Architecture

**Source**: `code.claude.com/docs/en/skills` (canonical, 2026)

```
.claude/
├── skills/
│   └── <name>/
│       ├── SKILL.md            ← Required: main skill file
│       └── *.md                ← Optional: reference files, lazy-loaded
└── settings.json               ← Hooks (deterministic enforcement)
```

**Frontmatter reference** (all optional except `description` which is "recommended"):

```yaml
---
name: display-label # Does NOT change /command name
description: '...' # Always in context; drives auto-invocation; ≤1536 chars
when_to_use: '...' # Appended to description; same 1536-char cap
argument-hint: '[phase]' # Cosmetic autocomplete hint
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - WebSearch
  - Bash(mkdir -p .vibe/*)
disable-model-invocation: false # true = user-only; hides from context
user-invocable: true # false = Claude-only; hidden from / menu
---
```

**Token budgets** (hard constraints, not soft):

- Description + `when_to_use`: truncated at **1,536 chars** in skill listing
- Skill body re-attached after compaction: **5,000 tokens** per skill
- Multiple skills: **25,000-token** shared re-attach budget

### 2.2 CLAUDE.md vs Slash Commands vs Hooks: The Definitive Split

**Sources**: `code.claude.com/docs/en/hooks-guide`, alexop.dev, Medium/Morbel, builder.io, morphllm.com

| Layer                     | What it does                                                  | Compliance           | When to use                                                              |
| ------------------------- | ------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| **CLAUDE.md**             | Static context loaded at session start; advisory instructions | ~25-40% late-session | Project conventions, tech stack, naming, non-critical defaults           |
| **Slash command / Skill** | Opt-in multi-step workflow; loads on demand                   | 100% when invoked    | Repeatable workflows user triggers deliberately (phases 2-4)             |
| **settings.json Hooks**   | Deterministic shell commands at lifecycle events              | ~95-100%             | Hard rules that MUST run: linting, security scans, blocking bad commands |
| **Subagents**             | Isolated execution context                                    | 100% when spawned    | Parallel tasks, sandboxed research, review agents                        |

**Critical insight (builder.io pattern)**: "CLAUDE.md = project awareness and persistent memory ('always use MUI components'). Slash commands = task executors." The two serve orthogonal purposes.

**The compliance gap**: CLAUDE.md instructions are advisory. Claude may deprioritize them as conversations lengthen ("context drift"). For the orchestrator:

- Phase 1 always-on behavior: CLAUDE.md (advisory is acceptable here — it's just framing)
- Quality enforcement, anti-slop rules, security gates: `settings.json` hooks (deterministic)

### 2.3 Production Skill Packaging: gstack, impeccable, superpowers

**Source**: Local repo analysis + web research (`github.com/garrytan/gstack`, `pbakaus/impeccable`, `obra/superpowers`)

|                   | gstack                                      | impeccable                                    | superpowers                                          |
| ----------------- | ------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| Stars             | ~110k                                       | ~38k                                          | ~227k                                                |
| Skill file format | `.tmpl` (compiled → SKILL.md)               | `SKILL.src.md` (compiled → SKILL.md per tool) | Plain SKILL.md                                       |
| Install path      | `.claude/skills/gstack/`                    | `.claude/skills/impeccable/`                  | Via plugin installer                                 |
| Skill count       | 60+ dirs (multi-phase pipeline)             | 1 skill / 23 sub-commands                     | 14 independent skills                                |
| Multi-tool        | Yes (10 agents)                             | Yes (12+ agents)                              | Yes (8+ agents)                                      |
| CLAUDE.md role    | Project config written BY skills            | Developer manual (not user-facing)            | Root-level tool config                               |
| Key lesson        | Phase-gated pipeline; state in `~/.gstack/` | Sub-commands avoid menu pollution             | Auto-trigger via description; "skills are mandatory" |

**Impeccable's explicit warning** (from its own CLAUDE.md):

> "Do not add standalone skills unless there's a strong reason. The consolidation was deliberate: **the `/` menu pollution problem is real** and gets worse as users install more plugins."

### 2.4 Multi-Phase AI Orchestrator Patterns (Production Evidence)

**Sources**: Augment Code, Praetorian, GitHub Gist (ppries), arxiv, LangGraph/Latenode

**The Three-Role Canonical Model** (Augment Code):

- **Coordinator** → decomposes spec into subtasks with explicit interfaces
- **Implementors** → execute in parallel waves (DAG-ordered)
- **Verifier** → blocks pre-merge; checks spec vs. implementation

**The 16-Phase Production Architecture** (Praetorian):
Setup → Triage → Discovery → Skill Discovery → Complexity Assessment → Brainstorming → Architecture Planning → Implementation → Design Verification → Domain Compliance → Code Quality → Test Planning → Testing → Coverage Verification → Test Quality → Completion

Key insight: **intelligent phase skipping** — a bug fix completes in ~5 phases, not 16. Task complexity drives which phases execute.

**Phase Gate Mechanisms** (production-verified):

1. **File-as-gate**: `shared-state.json` with `tests_passed: true` — agent can't exit phase until file exists
2. **Context usage gate**: `>85%` context → hard block on spawning new agents
3. **Three-tier quality gates**: intra-task (max 10 iterations) → inter-phase (review required) → orchestrator (re-invokes if goals missed)
4. **AskUserQuestion** (gstack pattern): explicit user approval at D1..D8 decision points
5. **Convergence detection**: stop review loops if two consecutive cycles return identical findings

**Token efficiency** (Praetorian measurements):

- Thin-agent architecture: 89% token reduction per agent spawn (2,700 vs. 24,000 tokens)
- Symbol-level file ops: 40,000 → 1,000 tokens for 5-file tasks
- Lazy-loading reference files per phase: critical for staying under 5,000-token re-attach limit

**State persistence** (production pattern):

- **Ephemeral** (runtime): `.vibe/state.json` — dirty bits, current phase, agent status. Cleared on session restart.
- **Persistent** (cross-session): `.vibe/projects/{slug}/MANIFEST.yaml` — survives resets; enables resumption
- **File locking**: `.vibe/locks/{agent}.lock` for concurrent agent safety

### 2.5 AGENTS.md Standard

**Source**: `github.com/agentsmd/agents.md` (22.2k stars), agent-rules/agent-rules

- AGENTS.md is gaining traction (formalized ~August 2025, GitHub Copilot native support)
- Claude Code primarily uses `CLAUDE.md`, but supports AGENTS.md via symlink:
  `ln -s AGENTS.md CLAUDE.md`
- **Recommended format**: plain Markdown, no required schema, under 150 lines
- **Relevant for vibe-stack**: consider creating `AGENTS.md` that symlinks to `CLAUDE.md` for multi-tool compatibility

---

## Part 3: Why This Solution (Alternatives Rejected)

### Why NOT: Pure CLAUDE.md injection

A 4-phase orchestrator with research protocols, doc templates, and anti-slop rules would add ~5,000-10,000 tokens to **every** Claude session in this repo. 90% of sessions (quick edits, code review, Q&A) don't need Phases 2-4. Severe token waste. CLAUDE.md is also advisory — Phase 1 framing is fine there, but detailed workflows get ignored. **Rejected: too costly, too fragile.**

### Why NOT: Multiple independent phase skills (`/vibe-research`, `/vibe-docs`, `/vibe-implement`)

gstack uses this because its phases are genuinely independent products. Our phases are **sequentially dependent**: Phase 3 docs require Phase 2 research; Phase 4 implementation requires Phase 3 docs. Independent skills force users to manually thread state between commands. Additionally, more skills = more menu pollution. **Rejected: breaks dependency chain, pollutes menu.**

### Why NOT: Monolithic single SKILL.md

All 4 phases inline = easily 2,000+ lines. After compaction, only 5,000 tokens re-attach. The implementation phase alone (anti-slop 41 rules + OWASP 10 checks + virtual team 6 role prompts) would fill that budget without room for the phases themselves. Content would be silently dropped mid-session. **Rejected: exceeds token budget.**

### Why NOT: settings.json hooks only

Hooks run shell commands, not prompt instructions. They can enforce rules (don't write to `.env`, run lint after Write) but can't drive a multi-phase Q&A workflow, spawn research agents, or generate documentation. **Rejected: wrong tool for prompt-level orchestration.**

### Why THIS: Hybrid 5-Layer Architecture

```
Layer 1: CLAUDE.md (~300 tokens, always present)
         → Orchestrator identity, core principles, Phase 1 framing, memory layer refs

Layer 2: .claude/skills/vibe/SKILL.md (~400 lines, loaded on /vibe or matching description)
         → Phase dispatcher, Phase 1 full Q&A, phase gates, state management protocol

Layer 3: .claude/skills/vibe/phase*.md (lazy-loaded per phase, ~150 lines each)
         → phase2.md: market research protocol
         → phase3.md: documentation templates
         → phase4.md: implementation guardrails

Layer 4: .vibe/ state directory
         → Ephemeral: state.json (runtime phase tracking)
         → Persistent: projects/{slug}/MANIFEST.yaml (cross-session)
         → Project artifacts: PROJECT.md, PRD.md, decisions.json, knowledge-base.json

Layer 5: settings.json hooks (deterministic enforcement)
         → PostToolUse Write: auto-run anti-slop scan on design files
         → Stop: verify active project has PROJECT.md before session end
```

**This wins because:**

- CLAUDE.md provides always-on framing without bloating every session (~300 tokens vs ~10,000)
- `/vibe` skill provides the heavy phases on-demand (5,000-token re-attach budget used efficiently)
- Lazy-loading reference files keeps each file under 500-line soft limit
- State dir enables cross-session continuity (Praetorian's MANIFEST pattern)
- Hooks provide the deterministic enforcement that CLAUDE.md cannot guarantee

---

## Part 4: Step-by-Step Implementation Plan

### Step 1: Update `CLAUDE.md` (Always-On Layer, ~60 additional lines)

**File**: `/home/user/project/CLAUDE.md`

Add at the end:

```markdown
## Vibe-Stack Orchestrator

You are the Vibe-Stack Orchestrator — enterprise AI software engineering architect,
product strategist, and prompt engineer. For non-technical users building production software.

### Core Principles (Non-Negotiable)

- **Zero Hallucinations**: All recommendations grounded in user input, tool results, or PROJECT.md
- **Token Efficiency**: Cheap models for simple tasks, strong models for complex
- **Plain English**: Translate everything technical to non-technical language
- **Phase Gates**: Never skip or merge phases. Summarize and confirm before advancing.

### Memory Layers (Always Active)

1. **context-memory** (`.vibe/context-memory.json`): Decisions + rationale + keywords
2. **knowledge-base** (`.vibe/knowledge-base.json`): Tagged, searchable research
3. **PROJECT.md** (`.vibe/projects/{slug}/PROJECT.md`): Living spec, prepended to major prompts

### Phase 1: Intent Capture (Always-On)

For any message containing: "I want to build", "help me create", "I have an idea",
"build me", "make me", or describing a new product/app/SaaS — immediately activate
Phase 1 Intent Capture before responding. Ask the Q&A sequence from `/vibe`.

### Virtual Team Roles

When activating team review, use these perspectives from `skills/orchestration/virtual-team/`:

- CEO: ruthless prioritization, scope reduction, ROI
- CTO: architecture, scalability, tech debt, security
- Designer: anti-slop (41 rules), WCAG, taste-skill dials
- QA: edge cases, race conditions, mobile, empty/error states
- Security: OWASP Top 10, auth, data exposure, injection
- PM: requirements alignment, user stories, KPIs

### Model Routing

Route tasks to optimal model (`skills/orchestration/model-router/`):

- Simple questions, summaries, classification → haiku ($0.25/M tokens)
- Code generation, analysis, planning → sonnet ($3/M tokens)
- Architecture decisions, security review, complex orchestration → opus ($15/M tokens)
```

**Why 60 lines**: Enough to establish identity and Phase 1 trigger without pushing CLAUDE.md over 200 lines total. Heavy workflows deliberately excluded to avoid context bloat.

---

### Step 2: Create Main Skill File

**File**: `/home/user/project/.claude/skills/vibe/SKILL.md`

**Frontmatter** (keep description under 1,536 chars):

```yaml
---
name: vibe-orchestrator
description: "Use for: new projects, product ideas, 'I want to build X' requests.
  Runs 4-phase enterprise workflow: Phase 1 (intent capture + scoping + virtual team),
  Phase 2 (market research + competitive analysis + knowledge-base synthesis),
  Phase 3 (doc generation: PROJECT.md PRD.md SRS.md architecture.md security.md),
  Phase 4 (anti-slop implementation, TDD, OWASP gates, one-click deploy).
  Use /vibe phase2, /vibe phase3, /vibe phase4 to jump to a specific phase.
  Maintains persistent state in .vibe/projects/. Activates virtual team reviews."
argument-hint: '[phase1|phase2|phase3|phase4] [project-name]'
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Bash(mkdir -p .vibe/*)
  - Bash(cat .vibe/*)
  - Bash(ls .vibe/*)
  - WebSearch
  - WebFetch
  - Agent
  - AskUserQuestion
---
```

**Body structure** (~350 lines):

1. Phase dispatcher: reads `$ARGUMENTS` to route to correct phase
2. State initialization: creates `.vibe/` structure if not exists
3. **Phase 1 — full inline** (not lazy-loaded; always needed on `/vibe`):
   - Q&A sequence (10 questions covering problem, users, value prop, KPIs, monetization, timeline, budget, tech constraints, non-goals, references)
   - PROJECT.md draft template
   - Virtual team activation matrix
   - Phase gate: "Ready to proceed to Phase 2?" (AskUserQuestion)
4. Phase 2 summary + `→ Read .claude/skills/vibe/phase2.md`
5. Phase 3 summary + `→ Read .claude/skills/vibe/phase3.md`
6. Phase 4 summary + `→ Read .claude/skills/vibe/phase4.md`
7. State protocol (JSON schema + MANIFEST.yaml structure)
8. Model routing table

---

### Step 3: Create Phase Reference Files (Lazy-Loaded)

**File**: `/home/user/project/.claude/skills/vibe/phase2.md` (~150 lines)

Content:

- Market research protocol: 5-10 repo/product analysis
- Source validation → cross-verification → categorization pipeline
- TAM/SAM estimation framework
- Failure pattern extraction (security, perf, UX, tech debt)
- knowledge-base synthesis format (JSON schema)
- Stress-test pipeline before any finding enters knowledge-base
- Phase gate: synthesis table → user confirmation

**File**: `/home/user/project/.claude/skills/vibe/phase3.md` (~200 lines)

Content:

- All 10 document templates with section schemas:
  - PROJECT.md (overview, goals, scope, assumptions, KPIs)
  - PRD.md (features, MoSCoW, user stories, acceptance criteria)
  - SRS.md (functional + non-functional requirements)
  - architecture.md (Mermaid diagrams, data flows, scalability)
  - database.md (schema, choices, indexing, migrations)
  - api.md (endpoints, auth, versioning, rate limits)
  - security.md (threat model, OWASP mapping, encryption)
  - guardrails.md (taste-skill dials, anti-slop rules reference)
  - testing.md (TDD strategy, load testing)
  - deployment.md (one-click deploy, rollback plan)
- Folder-level README.md + agents.md requirements
- Phase gate: doc checklist → user confirmation

**File**: `/home/user/project/.claude/skills/vibe/phase4.md` (~150 lines)

Content:

- Anti-slop enforcement: 41 rules ref → `skills/design/anti-slop/index.js`, `external/impeccable/`
- Taste-skill dials reference: `external/taste-skill/skills/taste-skill/SKILL.md`
- TDD protocol → `skills/workflow/tdd-vibe/index.js` (Red/Green/Refactor)
- One-click deploy → `skills/deploy/one-click-vercel/index.js`
- Security gates → `skills/quality/security-audit/index.js` (OWASP 10)
- Virtual team final review: all 6 roles
- Done verifier → `skills/quality/done-verifier/index.js` (14-point checklist)
- Intent capture verification → `skills/explain/intent-capture/index.js`

---

### Step 4: Define State Directory Schema

**File**: `/home/user/project/.vibe/README.md`

```
.vibe/
├── projects/
│   └── {slug}/
│       ├── MANIFEST.yaml       ← Cross-session persistence (current phase, status)
│       ├── PROJECT.md          ← Living spec (Phase 1 output)
│       ├── PRD.md              ← Phase 3 output
│       ├── architecture.md     ← Phase 3 output
│       ├── decisions.json      ← Decisions with rationale + alternatives
│       ├── knowledge-base.json ← Phase 2 research synthesis
│       └── checkpoints/        ← Pre-risky-action snapshots
├── state.json                  ← Ephemeral runtime state (phase, agents, dirty bits)
├── context-memory.json         ← Global decisions + learnings + intents
├── knowledge-base.json         ← Global research findings
└── config.json                 ← User preferences (model preferences, style)
```

`MANIFEST.yaml` schema:

```yaml
slug: my-saas-app
phase: 2
status: in_progress
created: 2026-06-14T00:00:00Z
last_updated: 2026-06-14T01:00:00Z
phase1_complete: true
phase2_complete: false
phase3_complete: false
phase4_complete: false
```

---

### Step 5: Add Hard-Enforcement Hooks (Optional but Recommended)

**File**: `/home/user/project/.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node skills/design/anti-slop/index.js --scan \"$CLAUDE_FILE_PATHS\" 2>/dev/null && echo '{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"Anti-slop scan passed.\"}}'  || echo '{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"⚠️ Anti-slop violations found. Fix before shipping.\"}}'",
            "timeout": 30
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "if": "Bash(rm -rf *)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '⛔ Destructive command blocked by vibe-stack guardrails.' >&2; exit 2",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**Critical hook facts** (from official docs research):

- **Exit code 2 blocks** (not exit code 1 — standard Unix convention reversed here). Only PreToolUse, UserPromptSubmit, Stop, and a few others are blockable.
- Hooks output **JSON to stdout** with `additionalContext` field → injected into Claude's conversation as context (capped at 10,000 chars)
- `PostToolUse` is **not blockable** (action already happened); use for context injection and logging
- `PreToolUse` **can block** via exit 2; use for guardrails
- **31 total hook event types** in Claude Code + Agent SDK

**Why hooks here**: Anti-slop scan injects contextual feedback into Claude's conversation (not advisory, but also not blocking). PreToolUse `rm -rf` guard is hard-blocking (exit 2).

---

### Step 6: Multi-Tool Compatibility (Optional)

Add symlinks for AGENTS.md and multi-tool support:

```bash
ln -s CLAUDE.md AGENTS.md
mkdir -p .cursor/skills/vibe .gemini/skills/vibe .opencode/skills/vibe
cp .claude/skills/vibe/SKILL.md .cursor/skills/vibe/SKILL.md
cp .claude/skills/vibe/SKILL.md .gemini/skills/vibe/SKILL.md
cp .claude/skills/vibe/SKILL.md .opencode/skills/vibe/SKILL.md
```

---

### Step 7: Validate and Push

```bash
# 1. Verify file sizes (soft limit: 500 lines each)
wc -l .claude/skills/vibe/*.md

# 2. Verify description length (must be <1536 chars)
node -e "const f=require('fs').readFileSync('.claude/skills/vibe/SKILL.md','utf8'); const m=f.match(/description: \"([^\"]+)\"/); if(m) console.log('Length:', m[1].length, m[1].length <= 1536 ? '✅' : '❌ TOO LONG');"

# 3. Test skill discovery
claude -p "/vibe help"

# 4. Test Phase 1 auto-trigger
claude -p "I want to build an e-commerce SaaS for small restaurants"

# 5. Test state persistence
ls .vibe/projects/
cat .vibe/projects/*/MANIFEST.yaml

# 6. Test phase jump
claude -p "/vibe phase2"

# 7. Commit
git add .claude/ .vibe/ CLAUDE.md AGENTS.md
git commit -m "feat: add vibe-stack orchestrator 4-phase skill"
git push -u origin claude/new-session-rewka8
```

---

## Part 5: File Summary

| File                            | Lines       | Action | Token Cost      | Purpose                                               |
| ------------------------------- | ----------- | ------ | --------------- | ----------------------------------------------------- |
| `CLAUDE.md`                     | +60         | Modify | ~150/session    | Always-on: identity, Phase 1 framing, memory, routing |
| `.claude/skills/vibe/SKILL.md`  | ~400        | Create | 5,000 on invoke | Main skill: phase dispatcher + Phase 1 full           |
| `.claude/skills/vibe/phase2.md` | ~150        | Create | ~600 on Phase 2 | Market research protocol (lazy)                       |
| `.claude/skills/vibe/phase3.md` | ~200        | Create | ~800 on Phase 3 | Documentation templates (lazy)                        |
| `.claude/skills/vibe/phase4.md` | ~150        | Create | ~600 on Phase 4 | Implementation guardrails (lazy)                      |
| `.vibe/README.md`               | ~30         | Create | 0 (not loaded)  | State directory schema                                |
| `.claude/settings.json`         | ~20         | Create | 0 (hooks)       | Hard enforcement: anti-slop + phase gate              |
| `AGENTS.md`                     | 1 (symlink) | Create | 0               | Multi-tool compatibility                              |

**Total per-session overhead**: ~150 tokens (CLAUDE.md additions). The full 5,000-token skill body only loads when `/vibe` is invoked or description matches.

---

## Part 6: Reusable Assets (From Existing Repo)

| Asset                                          | Path                                               | Phase Used                    |
| ---------------------------------------------- | -------------------------------------------------- | ----------------------------- |
| Virtual team role prompts (6 roles)            | `skills/orchestration/virtual-team/index.js`       | Phase 1, 4                    |
| Model routing table                            | `skills/orchestration/model-router/index.js`       | All phases                    |
| 41 anti-slop rules                             | `skills/design/anti-slop/index.js`                 | Phase 4                       |
| OWASP 10 checks                                | `skills/quality/security-audit/index.js`           | Phase 4                       |
| Error translations                             | `skills/progress/error-translator/index.js`        | Phase 4                       |
| Memory schema                                  | `skills/knowledge/context-memory/index.js`         | All phases                    |
| Knowledge-base search                          | `skills/knowledge/knowledge-base/index.js`         | Phase 2                       |
| PROJECT.md prefix inject                       | `skills/workflow/spec-driven/index.js`             | Phase 1, 3                    |
| 14-point done checklist                        | `skills/quality/done-verifier/index.js`            | Phase 4                       |
| Taste-skill 3 dials + pre-flight 50-item check | `external/taste-skill/skills/taste-skill/SKILL.md` | Phase 3, 4                    |
| Impeccable 23 sub-commands pattern             | `external/impeccable/skill/SKILL.src.md`           | Reference for skill structure |
| gstack phase-gate AskUserQuestion pattern      | `external/gstack/`                                 | Phase gates                   |
| 1,200-line taste-skill SKILL.md                | `external/taste-skill/`                            | Phase 3 guardrails reference  |

---

## Part 7: Sources (15+ Verified)

| Source                                                                       | Used for                                                    | Confidence         |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------ |
| `code.claude.com/docs/en/skills`                                             | Official skills format, token budgets                       | High               |
| `code.claude.com/docs/en/hooks-guide`                                        | Hooks vs CLAUDE.md enforcement                              | High               |
| `alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents` | CLAUDE.md vs slash commands split                           | High               |
| `medium.com/becoming-for-better/taming-claude-code`                          | Compliance gap (25-40% vs 95%)                              | Medium (anecdotal) |
| `builder.io/blog/claude-code`                                                | Builder.io production pattern                               | High               |
| `morphllm.com/claude-code-hooks`                                             | Full 30-event hook list                                     | High               |
| `github.com/garrytan/gstack`                                                 | .tmpl pattern, 60+ skills, state dir                        | High (local repo)  |
| `github.com/pbakaus/impeccable`                                              | Sub-command pattern, menu pollution warning                 | High (local repo)  |
| `github.com/obra/superpowers`                                                | Auto-trigger, mandatory skill pattern                       | High (local repo)  |
| `augmentcode.com/guides/multi-agent-orchestration-architecture-guide`        | Three-role model, DAG waves, 15x token cost                 | High               |
| `praetorian.com/blog/deterministic-ai-orchestration`                         | 16-phase architecture, 89% token reduction, dual-tier state | High               |
| `gist.github.com/ppries`                                                     | 10-phase TDD workflow, file-as-gate pattern                 | High               |
| `arxiv.org/html/2601.13671v1`                                                | Academic 4-phase model                                      | Medium             |
| `github.com/agentsmd/agents.md`                                              | AGENTS.md standard (22.2k stars)                            | High               |
| `latenode.com/langgraph-multi-agent-orchestration`                           | LangGraph interrupt nodes, SQLite checkpointing             | High               |
| `smartscope.blog/claude-code-hooks-guide`                                    | All hook event types                                        | High               |
