# Think: Catalog Expansion

## Problem
The curated catalog has 11 tools across 7 categories. Gaps exist:

| Category | Tools | Gap Level |
|----------|-------|-----------|
| Design & UI | 3 | Low |
| Code Generation | 2 | Medium |
| Testing & QA | 2 | Medium |
| Deployment | 2 | Medium |
| Knowledge & Memory | 2 | Medium |
| Orchestration | 2 | Medium |
| Agent Frameworks | 2 | Medium |

**Goal**: Every category needs 3-5 tools so agents always have options.

## Users
- **Primary**: AI agents reading `catalog/tools.yaml` to find tools for vibe coders
- **Secondary**: Contributors who want to add tools via PR

## Solution Options

### A. Systematic category sweep (Recommended)
Target gaps by category. Research top 5 tools per category, verify, add best 3.
- Effort: Medium (2-3 hours research + 1 hour verification)
- Impact: High (complete coverage)
- Risk: Low

### B. Deep dive on 1-2 categories
Focus on highest-demand categories first (code generation, testing).
- Effort: Low (1 hour)
- Impact: Medium (partial coverage)
- Risk: Low

### C. Community-sourced only
Open PR template, wait for contributions.
- Effort: Very low
- Impact: Unpredictable
- Risk: High (may stall)

## Recommendation
**Option A**: Systematic sweep. Focus on categories where vibe coders need the most help.

## MVP Scope
- Add 3 tools to each of these 4 gap categories: Code Gen, Testing, Deployment, Knowledge
- Add verification status for each
- Update catalog/tools.yaml with complete entries
- Update SKILL.md examples if new categories emerge

## Nice-to-have (cut list)
- Tool wrapper code (skills/ directory entries)
- Integration tests for each tool
- Website/gallery of tools

## Success Metrics
- **Leading**: Tools added per category (target: 3+ per category)
- **Lagging**: Categories with 3+ tools (target: 7/7)
- **Quality**: Each entry has: name, description, repo, category, verified_by, how_agent_uses
