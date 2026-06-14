# Catalog: AGENTS.md

## Purpose

The `catalog/` directory contains the curated tool registry. AI agents read this to discover, evaluate, and recommend tools to vibe coders.

## How to Add a Tool

1. Add an entry to `tools.yaml` with these required fields:
   - `name` — short identifier (kebab-case)
   - `description` — what the tool does (for humans)
   - `what_it_does` — tool capability (for AI agents)
   - `how_agent_uses` — how an agent should invoke it
   - `category` — one of the 10 defined categories
   - `verified_by` — proof of verification (stars, community check)
- `category` — must match one of the existing categories

2. Run the test suite to confirm YAML parses cleanly:
   ```bash
   npm test
   ```

3. Rebuild the quality scores:
   ```bash
   node -e "require('./lib/quality-score').computeAllToolScores('.', {}).then(r => r.writeQualityScores())"
   ```

## Category Rules

- Each category must have ≥3 tools
- Categories: deploy, design, explain, knowledge, orchestration, preview, progress, quality, setup, workflow
- Tools must be community-verified (stars, active, documented)

## Verification Steps

| Step | What Happens | How to Verify |
|------|-------------|---------------|
| YAML parse | tools.yaml loads without error | `npm test` passes |
| Quality scores | Scores computed for all tools | quality-scores.json regenerated |
| Category count | Each category ≥3 tools | Harness check passes |
| Index rebuild | discovery-index.json matches disk | Index integrity check passes |

## Cross-Reference

- `tools.yaml` — the tool catalog
- `quality-scores.json` — quality distribution
- `.well-known/agent-skills/index.json` — skill index
- `lib/quality-score.js` — scoring engine
- `SKILL.md` — agent entry point
