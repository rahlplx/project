# Pattern: Agent-Native Catalog Descriptions

## Problem
Catalog tool descriptions were written for humans ("open-source vector database, performant"). But AI agents read this catalog to decide HOW to use each tool. Generic descriptions give the agent no actionable instructions.

## Solution
Every catalog entry gets two agent-oriented fields:
- `what_it_does` — written for the vibe coder (outcome, no jargon)
- `how_agent_uses` — written for the agent (actionable commands, specific API calls, example invocations)

Third-person perspective. Include example commands in backticks. Tell the agent what to DO.

## When to Use
Any time you add a tool to `catalog/tools.yaml`. Always write both fields. Never copy-paste the GitHub README description.

## Files Changed
- `catalog/tools.yaml` — all 35 entries use this pattern

## Tested On
vibe-stack-curated-collection, 2026-06-13
