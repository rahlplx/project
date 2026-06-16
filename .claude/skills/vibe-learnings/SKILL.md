---
name: vibe-learnings
description: "Extract learnings, patterns, and anti-patterns from commit history, session work,
  and project evolution. Use when: end of a sprint, after a major debug, post-mortem,
  or to build institutional memory before starting something new. Reads git log + .vibe/
  state + produces structured learnings written to context-memory. Wraps: context-memory,
  knowledge-base skills."
argument-hint: "[commits|session|full|retro] [--since YYYY-MM-DD] [--save]"
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Bash(git log*)
  - Bash(git show*)
  - Bash(git diff*)
  - Bash(cat .vibe/*)
  - Bash(ls .vibe/projects/*)
---

# Vibe-Learnings — Institutional Memory Extraction

## Dispatcher

- No args or `commits` → extract learnings from git log (last 30 commits by default)
- `session` → extract from current session's work (recent changes only)
- `full` → full project retrospective (all commits + all .vibe/ state)
- `retro` → structured sprint retrospective format (what worked / what didn't / what to change)
- `--since {date}` → limit to commits after this date
- `--save` → write learnings to `.vibe/context-memory.json` automatically

---

## Step 1 — Read the Commit History

```bash
git log --oneline --all --since="30 days ago"
# Or full history:
git log --oneline --all
```

For each commit, categorize by what kind of work it represents:

| Category | Signal words in message |
|----------|------------------------|
| **Feature** | feat, add, implement, build, create |
| **Fix** | fix, bug, patch, resolve, correct |
| **Revert** | revert, remove, undo, rollback, delete |
| **Refactor** | refactor, clean, simplify, reorganize |
| **Docs** | docs, readme, comment, document |
| **Config** | chore, config, deps, package, setup |
| **Experiment** | wip, try, test, experiment, attempt |

---

## Step 2 — Identify Patterns

Analyze the categorized commits to find:

### What Worked (Positive Patterns)
Look for: commits that built on each other cleanly, features that shipped without reverts, approaches that became conventions.

Signal: `feat → feat → feat` sequences with no intervening `fix` or `revert`
Example output:
```
✅ PATTERN: {name}
   Evidence: commits {sha1}, {sha2}, {sha3}
   What worked: {description}
   Why it worked: {rationale}
   Repeat when: {conditions}
```

### What Failed (Anti-Patterns)
Look for: reverts, back-to-back fixes, commits that undid previous commits.

Signal: `add X` followed by `remove X` or `revert X` within a few commits
Example output:
```
❌ ANTI-PATTERN: {name}
   Evidence: {sha1} added it, {sha2} removed it
   What went wrong: {description}
   Root cause: {why it happened}
   Avoid when: {conditions to watch for}
```

### Scope Creep Signals
Look for: commits that added things not in the original plan, features that expanded beyond spec.
```
⚠️  SCOPE CREEP: {what expanded}
   Original intent: {what was planned}
   What was actually built: {what shipped}
   Impact: {time/complexity added}
```

### Technical Debt Accumulation
Look for: `// TODO`, `// FIXME`, `// HACK` patterns in changed files, commits with "temporary" or "workaround" in messages.

---

## Step 3 — Architecture Evolution

If 10+ commits exist, trace how the architecture changed:

```
ARCHITECTURE EVOLUTION:
━━━━━━━━━━━━━━━━━━━━━━
  v0 (initial): {what the structure looked like}
  ↓
  v1 (after {sha}): {what changed and why}
  ↓
  v2 (after {sha}): {what changed and why}
  ↓
  Current: {current structure}

KEY INFLECTION POINTS:
  • {sha}: {why this commit changed the direction}
  • {sha}: {why this commit changed the direction}
```

---

## Step 4 — Structured Retrospective Format (`retro` mode)

```
RETROSPECTIVE — {project or sprint name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERIOD: {date range}
COMMITS: {N} | FEATURES: {N} | FIXES: {N} | REVERTS: {N}

WHAT WORKED WELL:
  1. {pattern or decision that paid off}
  2. {tool or approach that saved time}
  3. {process that caught problems early}

WHAT DIDN'T WORK:
  1. {approach that caused rework}
  2. {assumption that was wrong}
  3. {scope that was underestimated}

WHAT TO CHANGE:
  1. {specific change to make next time}
  2. {process improvement}
  3. {technical decision to reconsider}

SURPRISES:
  • {unexpected finding or behavior}

KEY METRICS:
  • Churn rate: {N}% of lines written were later deleted
  • Fix ratio: {N} fixes per {N} features (lower = better design upfront)
  • Revert count: {N} (each revert = a decision made twice)
```

---

## Step 5 — Write to Context Memory (`--save`)

If `--save` is passed, append findings to `.vibe/context-memory.json`:

```json
{
  "learnings": [
    {
      "id": "{timestamp}",
      "type": "pattern|anti-pattern|architecture|retro",
      "title": "{short title}",
      "description": "{full description}",
      "evidence": ["{commit sha}", "{commit sha}"],
      "apply_when": "{conditions}",
      "avoid_when": "{conditions}",
      "source": "vibe-learnings",
      "date": "{ISO 8601}"
    }
  ]
}
```

These learnings will be available in future sessions via `/vibe-status decisions`.

---

## Output Summary Format

```
VIBE-LEARNINGS — {scope}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyzed: {N} commits | {date range}

✅ PATTERNS ({N} found):
  1. {pattern name} — {one-line summary}
  2. ...

❌ ANTI-PATTERNS ({N} found):
  1. {anti-pattern name} — {one-line summary}
  2. ...

⚠️  WATCH OUT FOR:
  • {risk or recurring issue}

💡 RECOMMENDATIONS FOR NEXT SESSION:
  1. {specific actionable advice}
  2. ...

{If --save}: Written to .vibe/context-memory.json ✅
```
