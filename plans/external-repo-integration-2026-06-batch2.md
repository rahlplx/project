# External Repo Integration — June 2026, Batch 2

**Date:** 2026-06-16
**Status:** Reasoning complete, Phase 1 implemented

Second batch of 8 proposed repos. Same process as batch 1
(`plans/external-repo-integration-2026-06.md`): fetch and read each repo first, decide
per-repo whether it contains something genuinely missing and portable under this repo's
CommonJS/no-new-deps conventions, before writing any code.

## Per-repo verdict

| Repo | Verdict | Reasoning |
|------|---------|-----------|
| `mattpocock/skills` | **Port (selective)** | MIT. Several of its skills (`/tdd`, `/handoff`, `/caveman`) are already equivalents of things this repo has (`vibe-tdd`, `ContextManager`'s handoff writer, `vibe-caveman`). The one genuinely new piece: the **"grill" protocol** (`/grill-me`, `/grill-with-docs`) — structured clarifying questions fired at an ambiguous request *before* work starts, to reduce misalignment. We had no equivalent gate. Ported as `lib/orchestrator/grill.js`. |
| `coleam00/context-engineering-intro` | **Skip — already covered** | MIT. Its PRP (Product Requirements Prompt) workflow — generate-prp/execute-prp, `INITIAL.md` template, validation gates — is the same shape as this repo's existing think→plan→break pipeline (`references/vibe-think.md`, `plans/*.md`, the harness gate). Re-implementing it would duplicate, not add. |
| `ai-for-developers/awesome-ai-coding-tools` | **Skip as code / research lead only** | MIT, but it's a curated tool directory, not executable code — same category as `roboco-io/awesome-vibecoding` from batch 1. Useful only as a future `catalog/tools.yaml` research source. |
| `Egonex-AI/Understand-Anything` | **Port (selective)** | MIT, very active. Heavy conceptual overlap with our own `skills/knowledge/graphify` (which already does dependency-graph analysis). Two ideas it has that graphify didn't: **diff/blast-radius analysis** (which nodes are transitively affected by a change) and **layer visualization** (auto-grouping nodes into API/Service/Data/UI/Utility). Ported as `blastRadius()` and `layerize()` on `Graphify`. |
| `upstash/context7` | **Not a port target — already integrated at the infrastructure layer** | This is the real, upstream Context7 — already wired into this environment as a live MCP server (`mcp__Context7__resolve-library-id` / `mcp__Context7__query-docs` are in the deferred-tools list, and `CLAUDE.md`'s MCP server instructions document its use). Nothing to extract into the skill library; it's already available as a tool, not something to re-implement. |
| `wrtnlabs/autobe` | **Skip** | **AGPL-3.0** — copyleft, incompatible with vendoring any of its code into this MIT-licensed project, so no literal porting was an option regardless of value. Its core concept (compiler-driven generation — validate before accepting output as done) is also already covered here by the existing lint/typecheck/test gate sequence; nothing new to re-implement either. |
| `botingw/rulebook-ai` | **Skip — equivalent already exists** | MIT. Its "portable Environment / Pack" system (generate rule files for Cursor, Copilot, Gemini, etc. from one source) is the same problem `lib/install-ide.js` + the Cross-Agent Plugin Packaging table in `CLAUDE.md` already solves for this repo (Claude Code, Cursor, OpenCode, Codex). Its light/medium/heavy-spec preset idea — scaling process rigor to project size — is a real, distinct idea this repo doesn't have, but there's no concrete need for it yet; flagged as a future enhancement, not implemented now. |
| `wednesday-solutions/ai-agent-skills` | **Port (selective)** | MIT. Overlaps with both graphify and `skills/quality/guardrails`. The one new idea not covered by either: **risk scoring** (0–100, combining dependency degree with test coverage) for a given node. Ported as `riskScore()` on `Graphify`. |

## What was implemented (Phase 1)

- `skills/knowledge/graphify/index.js` extended (additive, `analyze()`'s existing shape
  untouched, same as the batch-1 extension):
  - `blastRadius(graph, nodeId)` — BFS over reversed edges; returns every node
    transitively affected if `nodeId` changes (Understand-Anything's diff-impact idea).
  - `layerize(graph)` — groups nodes into API/Service/Data/UI/Utility by id/path
    keyword heuristics (Understand-Anything's layer visualization).
  - `riskScore(graph, nodeId, testCoverage)` — 0–100 score combining the node's degree
    (from `godNodes`'s logic) with inverse test coverage; untested+high-degree scores
    highest (wednesday-solutions/ai-agent-skills' risk scoring).
- `lib/orchestrator/grill.js` (new) + test — `needsGrilling(request)` flags short or
  vague requests; `generateQuestions(request)` returns targeted clarifying questions
  (scope / success-criteria / audience / constraints) instead of a generic "please
  clarify" (mattpocock/skills' `/grill-me`).
- Wired `Grill` into `lib/orchestrator/index.js` exports.

## Explicitly not done this round

- No literal code vendored from any repo, including the AGPL-3.0 `autobe` (license
  forbids it regardless) — every port is a from-scratch re-implementation of a concept.
- `botingw/rulebook-ai`'s light/medium/heavy spec-depth preset — flagged as a future
  idea for scaling `/vibe`'s 4-phase rigor to project size, not built (no concrete
  trigger for it yet, and `/vibe phase2/3/4` jump-to-phase already gives partial control).
- Wiring `Grill` into `bin/vibe.js`'s phase-1 intent-capture command as a hard gate —
  same caution as previous rounds: would need to intercept the actual user request text
  inside a CLI command, which the current `lib/vibe-commands/*.js` handlers don't receive
  (they operate on `state`, not raw conversational input). Left as a follow-up for whoever
  wires intent-capture into a real handler.
