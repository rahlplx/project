# Pattern: Stress-Tested Plan Structure

## Problem
Plan documents often lack depth — they skip product perspective, ignore architecture, or miss risk assessment. This leads to implementation surprises.

## Solution
Every plan document should have these 7 sections:

1. **CEO Review (Product Perspective)** — What's the 10-star version? What's the narrowest wedge? What's OUT of scope?
2. **Eng Review (Architecture)** — ASCII architecture diagram, data flow, key components, edge cases, test matrix, failure modes, dependencies
3. **Design Review** — Score each dimension 0-10 (skip if no UI)
4. **Risk Assessment** — Table with risk, probability, impact, mitigation for each identified risk
5. **Implementation Tasks** — Ordered list with files, changes, and tests
6. **Acceptance Criteria** — Table with numbered criteria and verification method
7. **Decision Log** — Table with decisions, choices, and rationale

## When to Use
Any time creating or revising a plan document that will guide implementation.

## Files Changed
- `plans/plan-workflow-evolution.md` — full 7-section structure

## Tested On
VibeNexus, 2026-06-14 — 6 risks identified, 17 total, all mitigated.
