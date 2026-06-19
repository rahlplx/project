# Repo Mining Tool

Clone and analyze community repositories to extract best practices and integration candidates.

## Usage

```bash
# Run the mining loop
node .vibe/tools/repo-miner.js
```

## What It Does

1. **Clones** target repositories (shallow, single branch)
2. **Analyzes** structure, patterns, anti-patterns
3. **Extracts** integration candidates (what we could adopt)
4. **Generates** insights report with quality scores
5. **Saves** individual repo analyses and summary

## Target Repositories

The tool mines these curated repositories:

- **Core vibenexus ecosystem**: This repo, opencode
- **gstack / gsd equivalents**: gstack, gsd
- **Superpowers equivalent**: superpowers
- **Agent frameworks**: langchain, crewai, fastmcp, mastra
- **Patterns**: qdrant, langflow, dify, penpot, open-pencil, langgraph, autogen

## Output

- `.vibe/telemetry/repo-mining/` — individual repo analyses + summary
- `insights.json` — aggregated insights, patterns, recommendations
- Quality scores (0-100) for each repo
- Integration candidates ranked by adoption

## Integration with Auto-Maintenance

Run this tool as part of the auto-maintenance cycle:

```bash
# Add to auto-maintain.js harness phase
const repoMining = require('.vibe/tools/repo-miner');
await repoMining.mineRepos();
```

This feeds directly into the learn phase and evolution cycle.