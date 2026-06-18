# Retro: Agency-Agents Merge Phase 2 — Originality Check

## What Went Well
- **236/236 tests** (up from 209 baseline) — 19 new tests for originality check, 4 for auto-maintain harness, +Phase 1 tests
- **45 skills all distinct** — worst similarity 13.8% (well below 20% WARN threshold)
- **Zero false positives** — Jaccard shingling with boilerplate neutralization correctly handles structurally similar skills (e.g., one-click-netlify ↔ one-click-vercel at 13.8%)
- **CLI mode** — `node lib/check-originality.js` exits 1 on fail, 0 on pass/warn — pipe-friendly
- **Env configurable thresholds** — `ORIGINALITY_FAIL=30 node lib/check-originality.js`
- **Harness integration** — check #6 added with 2.5s total harness runtime

## What Could Improve
- **Combined regex failed** — `ENTITY_OR_BOILERPLATE` combining two patterns via `.source` slicing produced malformed regex. Fix: separate replacements
- **ROOT path confusion** — auto-maintain.js uses ROOT for `.vibe/` but needs `path.join(ROOT, '..')` for project-root files. This caused the initial harness failure
- **PowerShell vs POSIX** — `head`/`tail` not available on Windows; had to use `Select-Object -First/Last`
- **No regression testing** for the harness path fix — added test for originality check in auto-maintain.test.js

## Action Items
- [ ] `/vibe:evolve` — promote `skill-originality` harness check to active, update quality scores
- [ ] Consider extracting ROOT/paths to a shared config to avoid path confusion

## Metrics
- **Phase transitions**: 1 (build → test)
- **New tests**: 19 (originality) + 1 (harness) + 3 (Phase 1) = 23 total across Phase 1+2
- **Tests passing**: 236/236
- **Skills checked**: 45
- **Worst similarity**: 13.8%
- **New files**: `lib/check-originality.js`, `lib/check-originality.test.js`
- **Modified files**: `.vibe/lifecycle/auto-maintain.js`, `lib/auto-maintain.test.js`
- **Harness checks**: 6 (all passing)
