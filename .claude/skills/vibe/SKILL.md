---
name: vibe-orchestrator
description: "Use for: new projects, product ideas, 'I want to build X' requests.
  Runs 4-phase enterprise workflow: Phase 1 (intent capture + scoping + virtual team),
  Phase 2 (market research + competitive analysis + knowledge-base synthesis),
  Phase 3 (doc generation: PROJECT.md PRD.md SRS.md architecture.md security.md),
  Phase 4 (anti-slop implementation, TDD, OWASP gates, one-click deploy).
  Use /vibe phase2, /vibe phase3, /vibe phase4 to jump to a specific phase.
  Maintains persistent state in .vibe/projects/. Activates virtual team reviews."
argument-hint: "[phase1|phase2|phase3|phase4] [project-name]"
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

# Vibe-Stack Orchestrator — 4-Phase Enterprise Workflow

## Phase Dispatcher

Read `$ARGUMENTS` and route:
- No args or `phase1` → run Phase 1 below (full inline)
- `phase2` → load `.claude/skills/vibe/phase2.md` and execute it
- `phase3` → load `.claude/skills/vibe/phase3.md` and execute it
- `phase4` → load `.claude/skills/vibe/phase4.md` and execute it
- `help` or `status` → show current project state from `.vibe/state.json`
- `resume [slug]` → load `.vibe/projects/{slug}/MANIFEST.yaml` and resume from last phase

---

## State Initialization

Before any phase, ensure state directory exists:

```bash
mkdir -p .vibe/projects
```

If `.vibe/state.json` exists, read it for `current_project`, `current_phase`, `agent_status`.
If it doesn't exist, initialize:

```json
{
  "current_project": null,
  "current_phase": 1,
  "agent_status": "idle",
  "dirty": false,
  "last_updated": "<ISO timestamp>"
}
```

---

## Phase 1 — Intent Capture (Full Inline)

### Purpose
Transform a vague idea into a scoped, validated, cross-examined product concept.
Output: `.vibe/projects/{slug}/PROJECT.md` + virtual team review.

### Q&A Sequence (10 Questions)

Ask these ONE AT A TIME. Wait for the user's answer before asking the next.
After each answer, acknowledge briefly and show you understood before moving on.

**Q1 — Core Problem**
> "What problem does this solve? Describe it in one sentence as if explaining to a 10-year-old."

**Q2 — Target Users**
> "Who specifically will use this? Give me 3 concrete examples of a real person (name, job, age, situation)."

**Q3 — Unique Value**
> "Why would someone choose this over existing alternatives? What's the one thing that makes this different?"

**Q4 — Success Metrics (KPIs)**
> "How will you know this is working in 6 months? Name 2-3 numbers you'd track."

**Q5 — Monetization**
> "How does this make money? (subscription, one-time, ads, freemium, marketplace cut, etc.)"

**Q6 — Timeline**
> "What's your target launch date, and what's the smallest version you'd be proud to show someone?"

**Q7 — Budget / Constraints**
> "What's your rough budget? Are there any hard technical constraints (must use X, must integrate with Y)?"

**Q8 — Non-Goals (Scope Boundary)**
> "What does this explicitly NOT do? Name 3 things that are out of scope for v1."

**Q9 — Reference Products**
> "Name 3 products you admire (can be in any industry). What specifically do you like about them?"

**Q10 — Open Question**
> "Is there anything I haven't asked that you think is critical for me to know?"

---

### After Q&A: Generate PROJECT.md Draft

Write to `.vibe/projects/{slug}/PROJECT.md` using this template:

```markdown
# PROJECT.md — {Project Name}
> Living spec. Last updated: {date}. Phase: 1.

## Overview
{One paragraph summary from Q1 answers}

## Target Users
{3 user personas from Q2}

## Unique Value Proposition
{From Q3}

## Success Metrics (KPIs)
{From Q4 — numbered list}

## Monetization
{From Q5}

## v1 Scope
**In scope:**
{Minimum viable feature set}

**Out of scope (v1):**
{From Q8}

## Timeline
{From Q6 — target date + MVP definition}

## Constraints
{From Q7 — budget, tech constraints}

## Reference Products
{From Q9 — 3 products + what we're borrowing}

## Open Notes
{From Q10}

## Assumptions
{List the assumptions Claude is making — mark as [UNVERIFIED]}
```

Then:
1. Write the file: `Write .vibe/projects/{slug}/PROJECT.md`
2. Write the manifest: `Write .vibe/projects/{slug}/MANIFEST.yaml`

