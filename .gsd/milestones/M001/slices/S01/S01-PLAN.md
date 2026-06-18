# S01 Plan — AGENTS.md Per Section

## Slice Goal
Create AI-readable documentation in each major directory so agents never ask "how do I add a tool?" or "how are skills structured?"

## Must-Haves
- `catalog/AGENTS.md` — how to add/find tools
- `skills/AGENTS.md` — how skills are structured
- `references/AGENTS.md` — how reference docs work
- `.vibe/AGENTS.md` — how lifecycle works (update existing)
- Each file has: Purpose, Structure, Conventions, Cross-References
- Harness validates all 4 exist with required sections

## Tasks

| Task | Description | Files |
|------|-------------|-------|
| T01 | Create catalog/AGENTS.md | `catalog/AGENTS.md` |
| T02 | Create skills/AGENTS.md | `skills/AGENTS.md` |
| T03 | Create references/AGENTS.md | `references/AGENTS.md` |
| T04 | Update .vibe/AGENTS.md | `.vibe/AGENTS.md` |

## Verification
- File existence check in harness: all 4 exist
- Content check: each has Purpose, Structure, Conventions, Cross-References
- Zero regressions: `npm test` passes (1,165 tests)

## Risk
LOW — Zero code changes. Pure documentation.