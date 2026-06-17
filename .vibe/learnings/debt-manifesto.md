# Technical Debt Manifesto
> Generated: 2026-06-17 | Analyzed: 50 commits, full lib/ scan

## Technical Debt

**lint-warnings (437)**
`lib/vibe-commands/` — `no-unused-vars`, `no-console` across 27 files.
Not errors, but real bugs hide in noise at this density.
Fix: `npm run lint -- --fix` removes ~1 warning, rest need manual triage. Target <100 warnings.

**orphaned-jest-tests**
`lib/discovery-index.test.js` was Jest syntax in `lib/` (excluded from both runners).
Fix: converted to node:test this session. Pattern may recur — check `lib/*.test.js` for `describe` without `require('node:test')`.

**`js-yaml` transitive CVE in jest devDeps**
GHSA-h67p-54hq-rp68: quadratic DoS in merge key handling (CVSS 5.3).
Only in `@istanbuljs/load-nyc-config` (test toolchain, never in prod).
Fix: `jest@25.0.0` (major downgrade, not worth it) — or upgrade to jest@30 when stable.

## Missing Features

**coverage gate on node:test files**
`npm run test:coverage` only covers Jest suite (skills/). `lib/` has 426 node:test passes with no coverage measurement.
Fix: add `node --experimental-test-coverage` to `test:node` script.

**`/vibe-tdd` not yet exercised**
Skill exists in `.claude/skills/` but no TDD session has been run. Unknown if it works end-to-end.
Fix: run `/vibe-tdd` on next new feature.

**`@modelcontextprotocol/sdk` version**
Currently `^1.29.0`. No known CVEs. No auto-upgrade path documented.
Fix: add `npm outdated` to maintenance cycle output.

**`canTransition` allows same-layer skips but not backwards**
`state-machine.js:115` — `toLayerIndex === fromLayerIndex + 1` only. Cannot re-enter a phase (e.g. `retro→think` impossible).
Fix: add `canTransition({ allowBacktrack: true })` option for manual override.

## Security Risks

**`parseHandoff` not symmetric with `formatHandoff`**
`formatHandoff` writes `ironLaws` section; `parseHandoff` never reads it back.
Data loss on round-trip: `ironLaws` is dropped silently.
Fix: add ironLaws parsing to `parseHandoff`.

**GPG signing misconfigured**
`commit.gpgsign=true` globally with no key in container → stop hook fires every session.
Fix: either provision key or add `commit.gpgsign=false` to project-local `.git/config`.

**`dynamic require()` in discovery-index removed this session**
Was: `require(file)` + `delete require.cache` — arbitrary code execution risk.
Now: SKILL.md frontmatter parsing — static text only.

## Priority Order
1. 🔴 `parseHandoff` ironLaws data loss — silent regression
2. 🟡 437 lint warnings — signal-to-noise problem
3. 🟡 GPG signing — stop hook noise every session
4. 🟢 node:test coverage measurement
5. 🟢 jest major version upgrade (low urgency, dev-only)
