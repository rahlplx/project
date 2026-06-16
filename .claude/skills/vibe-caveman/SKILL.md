---
name: vibe-caveman
description: "Terse-output mode. Strips filler/hedging from responses to cut output tokens
  ~50-65% while preserving technical accuracy. Use when: user asks for short/direct/terse
  answers, wants compressed commit messages or PR comments, or wants token-usage stats.
  Wraps: caveman-mode skill."
argument-hint: "[lite|full|ultra|wenyan|commit|review|stats|compress] [--file path]"
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Bash(git diff*)
  - Bash(git log*)
---

# Vibe-Caveman — Terse Output Mode

"Brain still big. Mouth small."

## Dispatcher

- No args or a level (`lite`/`full`/`ultra`/`wenyan`) → activate that compression level for the rest of the session (default `full`)
- `commit` → generate a terse conventional commit message from the staged diff
- `review` → generate one-line PR review comments for the current diff
- `stats` → report token/cost savings so far
- `compress --file {path}` → rewrite a memory file (e.g. `CLAUDE.md`, notes) in caveman-speak

---

## Step 1 — Activate a Level

Levels (from `skills/workflow/caveman-mode/index.js`):

| Level | Rule |
|-------|------|
| `lite` | Drop filler ("I'd be happy to", "let me", "it seems") and hedging. Keep normal sentences. |
| `full` (default) | Cut all filler and scaffolding. Short, direct sentences. Conclusion first. |
| `ultra` | Telegraphic. Drop articles/conjunctions where meaning survives. Fragments over sentences. |
| `wenyan` | Maximal terseness, classical-Chinese-influenced economy of words. This is a genuine rewrite — you must compose the response this way yourself; it is not a mechanical strip. |

**In every level, never drop or alter**: code, commands, file paths, numbers, error
strings, or any technical fact. Compress *style*, not substance. If the user writes in
a non-English language, compress in that language — don't translate.

Once activated, apply the chosen level's rule to ALL your output for the rest of the
session (or until the user says otherwise / runs `/vibe-caveman` with a different level).

---

## Step 2 — Commit Messages (`commit`)

1. Run `git diff --staged` to see what changed.
2. Call `formatCommitMessage({ type, scope, subject, body })` from `caveman-mode` —
   header ≤50 chars, conventional-commit type (`feat|fix|refactor|test|docs|chore`).
3. Show the message to the user before committing (do not auto-commit).

---

## Step 3 — Review Comments (`review`)

1. Run `git diff` (or take the file path the user gives) to find issues.
2. For each issue, call `formatReviewComment({ line, severity, category, message })` →
   renders as `L42: 🔴 bug: description`. Severities: `critical` 🔴, `warning` 🟡, `info` 🟢.
3. List all comments together, one per line.

---

## Step 4 — Stats (`stats`)

Call `getStats()` from `caveman-mode` (reads `.vibe/telemetry/caveman-stats.json`) and
report: sessions compressed, total characters saved, reduction %, estimated cost saved.
If you compressed a response yourself this session, call `recordSavings({ beforeChars,
afterChars, costPerKChars })` first so the stats stay current.

---

## Step 5 — Compress a File (`compress --file {path}`)

1. Read the target file.
2. Call `compressText(content, level)` for `lite`/`full`/`ultra` — this is a deterministic
   regex strip, safe to run without rewriting by hand.
3. For `wenyan`, `compressText` returns `requiresModel: true` — you must rewrite the file
   content yourself in that style instead of relying on the function's output.
4. Show a before/after diff and ask before overwriting the file.

---

## Report Format

```
CAVEMAN MODE — {level}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active for: rest of session
Rule: {one-line summary of the level's instructions}
Stats: {N} chars saved lifetime ({pct}% reduction, ~${cost} saved)
```
