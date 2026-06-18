# T04: Create catalog/AGENTS.md

## Plan
Write `catalog/AGENTS.md` explaining how AI agents should interact with the catalog.

Sections:
- Purpose: what `catalog/tools.yaml` is
- How to find a tool by category
- How to add a new tool (entry format, required fields)
- How to verify a tool before adding (pre-flight checklist from vibe-curation.md)
- Cross-reference: SKILL.md for categories, verified-by.md for trust levels

## Style
Write for AI agent reader. Imperative tone. Include YAML example.

```
## How to Add a Tool
1. Research: confirm repo_url, license, stars, last commit date
2. Write entry: append to end of tools.yaml (never mid-file!)
3. Format: name, description, repo_url, category, license, verified_by, what_it_does, how_agent_uses
```

## Files
- `catalog/AGENTS.md` — new file
