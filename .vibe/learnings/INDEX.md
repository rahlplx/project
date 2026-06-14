# Learnings Index

Generated: 2026-06-14

## Patterns (15)

- **[agent-native-catalog](patterns/agent-native-catalog.md)**: Catalog tool descriptions were written for humans ("open-source vector database, performant"). But AI agents read this catalog to decide HOW to use each tool. Generic descriptions give the agent no actionable instructions.
- **[auto-pipeline-for-curation](patterns/auto-pipeline-for-curation.md)**: The vibe-stack auto pipeline (think→plan→break→build→harness→review→ship→retro) was designed for software features with tests and code. Curation work (adding tool entries to a YAML catalog) doesn't have tests or build steps.
- **[cross-repo-mining](patterns/cross-repo-mining.md)**: Building a high-quality agent framework in isolation misses patterns that already work in successful repos. We need systematic extraction.
- **[deep-research-before-design](patterns/deep-research-before-design.md)**: Before implementing any design decision, do deep web research to validate against community patterns. 4 community patterns validated the 5-phase design before writing a single file.
- **[edit-tool-for-yaml-blocks](patterns/edit-tool-for-yaml-blocks.md)**: Inline string construction in Node.js for YAML edits leads to escape-sequence errors (single quotes, `\"`, `$` signs). `js-yaml.dump()` doesn't preserve YAML block style (`>`) reliably.
- **[execFileSync-over-execSync](patterns/execFileSync-over-execSync.md)**: Using `execSync(string)` invokes a shell for command execution, creating shell injection risk whenever user input or dynamically-constructed paths are included in the command string.
- **[handoff-template-pattern](patterns/handoff-template-pattern.md)**: 
- **[jaccard-originality-check](patterns/jaccard-originality-check.md)**: How to programmatically detect duplicate or near-duplicate skill implementations across a large collection of agent skills.
- **[owasp-security-scan-asi-patterns](patterns/owasp-security-scan-asi-patterns.md)**: Agent skill modules (markdown + JS prompts) can contain malicious patterns — instruction overrides, exfiltration endpoints, obfuscated code, supply chain attacks. Need automated detection.
- **[quality-score-two-step-write](patterns/quality-score-two-step-write.md)**: `computeAllToolScores(path, {qualityScoresPath})` computes scores in memory but does not persist them. Callers expect the `qualityScoresPath` option to also write, but it doesn't.
- **[six-track-parallel-execution](patterns/six-track-parallel-execution.md)**: Need to implement multiple independent features simultaneously without conflicts or regressions.
- **[skill-structural-linter](patterns/skill-structural-linter.md)**: How to ensure all skill files in a multi-contributor collection follow consistent structural conventions.
- **[stress-tested-plan-structure](patterns/stress-tested-plan-structure.md)**: Every plan document should have 7 sections: CEO Review, Eng Review, Design Review (skip if no UI), Risk Assessment, Implementation Tasks, Acceptance Criteria, Decision Log.
- **[test-for-every-skill](patterns/test-for-every-skill.md)**: Skills without tests accumulate silently. In a 45-skill repo, 27% (12 skills) had zero tests. Untested skills are a reliability risk — regressions go undetected.
- **[yaml-only-direct-push](patterns/yaml-only-direct-push.md)**: Creating a PR for every small catalog addition adds overhead (branch naming, PR description, merge commit). For YAML-only changes with zero code impact, the PR provides no safety benefit.

## Anti-Patterns (8)

- **[combined-regex-slices](anti-patterns/combined-regex-slices.md)**: Regex `SyntaxError: Unterminated group` when combining two separate regex patterns by slicing their `.source` property and concatenating.
- **[incremental-catalog-runs](anti-patterns/incremental-catalog-runs.md)**: Catalog was expanded in 3 separate auto pipeline runs, each with the same think→research→add→commit cycle. The research and editing cost was nearly identical per tool regardless of batch size.
- **[mid-file-yaml-edits](anti-patterns/mid-file-yaml-edits.md)**: Editing `catalog/tools.yaml` required reading 50+ surrounding lines to find exact whitespace for edit operations. Each insertion risked failing because of trailing space, tab-vs-space indentation, or nearby section headers.
- **[mixed-test-conventions](anti-patterns/mixed-test-conventions.md)**: Subagents created test files in two different styles: Jest globals and node:test imports, causing 5 test suites to fail under Jest.
- **[regex-in-jest-config](anti-patterns/regex-in-jest-config.md)**: Test files not discovered by Jest despite matching all expected criteria due to regex-based testPathIgnorePatterns treating dots as wildcards.
- **[skip-test-verification-on-docs-only](anti-patterns/skip-test-verification-on-docs-only.md)**: Docs-only changes completed without running the full test suite. Assumption that "no code changes = no possible regression" is false.
- **[verify-before-describe](anti-patterns/verify-before-describe.md)**: Two tools (OpenPencil at "5.4k+ stars", Refact.ai) had less metadata available than expected at search time. Descriptions were written based on partial information.
- **[writeIndex-arg-order-confusion](anti-patterns/writeIndex-arg-order-confusion.md)**: `writeIndex('.', '.well-known/agent-skills/index.json')` corrupted the index file by writing the path string as the JSON content.

