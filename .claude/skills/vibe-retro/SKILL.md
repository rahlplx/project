---
name: vibe-retro
description: "Structured sprint retrospective — what worked, what didn't, action items. Reads
  harness results + telemetry + git log to generate data-driven retro. Use when: end of sprint,
  after shipping, or before starting a new feature cycle. Wraps: node bin/vibe.js retro."
argument-hint: "[--since <date>] [--save]"
version: 1.0.0
allowed-tools:
  - Bash(node bin/vibe.js retro)
  - Bash(git log --oneline*)
  - Bash(cat .vibe/telemetry/*)
  - Bash(cat .vibe/handoff.md)
  - Read
  - Write
---

# Vibe-Retro — Sprint Retrospective

## Dispatcher

- No args → retro from last harness run + recent git log
- `--since {date}` → limit git log to commits after date (e.g. `--since 2026-06-01`)
- `--save` → write retro findings to `.vibe/context-memory.json`

---

## Step 1 — Run Retro

```bash
node bin/vibe.js retro
```

Reads `.vibe/telemetry/harness-results.json` + session telemetry.

---

## Step 2 — Augment with Git Learnings

Run `/vibe-learnings --since {date}` inline to add pattern/anti-pattern analysis
on top of the CLI retro output.

---

## Step 3 — Report Format

```
VIBE-RETRO — {sprint or date range}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERIOD: {date range} | COMMITS: {N} | HARNESS: {N}/15

WHAT WORKED:
  ✅ {pattern that paid off}
  ✅ {tool or approach that saved time}

WHAT DIDN'T:
  ❌ {approach that caused rework}
  ❌ {assumption that was wrong}

ACTION ITEMS:
  1. {specific change for next sprint}
  2. {rule to add or retire}

METRICS:
  Fix ratio: {N} fixes / {N} features
  Harness pass rate: {N}%
  Reverts: {N}
```

---

## Step 4 — Save (if --save)

Append findings to `.vibe/context-memory.json` as `type: retro` entries.
Available in future sessions via `/vibe-status decisions`.

---

## After Retro

Suggest running `/vibe-evolve` to apply the action items as rule changes.
