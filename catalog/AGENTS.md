# catalog/AGENTS.md

## Purpose
The catalog is the central registry of verified AI tools. Agents use it to discover available tools and their metadata.

## Structure
```
catalog/
├── tools.yaml          # Main tool registry (35 tools, 7 categories)
├── verified-by.md      # Community verification log
├── AGENTS.md           # This file
```

## Conventions
- Tools in `tools.yaml` use YAML format with required fields: `id`, `name`, `category`, `description`, `what_it_does`, `how_agent_uses`, `install`, `verify`
- Categories: deploy, design, orchestration, quality, testing, utility, setup
- Version pinned to specific release/commit
- License must be OSS (MIT, Apache-2.0, BSD-3-Clause)
- Stars ≥ 100, last commit < 6 months, no critical CVEs

## Cross-References
- `SKILL.md` → Entry point, delegates to this file
- `skills/AGENTS.md` → How skills consume tools
- `.vibe/AGENTS.md` → Lifecycle for tool curation
- `plans/plan-catalog-expansion.md` → Expansion process