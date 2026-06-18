---
name: vibe-evolve
description: "Auto-evolve rules and retire underperformers — reads telemetry + learnings to
  propose rule promotions, demotions, and new patterns. Use when: end of sprint, after retro,
  or when quality scores drift. Wraps: node bin/vibe.js evolve + .vibe/lifecycle/auto-maintain.js."
argument-hint: "[--dry-run]"
version: 1.0.0
allowed-tools:
  - Bash(node bin/vibe.js evolve)
  - Bash(node .vibe/lifecycle/auto-maintain.js)
  - Bash(cat .vibe/rules/*)
  - Bash(cat .vibe/evolution.json)
  - Bash(cat .vibe/telemetry/*)
  - Read
  - Write
---

# Vibe-Evolve — Rule Evolution

## Dispatcher

- No args → run evolve cycle, show proposals
- `--dry-run` → show proposals without writing to `.vibe/rules/`

---

## Step 1 — Run Evolve

```bash
node bin/vibe.js evolve
```

Reads `.vibe/telemetry/` + `.vibe/learnings/` to generate proposals:
- **promote**: rule used frequently, high quality score → bump priority
- **retire**: rule with 0 quality score and no evidence → archive
- **create**: pattern from learnings not yet in a rule → write new rule

---

## Step 2 — Show Proposals

```
VIBE-EVOLVE — {date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPOSALS ({N} total):

  PROMOTE  auto-injection-standards     score 4.8 → mark as core
  RETIRE   pre-verify-tool-metadata     score 0.0, 0 uses → archive
  CREATE   test-coverage-gate           new pattern from 3 incidents
```

---

## Step 3 — Apply (if not --dry-run)

For each proposal:
- **promote**: update `Quality Score` in rule file
- **retire**: move rule to `.vibe/rules/archived/`
- **create**: write new rule to `.vibe/rules/{name}.md` following template in `auto-injection-standards.md`

---

## Step 4 — Rebuild Index

After any rule changes, run:
```bash
node -e "const {writeIndex}=require('./lib/discovery-index'); writeIndex(process.cwd());"
```

Then confirm harness still passes: `node bin/vibe.js harness`
