# Pattern: Deep Research Before Design

## Problem
Designing agent workflow pipelines in isolation leads to missing known patterns from the community. Without validation against industry research, design decisions are guesses.

## Solution
Before writing any design document or plan, search for community-validated patterns that match the problem domain. For workflow design:
- Research AI-DLC (Agentic Development Lifecycle) for backpressure and readiness gates
- Research ShepAlderson/copilot-orchestra for independent VERIFY agent pattern
- Research ABIvan-Tech/copilot-agentic-workflows for Plan Delta pattern
- Research Agentic Dev Playbook for phase gate discipline

Document each decision with its community citation.

## When to Use
When designing any new workflow, phase structure, or pipeline. Especially important for agent workflow evolution.

## Files Changed
- `plans/plan-workflow-evolution.md` — each design decision cites its community source
- `docs/design-doc.md` — §"Workflow Evolution" references research patterns
- `docs/gates.md` — every gate criterion references its community pattern

## Tested On
Vibe-Stack, 2026-06-14 — 4 community patterns incorporated before writing a single file.
