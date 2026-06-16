# Learnings Index

Last updated: 2026-06-14T12:00:00.000Z

## Patterns

- [Agent-Native Catalog Descriptions](patterns/agent-native-catalog.md)
- [Auto Pipeline Maps to Catalog Curation](patterns/auto-pipeline-for-curation.md)
- [Cross-Repo Mining for Architecture Evolution](patterns/cross-repo-mining.md)
- [Deep Research Before Design](patterns/deep-research-before-design.md)
- [edit-tool-for-yaml-blocks](patterns/edit-tool-for-yaml-blocks.md)
- [execFileSync Over execSync](patterns/execFileSync-over-execSync.md)
- [Handoff Template Pattern](patterns/handoff-template-pattern.md)
- [independent-review-subagent](patterns/independent-review-subagent.md)
- [Jaccard Similarity Originality Check](patterns/jaccard-originality-check.md)
- [MCP Adapter with Schema Generation](patterns/mcp-adapter-pattern.md)
- [OWASP Security Scan for Agent Skills](patterns/owasp-security-scan-asi-patterns.md)
- [quality-score-two-step-write](patterns/quality-score-two-step-write.md)
- [Six-Track Parallel Execution](patterns/six-track-parallel-execution.md)
- [Skill Structural Linter](patterns/skill-structural-linter.md)
- [Stress-Tested Plan Structure](patterns/stress-tested-plan-structure.md)
- [Telemetry Spec Session Schema](patterns/telemetry-spec-session-schema.md)
- [Test for Every Skill](patterns/test-for-every-skill.md)
- [Direct-to-Main for Catalog-Only Changes](patterns/yaml-only-direct-push.md)

## Anti-Patterns

- [Combining Regex by Slicing `.source`](anti-patterns/combined-regex-slices.md)
- [Dead Dependency Accumulation](anti-patterns/dead-dependency-accumulation.md)
- [ESLint no-control-regex for ANSI Patterns](anti-patterns/eslint-no-control-regex.md)
- [Incremental Catalog Expansion (3 Runs Instead of 1)](anti-patterns/incremental-catalog-runs.md)
- [Inserting Tools Mid-File in YAML](anti-patterns/mid-file-yaml-edits.md)
- [Mixed Test Conventions](anti-patterns/mixed-test-conventions.md)
- [redundant-harness-check](anti-patterns/redundant-harness-check.md)
- [Static vs Instance Method Confusion](anti-patterns/static-vs-instance-methods.md)
- [Temp File Cleanup Forgotten](anti-patterns/temp-file-cleanup.md)
- [Unescaped Dot in Jest Ignore Patterns](anti-patterns/regex-in-jest-config.md)
- [Skip Test Verification on Docs-Only Changes](anti-patterns/skip-test-verification-on-docs-only.md)
- [Writing Descriptions Before Verifying Tool Metadata](anti-patterns/verify-before-describe.md)
- [writeIndex-arg-order-confusion](anti-patterns/writeIndex-arg-order-confusion.md)

## Projects

- [AI-Native SDLC Adoption](projects/ai-native-sdlc-adoption.md)
- [Vibe-Stack Curated Collection](projects/vibe-stack-curated-collection.md)

## Solutions

- [Agent-Native Catalog Descriptions](solutions/agent-native-catalog-descriptions.md)
- [Auto-Pipeline Catalog Curation](solutions/auto-pipeline-catalog-curation.md)
- [Catalog Zero-Risk Direct Push](solutions/catalog-zero-risk-direct-push.md)
- [Telemetry Spec Session Schema](solutions/telemetry-spec-session-schema.md)

---

## Cross-References

### By Technology

