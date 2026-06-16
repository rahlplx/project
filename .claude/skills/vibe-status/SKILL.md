---
name: vibe-status
description: "Project status dashboard — reads .vibe/ state to show current phase, progress,
  pending items, decisions made, and what's next. Use when: starting a session, checking
  where you left off, sharing progress with stakeholders, or before running /vibe phase commands.
  Wraps: tracker, dashboard, context-memory, knowledge-base skills."
argument-hint: "[all|phase|tasks|decisions|memory] [--project slug]"
version: 1.0.0
allowed-tools:
  - Read
  - Bash(cat .vibe/*)
  - Bash(ls .vibe/projects/*)
  - Bash(cat .vibe/projects/*/MANIFEST.yaml)
  - Bash(git log --oneline -10)
  - Bash(npm test -- --passWithNoTests*)
---

# Vibe-Status — Project Status Dashboard

## Dispatcher

- No args → full dashboard (all sections)
- `all` → same as no args
- `phase` → current phase status only
- `tasks` → task tracker / kanban board only
- `decisions` → decisions log from context-memory
- `memory` → full context-memory dump
- `--project {slug}` → force a specific project (defaults to `current_project` in state.json)

---

## Step 1 — Load State

```bash
# Read runtime state
cat .vibe/state.json

# List all projects
ls .vibe/projects/ 2>/dev/null || echo "(no projects yet)"

# Read manifest for current project
cat .vibe/projects/{slug}/MANIFEST.yaml 2>/dev/null

# Read context memory
cat .vibe/context-memory.json 2>/dev/null
```

If `.vibe/state.json` is missing or `current_project` is null: tell user no active project and suggest `/vibe` to start one.

---

## Step 2 — Phase Progress Map

Read MANIFEST.yaml and render:

```
PHASE PROGRESS — {project name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [✅] Phase 1 — Intent Capture        COMPLETE
  [✅] Phase 2 — Market Research        COMPLETE
  [🔄] Phase 3 — Documentation          IN PROGRESS  ← current
  [  ] Phase 4 — Build & Deploy         NOT STARTED

Current phase: 3 | Status: {status}
Last updated: {last_updated}
```

Then show what's been produced so far:

```
ARTIFACTS PRODUCED:
  ✅ .vibe/projects/{slug}/PROJECT.md        (Phase 1)
  ✅ .vibe/projects/{slug}/knowledge-base.json (Phase 2)
  🔄 .vibe/projects/{slug}/PRD.md            (Phase 3 — in progress)
  ❌ .vibe/projects/{slug}/architecture.md   (Phase 3 — not started)
  ❌ .vibe/projects/{slug}/security.md       (Phase 3 — not started)
```

---

## Step 3 — Recent Activity

```bash
git log --oneline -10
```

Show last 10 commits with timestamp. Highlight any commit that wrote to `.vibe/`.

---

## Step 4 — Decisions Log

Read `.vibe/context-memory.json` → `decisions` array. Render:

```
KEY DECISIONS MADE:
━━━━━━━━━━━━━━━━━━
  1. {decision title}
     Rationale: {why}
     Alternatives rejected: {what else was considered}
     Date: {date}

  2. ...

OPEN QUESTIONS (unresolved):
  • {question from PROJECT.md assumptions marked [UNVERIFIED]}
```

---

## Step 5 — What's Next

Based on current phase and status, tell the user exactly what to run:

```
WHAT TO DO NEXT:
━━━━━━━━━━━━━━━━
  You're in Phase 3. To continue:

  1. Run: /vibe phase3
     → Will generate the remaining docs: architecture.md, security.md, testing.md

  2. Or run: /vibe-review --pre-merge
     → If Phase 3 docs are done and you want team sign-off before Phase 4

  3. Or run: /vibe phase4
     → If all Phase 3 docs are complete (check list above first)
```

---

## Full Dashboard Format

```
╔══════════════════════════════════════════╗
║  VIBE-STATUS — {project name}            ║
║  {date} | Phase {N} | {status}           ║
╚══════════════════════════════════════════╝

PHASE PROGRESS:
  [✅] Phase 1 — Intent Capture         COMPLETE
  [✅] Phase 2 — Market Research        COMPLETE
  [🔄] Phase 3 — Documentation          IN PROGRESS
  [  ] Phase 4 — Build & Deploy         NOT STARTED

ARTIFACTS ({done}/{total}):
  ✅ PROJECT.md    ✅ knowledge-base.json    🔄 PRD.md
  ❌ architecture.md    ❌ security.md

RECENT COMMITS:
  {commit SHA} — {message} — {time ago}
  ...

KEY DECISIONS:
  • {decision 1}
  • {decision 2}

NEXT STEP: Run /vibe phase3 to continue →
```
