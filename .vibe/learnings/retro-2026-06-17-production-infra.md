# Retrospective — 2026-06-17: Production Infrastructure Sprint

## Period
2026-06-13 → 2026-06-17

## Commits
15 total | 4 feat | 4 fix | 5 chore | 1 perf | 1 docs

## Metrics at Close
- Tests: 1004 passing (572 Jest + 432 node:test)
- Harness: 16/16
- ESLint: 0 errors / 75 warnings
- TypeScript: 0 errors
- Prod vulnerabilities: 0
- Version: 2.9.1

---

## WHAT WORKED WELL

1. **Prettier + ESLint auto-fix in sequence** — Running `prettier --write` then `eslint --fix` resolved all formatting conflicts without manual edits. The `curly: multi-line` ESLint rule auto-added braces where prettier split lines. Pattern: format → lint-fix → done.

2. **Multi-agent parallel audit** — Spawning an Explore agent for structural audit while fixing backlogs in the main context eliminated serial bottleneck. Findings came back while backlog fixes were in-flight.

3. **`.prettierignore` before `prettier --write`** — Scoping the formatter away from `.vibe/`, `.jules/`, `.gsd/` prevented state file churn and kept the diff reviewable. Always write `.prettierignore` first.

4. **`files` field in package.json** — Explicitly listing published paths (`bin/`, `lib/`, `skills/`, etc.) prevents `.vibe/` state, test fixtures, and dev configs from leaking into npm package. Critical for any publishable package.

5. **Pre-commit index integrity gate (Gate 3)** — Adding the `checkIndexIntegrity` check to `.husky/pre-commit` would have caught the digest drift from prettier before it reached the harness. Prevents the "fix one thing, break another" cycle.

6. **`npm audit --omit=dev`** — Separating prod-only audit from full audit revealed 0 real vulnerabilities. The 18 "moderate" vulns are all Jest internals. CI now runs prod-only audit to avoid false alarm fatigue.

---

## WHAT DIDN'T WORK

1. **Prettier ran after skills were formatted, breaking index digests** — Prettier reformatted skill `index.js` files, invalidating SHA-256 digests in `.well-known/agent-skills/index.json`. Required a manual `writeIndex()` rebuild. Fix: add index rebuild to the post-format step, or add to pre-commit Gate 3.

2. **Retro `notes` string-vs-array bug** — `runRetro()` returns `notes` as a string; `retro.js` iterated it as an array, printing individual characters. Bug survived since retro was rarely run in real sessions. Fix: coerce to `Array.isArray ? notes : [String(notes)]`.

3. **`nextChar` prefix collision** — Renamed `nextChar` → `_nextChar` to silence ESLint, but prettier then reformatted the surrounding block differently. Minor, but shows that ESLint+prettier fixups should be done in a single `--fix` pass.

4. **Bolt branch churn (3 iterations on same file)** — Without tests for the function being optimized, each Bolt attempt could silently break behavior. Root cause: optimize before test = roulette.

---

## WHAT TO CHANGE NEXT SPRINT

1. **Add `writeIndex()` to the `npm run format` post-script** — `"format": "prettier --write . && node -e \"require('./lib/discovery-index').writeIndex(process.cwd())\""` — keeps digest in sync automatically.

2. **Run `auto-maintain` to generate session data** — The retro and telemetry dashboards show "0 sessions" because `.vibe/telemetry/sessions/` is empty. Running `node .vibe/lifecycle/auto-maintain.js` creates the first session file and enables real telemetry.

3. **Wire `--backtrack` to a real use case** — The flag is now surfaced in the CLI but no documentation or example shows when to use it. Add a one-liner to `help.js` output and `references/vibe-think.md`.

4. **Address remaining 75 ESLint warnings** — Concentrated in test files (`_mock`, `context`, `fn`, `jsdoc` unused params). Add `/* eslint-disable-next-line no-unused-vars */` or rename with `_` prefix in the 5 worst offenders.

---

## SURPRISES

- TypeScript `checkJs` over 130+ JS files produced **0 errors** after the full refactor. The strict=false + skipLibCheck config is correctly tuned for a CommonJS skill library.
- Prettier reformatted 200+ files in one pass without breaking any tests — confirms the codebase has no whitespace-sensitive logic.
- `prepublishOnly` was a no-op before this sprint (just ran Jest). Now it runs the full gate: lint + typecheck + test + harness. Publishing to npm is now a quality gate.

---

## FIX RATIO
4 fixes / 4 features = **1.0** (target <0.5 — more upfront design needed)

## REVERT COUNT
0 ✅

## KEY METRIC DELTA
| Metric | Before | After |
|--------|--------|-------|
| ESLint errors | 0 | 0 |
| ESLint warnings | 87 | 75 |
| Test count | 428 node | 432 node |
| Harness checks | 16/16 | 16/16 |
| Prod vulns | 0 | 0 |
| CI steps | 4 | 8 |
| Pre-commit gates | 2 | 3 |