| Technology | Patterns | Anti-Patterns |
|-----------|----------|--------------|
| `yaml` | [edit-tool-for-yaml-blocks](patterns/edit-tool-for-yaml-blocks.md) | [mid-file-yaml-edits](anti-patterns/mid-file-yaml-edits.md) |
| `catalog` | [agent-native-catalog](patterns/agent-native-catalog.md), [auto-pipeline-for-curation](patterns/auto-pipeline-for-curation.md), [quality-score-two-step-write](patterns/quality-score-two-step-write.md) | [incremental-catalog-runs](anti-patterns/incremental-catalog-runs.md), [verify-before-describe](anti-patterns/verify-before-describe.md) |
| `testing` | [test-for-every-skill](patterns/test-for-every-skill.md) | [mixed-test-conventions](anti-patterns/mixed-test-conventions.md), [regex-in-jest-config](anti-patterns/regex-in-jest-config.md), [skip-test-verification-on-docs-only](anti-patterns/skip-test-verification-on-docs-only.md) |
| `telemetry` | [telemetry-spec-session-schema](patterns/telemetry-spec-session-schema.md) | |
| `tracing` | [telemetry-spec-session-schema](patterns/telemetry-spec-session-schema.md) | |
| `nodejs` | [execFileSync-over-execSync](patterns/execFileSync-over-execSync.md) | [static-vs-instance-methods](anti-patterns/static-vs-instance-methods.md) |
| `planning` | [stress-tested-plan-structure](patterns/stress-tested-plan-structure.md), [deep-research-before-design](patterns/deep-research-before-design.md) | |
| `harness` | [jaccard-originality-check](patterns/jaccard-originality-check.md), [skill-structural-linter](patterns/skill-structural-linter.md), [owasp-security-scan-asi-patterns](patterns/owasp-security-scan-asi-patterns.md) | [redundant-harness-check](anti-patterns/redundant-harness-check.md) |
| `security` | [owasp-security-scan-asi-patterns](patterns/owasp-security-scan-asi-patterns.md) | |
| `mcp` | [mcp-adapter-pattern](patterns/mcp-adapter-pattern.md) | |
| `git` | [yaml-only-direct-push](patterns/yaml-only-direct-push.md) | |
| `execution` | [six-track-parallel-execution](patterns/six-track-parallel-execution.md) | |
| `regex` | | [combined-regex-slices](anti-patterns/combined-regex-slices.md) |
| `linting` | | [eslint-no-control-regex](anti-patterns/eslint-no-control-regex.md) |
| `npm` | | [dead-dependency-accumulation](anti-patterns/dead-dependency-accumulation.md) |
| `review` | [independent-review-subagent](patterns/independent-review-subagent.md) | |
| `design` | [deep-research-before-design](patterns/deep-research-before-design.md) | [static-vs-instance-methods](anti-patterns/static-vs-instance-methods.md) |
| `documentation` | [handoff-template-pattern](patterns/handoff-template-pattern.md), [agent-native-catalog](patterns/agent-native-catalog.md) | |
| `indexing` | | [writeIndex-arg-order-confusion](anti-patterns/writeIndex-arg-order-confusion.md) |
| `metrics` | [jaccard-originality-check](patterns/jaccard-originality-check.md) | |
| `scoring` | [quality-score-two-step-write](patterns/quality-score-two-step-write.md) | |
| `mining` | [cross-repo-mining](patterns/cross-repo-mining.md) | |
| `pipeline` | [auto-pipeline-for-curation](patterns/auto-pipeline-for-curation.md) | [incremental-catalog-runs](anti-patterns/incremental-catalog-runs.md) |
| `filesystem` | | [temp-file-cleanup](anti-patterns/temp-file-cleanup.md) |

### By Issue Type

