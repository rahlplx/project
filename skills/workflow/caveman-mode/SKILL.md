# caveman-mode

## What

Terse-output mode. Strips filler, hedging, and scaffolding from agent responses to
cut output tokens while preserving every technical fact, number, and code token.
Ported from the community `caveman` skill (JuliusBrussee/caveman) into this repo's
JS-module + tests convention.

## When to use

- The user wants short, direct answers ("be terse", "skip the preamble", "caveman mode").
- High-volume sessions where output-token cost/latency matters more than prose polish.
- Generating conventional commit messages or one-line PR review comments.

## How it works

`CavemanMode` (in `index.js`) provides four levels:

| Level | Effect |
|-------|--------|
| `lite` | Drop filler/hedging, keep normal sentences |
| `full` | Default — terse, short sentences, conclusions first |
| `ultra` | Telegraphic — drop articles/conjunctions where meaning survives |
| `wenyan` | Maximal terseness; `requiresModel: true` — this is NOT a mechanical transform. The agent must rewrite the response itself in this style; `compressText()` only returns the instructions for the agent to follow. |

`lite`/`full`/`ultra` are implemented as deterministic regex-based text transforms
(`compressText(text, level)`) so they can run without a model call — useful for
rewriting static memory files (e.g. `CLAUDE.md`) or batch-processing text.

Other methods:
- `formatCommitMessage({ type, scope, subject, body })` — conventional commit, ≤50 char header.
- `formatReviewComment({ line, severity, category, message })` — `L42: 🔴 bug: description` format.
- `recordSavings(...)` / `getStats()` — persist before/after character counts to
  `.vibe/telemetry/caveman-stats.json` and report lifetime savings + estimated cost saved.

## Agent usage

For an actual mid-conversation style change (not just rewriting a static file), the
agent itself must adopt the level's `instructions` text as a behavioral rule for the
rest of the session — this module supplies the rule text and the metrics, not the
generation itself. See `.claude/skills/vibe-caveman/SKILL.md` for the slash-command
wrapper that drives this.
