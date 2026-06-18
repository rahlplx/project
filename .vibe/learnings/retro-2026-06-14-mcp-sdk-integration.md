# Retro: MCP SDK Integration — 2026-06-14

## What Went Well

| Area | What Worked | Evidence |
|------|-------------|----------|
| Schema generation | `fn.toString()` + regex parsed 49 skills without modification | 49/49 auto-schema'd, JSDoc ~10% coverage so name-based fallback critical |
| Token optimization | ANSI strip → estimate → 4K truncation (first 50% + last 20%) | 3 test scenarios validated truncation preserves context |
| MCP SDK integration | `ListToolsRequestSchema`/`CallToolRequestSchema` (not Result schemas) | Eliminated 50 lines of hand-rolled readline JSON-RPC |
| Test separation | Jest ignores new lib files (added to `testPathIgnorePatterns`) | 772 tests passing (762 Jest + 63 node:test) |
| Dead dep cleanup | chalk v5 + ora v7 = ESM-only, can't require() from CJS | Removed from package.json + lockfile |
| Fail-fast inquirer | project-wizard catch now throws with descriptive message | Prevented silent null errors |

## What Didn't Go Well

| Area | What Failed | Root Cause | Fix |
|------|-------------|------------|-----|
| MCP SDK schema | "Schema is missing a method literal" error | Used `ListToolsResultSchema` instead of `ListToolsRequestSchema` | Changed to request schemas with method literals |
| ESLint `no-control-regex` | ANSI regex `\x1b` triggered rule | ESLint disallows control characters in regex | Used `String.fromCharCode(27)` in IIFE |
| TokenOptimizer methods | `wrapResult`/`wrapError` called as instance methods | Designed as static but called with `this.` | Changed to static calls `TokenOptimizer.wrapResult()` |
| Temp files left behind | `regen-index.js`, `rebuild-index.js` in working dir | Ad-hoc scripts not cleaned up | Deleted before commit |
| State.json out of sync | Phase still shows "build" after ship | No automated state update on commit | Manual update needed |

## Action Items

| # | Action | Owner | Verify |
|---|--------|-------|--------|
| 1 | Add MCP SDK schema method literal check to harness | Framework | `schema-generator.test.js` catches missing method |
| 2 | Add ESLint `no-control-regex` exception for ANSI patterns | Framework | `.eslintrc.js` rule override |
| 3 | Make TokenOptimizer methods static by convention | Framework | `token-optimizer.test.js` validates static calls |
| 4 | Auto-update state.json on git commit | Framework | `git post-commit` hook or lifecycle check |
| 5 | Add temp file cleanup to ship phase | Framework | `/vibe:ship` reference includes cleanup step |

## Metrics

| Metric | Value |
|--------|-------|
| Files changed | 38 |
| Insertions | 2,984 |
| Deletions | 832 |
| New lib modules | 4 |
| New tests | 63 (node:test) |
| Jest suites | 77 (762 tests) |
| node:test suites | 11 (63 tests) |
| Harness checks | 12/12 pass |
| Skills on disk | 49 |
| Skills in index.json | 49 |

## Quality Scores

| Phase | Score | Notes |
|-------|-------|-------|
| Schema generation | 5/5 | Zero modification needed for 49 skills |
| Token optimization | 4/5 | Truncation strategy works but could be smarter |
| MCP integration | 4/5 | SDK quirks required research but result is clean |
| Test coverage | 5/5 | 63 new tests, all lib modules covered |
| Dead dep cleanup | 5/5 | Clean removal, no regressions |
| Overall | 4.6/5 | Solid session, minor SDK learning curve |
