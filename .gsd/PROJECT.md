# Project: Vibe-Stack Enhancement Roadmap

## What This Is
A curated collection of AI tools and skills for vibe coders — people who build software by describing what they want in plain language, not by writing code. An AI agent reads `SKILL.md`, finds tools in `catalog/tools.yaml`, and helps the vibe coder build, design, test, and ship.

## Current State
- 35 community-verified tools across 7 categories
- 45 agent skills (deploy, design, orchestration, quality, etc.)
- 1,165 passing tests (573 Jest + 592 node:test)
- Auto-maintenance lifecycle (harness → telemetry → retro → learn → evolve)
- Cross-repo mining of 12 top AI repos

## Goal
Fill all prioritized gaps from mining 12 repos:
1. **AGENTS.md per section** — AI-readable docs in every major directory
2. **Tool Registry** — `isUsable()` filtering so agents only get working tools
3. **CI Quality Gates**CI Quality Gates** — lint + typecheck + test + validate (4 gates)
4. **Async/Sync Parity** — all 45 skills get async methods (deferred to next cycle)
5. **Settings Schema** — exported programmatically (deferred to next cycle)

## Target State
- Agent auto-discovers usable tools, explains why others aren't
- <5% "how do I?" queries (currently 47%)
- 4 quality gates (currently 1)
- 5-phase pipeline (currently 11-phase)