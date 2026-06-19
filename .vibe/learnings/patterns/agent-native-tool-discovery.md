# Pattern: Agent-Native Tool Discovery with isUsable()

## Problem
AI agents waste cycles trying tools that aren't available on the user's machine (e.g., trying `vercel` CLI when not installed). Silent failures or cryptic errors result.

## Solution
Implement a `ToolRegistry` class where each tool registers with an `isUsable()` check:
- Agent queries `ToolRegistry.findUsable('deploy')` → returns only working tools
- `isUsable()` runs with 3s timeout via `Promise.race`
- `ToolRegistry.getUnusable(category)` explains why tools are unavailable

## When to Use
- Any CLI tool that may not be installed (git, netlify, vercel, docker, etc.)
- Agent needs to discover available capabilities at session start
- Need to explain missing tools to user instead of silent failures

## Files Changed
- `lib/tool-registry.js` — ToolRegistry class
- `bin/skill-loader.js` — Registers all skills with isUsable checks
- `.vibe/lifecycle/auto-maintain.js` — Harness check for AGENTS.md

## Tested On
- vibe-stack M001 (2026-06-18): 15/15 ToolRegistry tests pass, 56 skills registered