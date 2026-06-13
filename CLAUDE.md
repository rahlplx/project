# CLAUDE.md — Vibe-Stack Curation Project

## What This Is

A curated collection of community-verified AI engineering tools for vibe coders.
The primary interface is `SKILL.md` — AI agents read it to learn how to help.

## Commands

```bash
npm test          # Run 493 tests across 50 suites
node .vibe/lifecycle/auto-maintain.js  # Run auto-maintenance cycle
git add -A && git commit -m "..." && git push  # Ship changes
```

## Autonomous Lifecycle

This project self-improves via `.vibe/lifecycle/` — at session start, check
`.vibe/lifecycle.json` and run maintenance if interaction_count >= 10 or
days_since_last >= 7. Full details in SKILL.md §"Autonomous Lifecycle".

## How to Help

- The vibe coder talks in plain language ("make this look good", "ship my app")
- You use the skills in `skills/` and the catalog in `catalog/tools.yaml`
- Never make the vibe coder use a terminal — you handle everything
- Never show code unless they ask — show results, previews, URLs
- Translate errors into plain English

## Curation Guidelines

- Tools in `catalog/tools.yaml` must be community-verified (stars, active, documented)
- Add new tools via PR with proof it works
- Every tool needs: what it does, who verified it, how an agent uses it
- No abandoned repos (>1 year inactive)
- No CLIs for humans — agents handle the terminal

## File Structure

```
SKILL.md              → Agent entry point — start here
catalog/tools.yaml    → Curated community tools
catalog/verified-by.md → Verification tracking
skills/               → 45 agent skills (kept as-is)
references/           → Phase guides
.vibe/                → State tracking, evolution, lifecycle
docs/                 → Design docs, gates, handoffs
```

## State

`.vibe/state.json` — tracks project phase. Phase `curation` means we're building
the curated collection.
