# Learnings Index

Generated: 2026-06-14

## Patterns

| Pattern | Technology | Issue Type | Phase |
|---------|-----------|------------|-------|
| [six-track-parallel-execution](patterns/six-track-parallel-execution.md) | general | orchestration | build |
| [owasp-security-scan-asi-patterns](patterns/owasp-security-scan-asi-patterns.md) | node.js | security | build |
| [agent-native-catalog](patterns/agent-native-catalog.md) | yaml | curation | build |
| [auto-pipeline-for-curation](patterns/auto-pipeline-for-curation.md) | general | workflow | all |
| [execFileSync-over-execSync](patterns/execFileSync-over-execSync.md) | node.js | security | build |
| [handoff-template-pattern](patterns/handoff-template-pattern.md) | markdown | handoff | all |
| [jaccard-originality-check](patterns/jaccard-originality-check.md) | node.js | quality | harness |
| [skill-structural-linter](patterns/skill-structural-linter.md) | node.js | quality | harness |
| [test-for-every-skill](patterns/test-for-every-skill.md) | node.js | testing | build |
| [yaml-only-direct-push](patterns/yaml-only-direct-push.md) | git | workflow | ship |
| [cross-repo-mining](patterns/cross-repo-mining.md) | general | curation | think |

## Anti-Patterns

| Anti-Pattern | Technology | Issue Type | Phase |
|-------------|-----------|------------|-------|
| [mixed-test-conventions](anti-patterns/mixed-test-conventions.md) | node.js | testing | build |
| [combined-regex-slices](anti-patterns/combined-regex-slices.md) | node.js | regex | build |
| [incremental-catalog-runs](anti-patterns/incremental-catalog-runs.md) | yaml | workflow | build |
| [mid-file-yaml-edits](anti-patterns/mid-file-yaml-edits.md) | yaml | curation | build |
| [regex-in-jest-config](anti-patterns/regex-in-jest-config.md) | jest | testing | harness |
| [verify-before-describe](anti-patterns/verify-before-describe.md) | general | workflow | think |

## Projects

| Project | File |
|---------|------|
| Vibe-Stack Curated Collection | [vibe-stack-curated-collection.md](projects/vibe-stack-curated-collection.md) |

## Active Rules (evolution.json v2.5.0)

| Rule | Quality | Status |
|------|---------|--------|
| agent-native-catalog | 1.0 | active |
| yaml-only-direct-push | 1.0 | active |
| auto-pipeline-for-curation | 1.0 | active |
| execFileSync-over-execSync | 1.0 | active |
| test-for-every-skill | 1.0 | active |
| jaccard-originality-check | 1.0 | active |
| verify-gate-before-advance | 1.0 | active |
| skill-structural-linter | 1.0 | active |
| six-track-parallel-execution | 1.0 | active |
| owasp-security-scan-asi-patterns | 1.0 | active |
| mcp-discovery-well-known | 1.0 | active |
| test-convention-node-test | 1.0 | active |

## Harness Checks

| Check | Quality | Runs |
|-------|---------|------|
| catalog-yaml-valid | 1.0 | 6 |
| catalog-category-count | 1.0 | 6 |
| handoff-templates | 1.0 | 3 |
| phase-gates-doc | 1.0 | 3 |
| test-suite | 1.0 | 7 |
| skill-originality | 1.0 | 3 |
| skill-lint | 1.0 | 3 |
| index-json-integrity | 1.0 | 1 |
| quality-scores | 1.0 | 1 |
| security-scan | 1.0 | 1 |
| spec-gates | 1.0 | 1 |
| node-test-suite | 1.0 | 1 |
