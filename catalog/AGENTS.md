# Catalog: AGENTS.md

## Purpose

`catalog/tools.yaml` is the curated registry of community-verified tools for vibe coders. AI agents read this file to find the right tool for the job. Humans never edit it directly — the agent handles everything.

## How to Find a Tool

1. Know the category (deploy, design, knowledge, orchestration, etc.)
2. Search `catalog/tools.yaml` for entries under that category
3. Check `catalog/verified-by.md` to confirm trust level

## YAML Entry Format

```yaml
- name: tool-name
  description: What it does in one line
  repo_url: https://github.com/owner/repo
  category: deploy|design|knowledge|...
  license: MIT|Apache-2.0|...
  verified_by: https://github.com/user | note: "tested by research team 2026"
  what_it_does: |
    Longer description (2-3 sentences) of what the tool does and
    why it exists.
  how_agent_uses: |
    Instructions for how an AI agent should invoke this tool.
    Include CLI flags, API endpoints, or library imports.
```

## Adding a New Tool

**Mandatory pre-flight checklist** (from `references/vibe-curation.md`):

1. Verify the repo exists: fetch the `repo_url` and confirm 200 OK
2. Verify the license file exists and is open-source (MIT, Apache 2.0, BSD, MPL-2.0)
3. Verify stars ≥ 100 (or note why exception is warranted)
4. Verify last commit within 1 year (no abandoned repos)
5. Verify `how_agent_uses` contains actionable instructions (not just "use it")
6. Append the new entry to the **end** of `tools.yaml` (never mid-file!)
7. Add the verifier name to `verified-by.md`

```yaml
# Template — copy and fill:
- name: my-new-tool
  description: Brief one-liner
  repo_url: https://github.com/owner/repo
  category: deploy
  license: MIT
  verified_by: https://github.com/verified-user
  what_it_does: |
    Longer description.
  how_agent_uses: |
    ```
    invocation example
    ```
```

## Cross-References

- `SKILL.md` for category definitions
- `catalog/verified-by.md` for trust levels
- `references/vibe-curation.md` for editorial rules
