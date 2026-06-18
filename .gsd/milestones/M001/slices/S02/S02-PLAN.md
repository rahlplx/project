# S02 Plan — Tool Registry

## Slice Goal
Implement `ToolRegistry` class with explicit registration and `isUsable()` filtering so agents only get tools available on the user's machine.

## Must-Haves
- `lib/tool-registry.js` — ToolRegistry class with register/findUsable/findAll/getUnusable
- Refactor `bin/skill-loader.js` to use ToolRegistry instead of hardcoded list
- Tests: `lib/tool-registry.test.js` (unit + integration)
- Harness updated with AGENTS.md existence check
- 3s timeout on isUsable() via Promise.race

## Tasks

| Task | Description | Files |
|------|-------------|-------|
| T05 | Implement ToolRegistry class | `lib/tool-registry.js` |
| T06 | Refactor bin/skill-loader.js | `bin/skill-loader.js` |
| T07 | Write ToolRegistry tests | `lib/tool-registry.test.js` |
| T08 | Update harness for AGENTS.md check | `lib/harness.test.js` |

## Verification
- ToolRegistry unit tests pass (register, findUsable, findAll, getUnusable, edge cases)
- Integration tests pass (real isUsable checks: git --version, which netlify-cli)
- skill-loader.js uses ToolRegistry (no hardcoded lists)
- Harness validates AGENTS.md existence
- All 1,165 tests pass

## Risk
LOW — Isolated class with explicit API. Matches mastra/OpenHands SDK patterns.