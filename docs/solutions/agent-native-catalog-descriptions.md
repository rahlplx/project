# Solution: Writing Agent-Native Tool Descriptions for AI Agent Consumption

## Context
The catalog originally had human-oriented descriptions ("open-source vector database, performant").
But the reader is always an AI agent, not a human. The agent needs to know:
1. What does this tool DO (for the vibe coder)?
2. How does the AGENT use it (what commands to run, what API to call)?

## Solution
Every tool entry now has two fields:
- `what_it_does` — written for the vibe coder (no jargon, outcome-oriented):
  > "Finds information by meaning. Ask 'find the Stripe payment code' and it returns the right file."
- `how_agent_uses` — written for the agent (actionable, concrete):
  > "Agent connects to Weaviate to index project context. Queries for relevant past decisions."

Third-person agent perspective. Imperative when describing the agent's action. Specific command
examples (`npx cypress run`, `npx wrangler pages deploy`) over generic statements.

## Key Insight
An AI agent reading a tool description is not a developer skimming docs. It's a robot
that needs to know exactly what action to take and what output to expect. Write for the
reader — in this case, your future self (an AI).

## Files Changed
- `catalog/tools.yaml` — all 35 entries rewritten to agent-native format
- `SKILL.md` — describes how agents should read and use the catalog
