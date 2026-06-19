# Project: VibeNexus Curated Collection

## Summary
Community-verified AI engineering tool catalog for vibe coders. Pivoted from 45 custom skills (build-from-scratch) to curated collection of winning community repos. Agent-native architecture: SKILL.md at root tells any AI agent how to find and use tools from `catalog/tools.yaml`.

## Timeline
- **Initial pivot** (1 commit): SKILL.md, catalog/tools.yaml (11 tools), verified-by.md
- **Pipeline #1** (1 commit): 11→21 tools, 4 gap categories filled
- **Pipeline #2** (1 commit): 21→25 tools, orchestration + agent-frameworks, all 7 categories at 3+
- **Pipeline #3** (3 commits): 25→35 tools, all 7 categories at 5+

## What Worked
- Direct-to-main for catalog changes (zero-risk data)
- Agent-native description format (what_it_does + how_agent_uses)
- Auto pipeline maps cleanly to curation work
- All 209 tests pass after every catalog change

## What Didn't
- 3 incremental runs instead of 1 batch (wasted overhead)
- Mid-file YAML edits (whitespace conflicts)
- Writing descriptions before verifying repo metadata

## Key Stats
- 35 curated tools across 7 categories
- 100% community-verified (MIT/Apache 2.0/free tier)
- 3 auto pipeline runs, all successful
- Zero regressions across 15+ catalog commits
