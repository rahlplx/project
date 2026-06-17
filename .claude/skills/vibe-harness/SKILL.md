---
name: vibe-harness
description: "Production readiness gate — runs 15 automated checks (tests, lint, security scan,
  skill integrity, catalog validity, state machine). Use when: before shipping, after adding
  skills, or any time CI should pass. Wraps: node bin/vibe.js harness."
argument-hint: "[--fix]"
version: 1.0.0
allowed-tools:
  - Bash(node bin/vibe.js harness)
  - Bash(node -e *)
  - Bash(npm test*)
  - Bash(npm run lint*)
  - Read
  - Edit
  - Write
---

# Vibe-Harness — Production Readiness Gate

## Dispatcher

- No args → run all 15 checks, report results
- `--fix` → run checks, then auto-fix any fixable failures (index rebuild, lint --fix)

---

## Step 1 — Run Harness

```bash
node bin/vibe.js harness
```

Parse output: count ✓ / ✗. Report `Result: N/15 passed`.

---

## Step 2 — Triage Failures

For each ✗ check, apply the fix:

| Check | Fix |
|-------|-----|
| `index-json-integrity` | `node -e "const {writeIndex}=require('./lib/discovery-index'); writeIndex('/path/to/project')"` then re-run |
| `test-suite` | Run `npm test` for details, fix failing tests |
| `eslint-lint-pass` | Run `npm run lint` — fix errors (warnings OK) |
| `security-scan` | Check `lib/security-scan.js` output for critical skill |
| `skill-lint` | Run `node lib/lint-skills.js` for missing frontmatter |
| `quality-scores` | Check `catalog/quality-scores.json` for grade-D tools |

---

## Step 3 — Report

```
VIBE-HARNESS — {timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 15/15 checks passed   →  SHIP IT ✅
  or
✗ N/15 — GATE NOT CLEARED 🔴
  Failures: {check-name}: {detail}
  Fix: {command}
```

If all pass: suggest `node bin/vibe.js ship` or `/vibe-deploy`.
If any fail: list fixes, do not proceed to ship.
