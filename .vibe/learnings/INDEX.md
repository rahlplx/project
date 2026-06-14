# Learnings Index

Generated: 2026-06-14

## Patterns (13)

- **[agent-native-catalog](patterns/agent-native-catalog.md)**: Catalog tool descriptions were written for humans ("open-source vector database, performant"). But AI agents read this catalog to decide HOW to use each tool. Generic descriptions give the agent no actionable instructions.
- **[auto-pipeline-for-curation](patterns/auto-pipeline-for-curation.md)**: The vibe-stack auto pipeline (think→plan→break→build→harness→review→ship→retro) was designed for software features with tests and code. Curation work (adding tool entries to a YAML catalog) doesn't have tests or build steps.
- **[cross-repo-mining](patterns/cross-repo-mining.md)**: Building a high-quality agent framework in isolation misses patterns that already work in successful repos. We need systematic extraction.
- **[edit-tool-for-yaml-blocks](patterns/edit-tool-for-yaml-blocks.md)**: Inline string construction in Node.js for YAML edits leads to escape-sequence errors (single quotes, `\"`, `$` signs). `js-yaml.dump()` doesn't preserve YAML block style (`>`) reliably.
- **[execFileSync-over-execSync](patterns/execFileSync-over-execSync.md)**: Using `execSync(string)` invokes a shell for command execution, creating shell injection risk whenever user input or dynamically-constructed paths are included in the command string.
- **[handoff-template-pattern](patterns/handoff-template-pattern.md)**: 
- **[jaccard-originality-check](patterns/jaccard-originality-check.md)**: How to programmatically detect duplicate or near-duplicate skill implementations across a large collection of agent skills.
- **[owasp-security-scan-asi-patterns](patterns/owasp-security-scan-asi-patterns.md)**: Agent skill modules (markdown + JS prompts) can contain malicious patterns — instruction overrides, exfiltration endpoints, obfuscated code, supply chain attacks. Need automated detection.
- **[quality-score-two-step-write](patterns/quality-score-two-step-write.md)**: `computeAllToolScores(path, {qualityScoresPath})` computes scores in memory but does not persist them. Callers expect the `qualityScoresPath` option to also write, but it doesn't.
- **[six-track-parallel-execution](patterns/six-track-parallel-execution.md)**: Need to implement multiple independent features simultaneously without conflicts or regressions.
- **[skill-structural-linter](patterns/skill-structural-linter.md)**: How to ensure all skill files in a multi-contributor collection follow consistent structural conventions.
- **[test-for-every-skill](patterns/test-for-every-skill.md)**: Skills without tests accumulate silently. In a 45-skill repo, 27% (12 skills) had zero tests. Untested skills are a reliability risk — regressions go undetected.
- **[yaml-only-direct-push](patterns/yaml-only-direct-push.md)**: Creating a PR for every small catalog addition adds overhead (branch naming, PR description, merge commit). For YAML-only changes with zero code impact, the PR provides no safety benefit.

## Anti-Patterns (7)

- **[combined-regex-slices](anti-patterns/combined-regex-slices.md)**: Regex `SyntaxError: Unterminated group` when combining two separate regex patterns by slicing their `.source` property and concatenating:

```js
const combined = new RegExp(
  '(' + PATTERN_A.source.slice(1, -1) + '|' + PATTERN_B.source.slice(1, -1) + ')', 'gi'
);
```
- **[incremental-catalog-runs](anti-patterns/incremental-catalog-runs.md)**: Catalog was expanded in 3 separate auto pipeline runs:
1. 11 → 23 tools (initial gap fill)
2. 23 → 25 tools (orchestration + agent-frameworks)
3. 25 → 35 tools (5 per category, deeper catalog)

Each run had the same think→research→add→commit cycle. The research and editing cost was nearly identical per tool regardless of batch size.
- **[mid-file-yaml-edits](anti-patterns/mid-file-yaml-edits.md)**: Editing `catalog/tools.yaml` required reading 50+ surrounding lines to find exact whitespace for edit operations. Each insertion risked failing because of trailing space, tab-vs-space indentation, or nearby section headers.
- **[mixed-test-conventions](anti-patterns/mixed-test-conventions.md)**: Subagents created test files in two different styles:
- Jest globals (`describe`, `test`, `expect` without imports)
- node:test (`const { describe, it } = require('node:test'); const assert = require('assert');`)

This caused 5 test suites to fail under Jest with "Your test suite must contain at least one test".
- **[regex-in-jest-config](anti-patterns/regex-in-jest-config.md)**: Test files not discovered by Jest despite matching all expected criteria:
- Correct `*.test.js` naming
- Not in `node_modules`, `.vibe`, or `.gsd`
- Valid Jest test content
- Discovered by glob module but not by Jest's internal crawler
- **[verify-before-describe](anti-patterns/verify-before-describe.md)**: Two tools (OpenPencil at "5.4k+ stars", Refact.ai) had less metadata available than expected at search time. Descriptions were written based on partial information, requiring later correction.
- **[writeIndex-arg-order-confusion](anti-patterns/writeIndex-arg-order-confusion.md)**: `writeIndex('.', '.well-known/agent-skills/index.json')` corrupted the index file by writing the path string as the JSON content.

## Retros (8)

- **[auto-curation-patterns](auto-curation-patterns.md)**: 
- **[retro-2026-06-13](retro-2026-06-13.md)**: - **Full v1.0 pipeline completed**: init → detect → think → plan → break → build → harness → review → ship → retro
- **Harness phase**: All 6 production readiness checks passed after 4 targeted fixes
- **[retro-2026-06-14-d-grade-fixes-and-harness-recovery](retro-2026-06-14-d-grade-fixes-and-harness-recovery.md)**: - **YAML editing** — learned to use `edit` tool for block-level YAML replacements (avoids string escape hell)
- **quality-scores.json** — explicitly calling `writeQualityScores()` separately from `com
- **[retro-2026-06-14-deep-audit](retro-2026-06-14-deep-audit.md)**: - **Deep audit caught 15 cross-ref inconsistencies** — 5-perspective review (Security, Code Quality, Testing, Docs, Cross-Ref) found issues that single-perspective would miss
- **Jest `.vibe` regex bu
- **[retro-2026-06-14-six-track-enhancement](retro-2026-06-14-six-track-enhancement.md)**: - **Deep research** across 20+ sources (MCP RFCs, OWASP Agentic Top 10, 8 quality scoring systems) produced a robust 7-phase plan
- **Parallel subagent dispatch** — 6 independent tracks ran simultaneo
- **[retro-agency-agents-p2-originality](retro-agency-agents-p2-originality.md)**: - **236/236 tests** (up from 209 baseline) — 19 new tests for originality check, 4 for auto-maintain harness, +Phase 1 tests
- **45 skills all distinct** — worst similarity 13.8% (well below 20% WARN 
- **[retro-agency-agents-p3-linter](retro-agency-agents-p3-linter.md)**: - **247/247 tests** (up from 236) — 10 new linter tests + 1 updated harness test
- **7 harness checks** — catalog, categories, handoffs, gates, tests, originality, lint
- **45 skills structurally vali
- **[retro-catalog-expansion](retro-catalog-expansion.md)**: - Auto pipeline ran clean through 7 phases: think → plan → break → build → harness → review → ship
- Catalog grew from 11 → 21 tools (10 new entries)
- All 4 target categories hit 3+ tools each
- Zero
