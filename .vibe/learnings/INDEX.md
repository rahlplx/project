# Learnings Index

## By Technology

| Technology | Patterns | Anti-Patterns |
|------------|----------|---------------|
| YAML | `patterns/yaml-only-direct-push` | `anti-patterns/mid-file-yaml-edits` |
| Catalog curation | `patterns/agent-native-catalog`, `patterns/auto-pipeline-for-curation` | `anti-patterns/incremental-catalog-runs` |
| Tool research | - | `anti-patterns/verify-before-describe` |
| Regex | `patterns/jaccard-originality-check` | `anti-patterns/combined-regex-slices` |

## By Framework Phase

| Phase | Patterns | Anti-Patterns |
|-------|----------|---------------|
| think | `patterns/auto-pipeline-for-curation` | `anti-patterns/incremental-catalog-runs` |
| build | `patterns/agent-native-catalog`, `patterns/jaccard-originality-check` | `anti-patterns/mid-file-yaml-edits`, `anti-patterns/combined-regex-slices` |
| ship | `patterns/yaml-only-direct-push` | - |
| retro | - | `anti-patterns/verify-before-describe` |
| all | `patterns/auto-pipeline-for-curation` | - |

## By Issue Type

| Type | Count | Links |
|------|-------|-------|
| performance | 0 | - |
| security | 0 | - |
| UX | 1 | `patterns/agent-native-catalog` |
| workflow | 4 | `patterns/yaml-only-direct-push`, `patterns/auto-pipeline-for-curation`, `anti-patterns/mid-file-yaml-edits`, `anti-patterns/incremental-catalog-runs` |
| data quality | 2 | `anti-patterns/verify-before-describe`, `patterns/jaccard-originality-check` |
| code quality | 1 | `anti-patterns/combined-regex-slices` |

## Retros

| Date | Link |
|------|------|
| 2026-06-13 | `retro-2026-06-13.md` |
| 2026-06-13 (catalog) | `retro-catalog-expansion.md` |
| 2026-06-14 (Phase 2) | `retro-agency-agents-p2-originality.md` |

## Projects

| Project | File |
|---------|------|
| Vibe-Stack Curated Collection | `projects/vibe-stack-curated-collection.md` |
