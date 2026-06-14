# Retro: D-Grade Fixes & Harness Recovery

## What Went Well
- **YAML editing** — learned to use `edit` tool for block-level YAML replacements (avoids string escape hell)
- **quality-scores.json** — explicitly calling `writeQualityScores()` separately from `computeAllToolScores()` now understood as required 2-step
- **Harness recovery** — from 3 failing checks back to all 12 passing in one cycle
- **Test fixes** — discovery-index regex, security-scan expected count, all quick targeted changes
- **No cascading failures** — each fix was isolated, tests confirmed immediately

## What Didn't Go Well
- **index.json corruption** — called `writeIndex('.', '.well-known/agent-skills/index.json')` passing path string as index object. `writeIndex(projectRoot, index)` API is easy to misuse (second arg is index object, not path)
- **quality-score write confusion** — `computeAllToolScores` with `qualityScoresPath` option doesn't actually write; it only uses the path to read existing scores. Must call `writeQualityScores()` separately
- **YAML escape hell in inline scripts** — single-quoted JS strings with `\"` don't work as expected
- **Forgot that computeAllToolScores returns result, doesn't persist it**

## Action Items
1. Add `writeIndex` validation in discovery-index.js to reject non-object second arg
2. Ensure quality-score caller always calls writeQualityScores after computeAllToolScores
3. Use `edit` tool for YAML block edits, never inline string construction
4. Always run harness after any quality-scores.json or index.json modification

## Metrics
- Session work: catalog updates, 3 test/harness fixes, quality-score regeneration
- Time: ~30 min
- Harness checks: 3 broken → 12 passing
- D-grade tools fixed: 3 (nit, Railway, Nexus)
- Tests: 770 passing (638 Jest + 132 node:test)