```yaml
slug: {slug}
phase: 1
status: in_progress
created: {ISO timestamp}
last_updated: {ISO timestamp}
phase1_complete: false
phase2_complete: false
phase3_complete: false
phase4_complete: false
```

---

### Virtual Team Review (Phase 1)

After generating PROJECT.md, run a virtual team review. Each role gives a 2-3 sentence critique:

**CEO** (from `skills/orchestration/virtual-team/index.js`):
- Is this a real business? What's the biggest risk to viability?
- What would you cut to ship faster?

**CTO**:
- What's the highest-risk technical assumption in this spec?
- What would break at 10x scale?

**Designer** (anti-slop lens, `skills/design/anti-slop/index.js`):
- Does the value prop translate to clear UX? What's the #1 design risk?
- What pattern from the 41 anti-slop rules applies here?

**QA**:
- What's the edge case that will kill you in production?
- What error state isn't accounted for?

**Security** (`skills/quality/security-audit/index.js`):
- Which OWASP Top 10 category is most likely to bite this product?
- What data does this handle that needs encryption or access control?

**PM**:
- Which feature in scope has the lowest ROI? Consider cutting it.
- Are the KPIs measurable with the current spec?

Present all 6 reviews in a single block. Then ask:

> "The virtual team has reviewed your concept. Here's their verdict: [summary of top 3 concerns].
> Do you want to revise PROJECT.md based on this feedback, or proceed to Phase 2 (market research)?"

---

### Phase 1 Gate

Use AskUserQuestion:
- Option A: "Revise PROJECT.md first" → loop back, update file, re-run virtual team
- Option B: "Proceed to Phase 2" → update MANIFEST.yaml (`phase1_complete: true`, `phase: 2`), load `phase2.md`
- Option C: "Save and exit" → update MANIFEST.yaml, save state, exit cleanly

Update `.vibe/state.json` on exit:
```json
{
  "current_project": "{slug}",
  "current_phase": 2,
  "agent_status": "idle",
  "dirty": false,
  "last_updated": "{ISO timestamp}"
}
```

---

## Phase 2 Summary (Lazy Reference)

Market research + competitive analysis + knowledge-base synthesis.

**To execute**: Read `.claude/skills/vibe/phase2.md` and follow its protocol.

Inputs required: `.vibe/projects/{slug}/PROJECT.md` (must exist from Phase 1)
Output: `.vibe/projects/{slug}/knowledge-base.json`

---

## Phase 3 Summary (Lazy Reference)

Full documentation suite: PROJECT.md → PRD.md → SRS.md → architecture.md → security.md + more.

**To execute**: Read `.claude/skills/vibe/phase3.md` and follow its protocol.

Inputs required: Phase 2 complete (`phase2_complete: true` in MANIFEST.yaml)
Output: `.vibe/projects/{slug}/` — all 10 documents

---

## Phase 4 Summary (Lazy Reference)

Anti-slop implementation + TDD + OWASP gates + one-click deploy + done verification.

**To execute**: Read `.claude/skills/vibe/phase4.md` and follow its protocol.

Inputs required: Phase 3 complete (`phase3_complete: true` in MANIFEST.yaml)
Output: Production-ready codebase with verified checklist

---

## State Protocol Reference

### `.vibe/state.json` (ephemeral, runtime)
```json
{
  "current_project": "string | null",
  "current_phase": 1,
  "agent_status": "idle | running | blocked | waiting_for_user",
  "dirty": false,
  "context_usage_pct": 0,
  "last_updated": "ISO 8601"
}
```

### `.vibe/projects/{slug}/MANIFEST.yaml` (persistent, cross-session)
```yaml
slug: string
phase: 1-4
status: in_progress | complete | blocked
created: ISO 8601
last_updated: ISO 8601
phase1_complete: boolean
phase2_complete: boolean
phase3_complete: boolean
phase4_complete: boolean
```

**Context budget gate**: If `context_usage_pct > 85`, do NOT spawn new agents.
Log a warning to `.vibe/state.json` and ask user to start a new session.

---

## Model Routing Table

| Task | Model | Rationale |
|------|-------|-----------|
| Q&A processing, intent summarization | haiku | Simple classification, cheap |
| PROJECT.md generation, doc writing | sonnet | Balanced quality/cost |
| Architecture decisions, security review | opus | Critical decisions need best model |
| Market research synthesis | sonnet | Medium complexity |
| Virtual team review | sonnet | Role simulation, medium complexity |
| Phase 4 security audit | opus | OWASP compliance is high-stakes |
