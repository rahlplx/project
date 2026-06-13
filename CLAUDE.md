# CLAUDE.md — Vibe-Stack Curation Project

## What This Is

A curated collection of community-verified AI engineering tools for vibe coders.
The primary interface is `SKILL.md` — AI agents read it to learn how to help.

## Commands

```bash
npm test          # Run 209 tests across 45 skills
git add -A && git commit -m "..." && git push  # Ship changes
```

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
```

## State

`.vibe/state.json` — tracks project phase. Phase `curation` means we're building
the curated collection.
