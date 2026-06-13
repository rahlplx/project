# M001: Mining-Inspired Enhancements

## Goal
Implement the 3 highest-impact patterns discovered from mining 12 repos:
1. Tool Registry — plugable tool discovery with is_usable() filtering
2. AGENTS.md per section — AI-developer docs for each major directory
3. CI Quality Gates — pre-commit, lint, typecheck, GitHub workflow

## Risk: Low
All changes are incremental — no rewrites, no breaking changes.
Each task independently verifiable without infrastructure.

## Dependencies: None

## Slices
S01: Tool Registry — refactor skill loading (3 tasks)
S02: AGENTS.md Docs — AI-developer documentation (4 tasks)
S03: CI Quality Gates — automation and validation (4 tasks)