## Retros (9)

- **[auto-curation-patterns](auto-curation-patterns.md)**: 
- **[retro-2026-06-13](retro-2026-06-13.md)**: Full v1.0 pipeline completed: init → detect → think → plan → break → build → harness → review → ship → retro. Harness phase: All 6 production readiness checks passed after 4 targeted fixes.
- **[retro-2026-06-14-d-grade-fixes-and-harness-recovery](retro-2026-06-14-d-grade-fixes-and-harness-recovery.md)**: YAML editing learned to use `edit` tool for block-level YAML replacements (avoids string escape hell). quality-scores.json requires explicit writeQualityScores() call.
- **[retro-2026-06-14-deep-audit](retro-2026-06-14-deep-audit.md)**: Deep audit caught 15 cross-ref inconsistencies. 5-perspective review (Security, Code Quality, Testing, Docs, Cross-Ref) found issues that single-perspective would miss.
- **[retro-2026-06-14-six-track-enhancement](retro-2026-06-14-six-track-enhancement.md)**: Deep research across 20+ sources (MCP RFCs, OWASP Agentic Top 10, 8 quality scoring systems) produced a robust 7-phase plan. Parallel subagent dispatch ran 6 independent tracks simultaneously.
- **[retro-2026-06-14-workflow-evolution](retro-2026-06-14-workflow-evolution.md)**: 11-phase → 5-phase pipeline designed with deep web research validating every decision. 17 risks identified, all mitigated. 6 plan artifacts created. 4 community patterns incorporated.
- **[retro-agency-agents-p2-originality](retro-agency-agents-p2-originality.md)**: 236/236 tests (up from 209 baseline). 45 skills all distinct, worst similarity 13.8%.
- **[retro-agency-agents-p3-linter](retro-agency-agents-p3-linter.md)**: 247/247 tests (up from 236). 7 harness checks. 45 skills structurally valid.
- **[retro-catalog-expansion](retro-catalog-expansion.md)**: Auto pipeline ran clean through 7 phases. Catalog grew from 11 → 21 tools (10 new entries).

## Cross-Reference

### By Technology
- **Node.js**: execFileSync-over-execSync, writeIndex-arg-order-confusion, combined-regex-slices, mixed-test-conventions
- **Jest**: regex-in-jest-config, mixed-test-conventions
- **YAML**: edit-tool-for-yaml-blocks, mid-file-yaml-edits, yaml-only-direct-push
- **JSDoc/TypeScript**: (none yet)

### By Issue Type
- **Security**: execFileSync-over-execSync, owasp-security-scan-asi-patterns
- **Quality**: quality-score-two-step-write, test-for-every-skill, jaccard-originality-check
- **Workflow**: deep-research-before-design, stress-tested-plan-structure, auto-pipeline-for-curation, six-track-parallel-execution, skip-test-verification-on-docs-only
- **Data Integrity**: writeIndex-arg-order-confusion, regex-in-jest-config, combined-regex-slices, mid-file-yaml-edits

### By Framework Phase
- **Think/Plan**: deep-research-before-design, stress-tested-plan-structure, cross-repo-mining
- **Build**: edit-tool-for-yaml-blocks, execFileSync-over-execSync, six-track-parallel-execution
- **Harness/Verify**: test-for-every-skill, jaccard-originality-check, owasp-security-scan-asi-patterns, skill-structural-linter
- **Ship**: yaml-only-direct-push, skip-test-verification-on-docs-only
- **Evolve**: quality-score-two-step-write, agent-native-catalog, auto-pipeline-for-curation