| Issue | Patterns | Anti-Patterns |
|-------|----------|--------------|
| `robustness` | [execFileSync-over-execSync](patterns/execFileSync-over-execSync.md) | |
| `quality` | [quality-score-two-step-write](patterns/quality-score-two-step-write.md), [independent-review-subagent](patterns/independent-review-subagent.md), [skill-structural-linter](patterns/skill-structural-linter.md) | |
| `testing` | [test-for-every-skill](patterns/test-for-every-skill.md) | [mixed-test-conventions](anti-patterns/mixed-test-conventions.md), [regex-in-jest-config](anti-patterns/regex-in-jest-config.md), [skip-test-verification-on-docs-only](anti-patterns/skip-test-verification-on-docs-only.md) |
| `telemetry` | [telemetry-spec-session-schema](patterns/telemetry-spec-session-schema.md) | |
| `diagnostics` | [telemetry-spec-session-schema](patterns/telemetry-spec-session-schema.md) | |
| `security` | [owasp-security-scan-asi-patterns](patterns/owasp-security-scan-asi-patterns.md) | |
| `efficiency` | [six-track-parallel-execution](patterns/six-track-parallel-execution.md), [auto-pipeline-for-curation](patterns/auto-pipeline-for-curation.md) | [incremental-catalog-runs](anti-patterns/incremental-catalog-runs.md) |
| `design` | [deep-research-before-design](patterns/deep-research-before-design.md), [stress-tested-plan-structure](patterns/stress-tested-plan-structure.md) | [static-vs-instance-methods](anti-patterns/static-vs-instance-methods.md) |
| `workflow` | [yaml-only-direct-push](patterns/yaml-only-direct-push.md) | [verify-before-describe](anti-patterns/verify-before-describe.md) |
| `integration` | [mcp-adapter-pattern](patterns/mcp-adapter-pattern.md) | |
| `originality` | [jaccard-originality-check](patterns/jaccard-originality-check.md) | |
| `handoff` | [handoff-template-pattern](patterns/handoff-template-pattern.md) | |
| `automation` | [auto-pipeline-for-curation](patterns/auto-pipeline-for-curation.md) | |
| `maintenance` | | [combined-regex-slices](anti-patterns/combined-regex-slices.md), [dead-dependency-accumulation](anti-patterns/dead-dependency-accumulation.md) |
| `redundancy` | | [redundant-harness-check](anti-patterns/redundant-harness-check.md) |
| `cleanup` | | [temp-file-cleanup](anti-patterns/temp-file-cleanup.md) |
| `api-design` | | [writeIndex-arg-order-confusion](anti-patterns/writeIndex-arg-order-confusion.md) |
| `configuration` | | [eslint-no-control-regex](anti-patterns/eslint-no-control-regex.md) |
| `editing` | [edit-tool-for-yaml-blocks](patterns/edit-tool-for-yaml-blocks.md) | [mid-file-yaml-edits](anti-patterns/mid-file-yaml-edits.md) |
| `architecture` | [cross-repo-mining](patterns/cross-repo-mining.md) | |

### By Framework Phase

| Phase | Learnings |
|-------|-----------|
| **Plan** | [deep-research-before-design](patterns/deep-research-before-design.md), [stress-tested-plan-structure](patterns/stress-tested-plan-structure.md) |
| **Build** | [six-track-parallel-execution](patterns/six-track-parallel-execution.md), [mcp-adapter-pattern](patterns/mcp-adapter-pattern.md), [execFileSync-over-execSync](patterns/execFileSync-over-execSync.md), [test-for-every-skill](patterns/test-for-every-skill.md), [telemetry-spec-session-schema](patterns/telemetry-spec-session-schema.md) · [eslint-no-control-regex](anti-patterns/eslint-no-control-regex.md), [combined-regex-slices](anti-patterns/combined-regex-slices.md), [dead-dependency-accumulation](anti-patterns/dead-dependency-accumulation.md), [mixed-test-conventions](anti-patterns/mixed-test-conventions.md), [static-vs-instance-methods](anti-patterns/static-vs-instance-methods.md), [temp-file-cleanup](anti-patterns/temp-file-cleanup.md), [regex-in-jest-config](anti-patterns/regex-in-jest-config.md), [writeIndex-arg-order-confusion](anti-patterns/writeIndex-arg-order-confusion.md) |
| **Curation** | [agent-native-catalog](patterns/agent-native-catalog.md), [auto-pipeline-for-curation](patterns/auto-pipeline-for-curation.md), [edit-tool-for-yaml-blocks](patterns/edit-tool-for-yaml-blocks.md), [quality-score-two-step-write](patterns/quality-score-two-step-write.md) · [incremental-catalog-runs](anti-patterns/incremental-catalog-runs.md), [mid-file-yaml-edits](anti-patterns/mid-file-yaml-edits.md), [verify-before-describe](anti-patterns/verify-before-describe.md) |
| **Harness** | [jaccard-originality-check](patterns/jaccard-originality-check.md), [skill-structural-linter](patterns/skill-structural-linter.md), [owasp-security-scan-asi-patterns](patterns/owasp-security-scan-asi-patterns.md) · [redundant-harness-check](anti-patterns/redundant-harness-check.md) |
| **Review** | [independent-review-subagent](patterns/independent-review-subagent.md) · [skip-test-verification-on-docs-only](anti-patterns/skip-test-verification-on-docs-only.md) |
| **Ship** | [yaml-only-direct-push](patterns/yaml-only-direct-push.md) |
| **Evolution** | [cross-repo-mining](patterns/cross-repo-mining.md) |
| **Retro** | [handoff-template-pattern](patterns/handoff-template-pattern.md) |

> Note: Some learnings appear in multiple categories. Phase references are the phase where the learning was discovered or applies most strongly.
