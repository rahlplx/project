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

## Vibe-Stack Slash Command Suite (`.claude/skills/`)

The vibe-stack orchestrator is decomposed into 11 invokable skills for Claude Code.
Each wraps the same underlying `skills/` JS modules with consistent anti-slop/OWASP/taste-skill rules.

| Command | Wraps | Use when |
|---------|-------|----------|
| `/vibe` | Full pipeline | New project, "I want to build X" |
| `/vibe-design` | anti-slop, color-gen, design-system, typography-rules | Reviewing/generating UI, design tokens, palettes |
| `/vibe-review` | virtual-team, code-health, done-verifier | Pre-merge review, second opinion, "is this ready" |
| `/vibe-security` | security-audit, security-defaults, guardrails | Before release, auth/payment/API code |
| `/vibe-tdd` | tdd-vibe, verification-agent, checkpoints | New feature or bug fix — write the test first |
| `/vibe-deploy` | one-click-vercel/netlify, git-free-deploy, done-verifier | Shipping to staging/production |
| `/vibe-explain` | code-explainer, code-translator, intent-capture | Understanding, translating, or reverse-speccing code |
| `/vibe-status` | tracker, dashboard, context-memory | Start of session, "where did we leave off" |
| `/vibe-learnings` | context-memory, knowledge-base, git log | Retro, post-mortem, building institutional memory |
| `/vibe-template` | template-gallery, prompt-templates, quick-start | Starting a component/page/endpoint/scaffold from scratch |
| `/vibe-plan` | planning-agent, task-coordinator, tracker, parallel-exec | Breaking down a feature or sprint into tasks |
