# Pattern: Cross-Repo Mining for Architecture Evolution

## Problem
Building a high-quality agent framework in isolation misses patterns that already work in successful repos. We need systematic extraction.

## Solution
The repo miner (`.vibe/tools/repo-miner.js`) runs a 3-phase loop:
1. **Verify** — GitHub API checks stars, license, activity. Score ≥ 30 = passes.
2. **Clone** — Shallow clones of verified repos only (depth 1, single branch).
3. **Analyze** — Pattern detection + candidate extraction + quality scoring.

Output feeds into `.vibe/telemetry/repo-mining/insights.json` which the auto-maintenance cycle reads.

## When to Use
Before major architecture decisions. After catalog expansion. When looking for integration candidates.

## Key Findings (2026-06-13)
- **11 repos verified**: opencode, langchain, crewAI, mastra, langgraph, qdrant, mem0, weaviate, langflow, penpot, open-pencil
- **Top repo for our patterns**: mastra (95/100) — TS, tested, documented, MCP, agents, rules, vibenexus
- **Most common integration candidate**: MCP integration (8/11 repos)
- **Avg quality**: 53/100

## Files Changed
- `.vibe/tools/repo-miner.js` — the mining engine
- `.vibe/telemetry/repo-mining/` — individual analyses + insights.json

## Tested On
vibenexus-curated-collection, 2026-06-13
