# Plan: Catalog Expansion

## Approved Approach

Systematic category sweep (Option A). Research top tools per gap category, verify, add best 3+.

## Engineering Review

- **Feasibility**: Trivial — YAML edits + markdown docs. Zero code changes.
- **Debt**: None. Catalog is standalone.
- **Scaling**: tools.yaml supports unlimited entries. Categories can be added freely.
- **Dependencies**: None. No code depends on catalog.
- **Security**: Zero — no code execution, no dependencies.

## Design Review

- **Structure**: Each tool entry has 7 fields (name, description, repo_url, category, verified_by, what_it_does, how_agent_uses). Consistent with impeccable's pattern.
- **UX for agents**: Catalog is flat YAML — any agent can parse it in one read.
- **UX for vibe coders**: They never see the catalog. Agent reads it, agent presents options.

## Risk Assessment

| Risk                   | Likelihood | Mitigation                        |
| ---------------------- | ---------- | --------------------------------- |
| Tool repo archived     | Low        | Check activity date before adding |
| Tool license changes   | Low        | Pin to MIT/Apache 2.0 only        |
| Duplicate entries      | Low        | Check catalog before adding       |
| Agent can't parse YAML | Very low   | All agents read YAML natively     |

## Milestone Breakdown

### M0: Research (current)

- [x] Think document written
- [x] Strategy selected

### M1: Code Generation (3 tools)

- Research top 3 open-source AI coding tools
- Add to catalog with full metadata
- Set verification level

### M2: Testing & QA (3 tools)

- Research top 3 testing tools for vibe coders
- Add to catalog
- Document how agents use each

### M3: Deployment (3 tools)

- Research deployment platforms + CLIs
- Add 3 beyond Vercel/Netlify
- Document agent usage

### M4: Knowledge & Memory (3 tools)

- Research vector DBs, RAG tools, knowledge management
- Add 3 top tools
- Document agent usage

### M5: Verify & Close

- Re-check all entries
- Verify every repo is active
- Update state to done

## Resource Allocation

- Tool: web search + GitHub search for research
- Skill: catalog curation (no coding required)
- Time: ~10 minutes per phase
