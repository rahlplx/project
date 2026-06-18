# M001 Roadmap — MVP: Agent-Native Tool Discovery + CI Gates

## Milestone Goal
Deliver the narrowest wedge that proves value: AGENTS.md per section + Tool Registry with isUsable() + CI Quality Gates (lint, typecheck, test, validate).

## Slices

| Slice | Name | Risk | Dependencies | Must-Haves |
|-------|------|------|--------------|------------|
| S01 | AGENTS.md Per Section | LOW | None | 4 AGENTS.md files with required sections |
| S02 | Tool Registry | LOW | S01 (concept proven) | ToolRegistry class, skill-loader refactor, tests |
| S03 | CI Quality Gates | MEDIUM | S02 (registry wired) | ESLint config, pre-commit hook, harness update |

## Risk Assessment

| Slice | Risk | Mitigation |
|-------|------|------------|
| S01 | LOW — Zero code, pure docs | Idempotent creation; verify sections in harness |
| S02 | LOW — Isolated class | Explicit registration; 3s timeout on isUsable(); comprehensive tests |
| S03 | MEDIUM — Config changes | Pin ESLint version; test config parses; pre-commit skips if eslint missing |

## Order Rationale
1. **S01 first** — Zero-risk docs prove AI-readable structure reduces "how do I?" queries (CEO priority)
2. **S02 second** — Highest impact code change; enables S03's tool validation
3. **S03 third** — Depends on registry for tool validation; config changes need testing

## Verification Gates
- Each slice: All tasks pass unit/integration tests
- M001 complete: 17/17 harness checks pass, 0 lint errors, 0 typecheck errors