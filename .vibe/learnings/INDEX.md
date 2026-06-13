# Learnings Index

## By Technology

| Technology | Patterns | Anti-Patterns |
|------------|----------|---------------|
| YAML | `patterns/yaml-only-direct-push` | `anti-patterns/mid-file-yaml-edits` |
| Catalog curation | `patterns/agent-native-catalog`, `patterns/auto-pipeline-for-curation` | `anti-patterns/incremental-catalog-runs` |
| Tool research | `patterns/cross-repo-mining` | `anti-patterns/verify-before-describe` |
| Handoff | `patterns/handoff-template-pattern` | - |
| Regex | `patterns/jaccard-originality-check`, `patterns/skill-structural-linter` | `anti-patterns/combined-regex-slices`, `anti-patterns/regex-in-jest-config` |
| Security | `patterns/execFileSync-over-execSync` | - |
| Testing | `patterns/test-for-every-skill` | - |

## By Framework Phase

| Phase | Patterns | Anti-Patterns |
|-------|----------|---------------|
| think | `patterns/auto-pipeline-for-curation` | `anti-patterns/incremental-catalog-runs` |
| build | `patterns/agent-native-catalog`, `patterns/jaccard-originality-check`, `patterns/skill-structural-linter` | `anti-patterns/mid-file-yaml-edits`, `anti-patterns/combined-regex-slices` |
| ship | `patterns/yaml-only-direct-push` | - |
| retro | `patterns/test-for-every-skill`, `patterns/execFileSync-over-execSync` | `anti-patterns/verify-before-describe` |
| harness | - | `anti-patterns/regex-in-jest-config` |
| all | `patterns/auto-pipeline-for-curation` | - |

## By Issue Type

| Type | Count | Links |
|------|-------|-------|
| performance | 0 | - |
| security | 1 | `patterns/execFileSync-over-execSync` |
| UX | 1 | `patterns/agent-native-catalog` |
| workflow | 4 | `patterns/yaml-only-direct-push`, `patterns/auto-pipeline-for-curation`, `anti-patterns/mid-file-yaml-edits`, `anti-patterns/incremental-catalog-runs` |
| data quality | 2 | `anti-patterns/verify-before-describe`, `patterns/jaccard-originality-check` |
| code quality | 2 | `anti-patterns/combined-regex-slices`, `patterns/skill-structural-linter` |
| testing | 2 | `patterns/test-for-every-skill`, `anti-patterns/regex-in-jest-config` |

## Retros

| Date | Link |
|------|------|
| 2026-06-13 | `retro-2026-06-13.md` |
| 2026-06-13 (catalog) | `retro-catalog-expansion.md` |
| 2026-06-14 (Phase 2) | `retro-agency-agents-p2-originality.md` |
| 2026-06-14 (Phase 3) | `retro-agency-agents-p3-linter.md` |
| 2026-06-14 (Deep Audit) | `retro-2026-06-14-deep-audit.md` |

## Projects

| Project | File |
|---------|------|
| Vibe-Stack Curated Collection | `projects/vibe-stack-curated-collection.md` |
