# Learnings Index

## By Technology

| Technology | Patterns | Anti-Patterns |
|------------|----------|---------------|
| YAML | `patterns/yaml-only-direct-push` | `anti-patterns/mid-file-yaml-edits` |
| Catalog curation | `patterns/agent-native-catalog`, `patterns/auto-pipeline-for-curation` | `anti-patterns/incremental-catalog-runs` |
| Tool research | — | `anti-patterns/verify-before-describe` |

## By Framework Phase

| Phase | Patterns | Anti-Patterns |
|-------|----------|---------------|
| think | `patterns/auto-pipeline-for-curation` | `anti-patterns/incremental-catalog-runs` |
| build | `patterns/agent-native-catalog` | `anti-patterns/mid-file-yaml-edits` |
| ship | `patterns/yaml-only-direct-push` | — |
| retro | — | `anti-patterns/verify-before-describe` |
| all | `patterns/auto-pipeline-for-curation` | — |

## By Issue Type

| Type | Count | Links |
|------|-------|-------|
| performance | 0 | — |
| security | 0 | — |
| UX | 1 | `patterns/agent-native-catalog` |
| workflow | 4 | `patterns/yaml-only-direct-push`, `patterns/auto-pipeline-for-curation`, `anti-patterns/mid-file-yaml-edits`, `anti-patterns/incremental-catalog-runs` |
| data quality | 1 | `anti-patterns/verify-before-describe` |

## Projects

| Project | File |
|---------|------|
| Vibe-Stack Curated Collection | `projects/vibe-stack-curated-collection.md` |
