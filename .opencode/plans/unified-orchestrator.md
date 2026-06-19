# Design Doc: Unified AI Engineering Orchestrator

## What This Is

A **unified AI-agent-agnostic orchestrator** that adds enterprise-grade planning (intent capture → market research → doc generation → implementation) with reusable utility catalogs and a knowledge feedback loop — built on top of the existing vibenexus system.

**Key constraint**: NO Claude Code-specific integration. Works with ANY AI agent via SKILL.md + MCP + CLI.

**Current state**: 47 skills, 765 tests, SKILL.md entry point, MCP server, CLI, 10-phase pipeline (think → plan → break → build → harness → review → ship → retro → learn → evolve).

**New phases added BEFORE think**: Intent Capture → Market Research → Doc Generation → (then existing think phase)

---

## Deep Research Insights (15+ Sources)

**Source**: `vibe-orchestrator-implementation-plan.md` (cherry-picked from `claude/new-session-rewka8`)

### Token Budget Awareness

| Constraint | Value | Impact |
|------------|-------|--------|
| Description + `when_to_use` | ≤1,536 chars | Auto-trigger truncation |
| Skill body re-attach | 5,000 tokens | After compaction |
| Multiple skills shared | 25,000 tokens | Budget across all skills |

**Implication**: Phase reference files must be lazy-loaded, not inline.

### State Persistence Pattern (Praetorian)

| Tier | Purpose | File |
|------|---------|------|
| Ephemeral | Runtime state | `.vibe/state.json` |
| Persistent | Cross-session | `.vibe/projects/{slug}/MANIFEST.yaml` |

**Implication**: Add MANIFEST.yaml for cross-session continuity.

### Production Patterns (gstack, impeccable, superpowers)

| Pattern | Source | Application |
|---------|--------|-------------|
| Phase-gated pipeline | gstack | 10 phases with gates |
| Sub-commands avoid menu pollution | impeccable | One `/vibe` skill, not 4 separate |
| Auto-trigger via description | superpowers | SKILL.md description drives routing |
| Dual-tier state | Praetorian | JSON + YAML for runtime + persistence |

### Compliance Gap (Critical Finding)

| Layer | Compliance | Use For |
|-------|-----------|---------|
| CLAUDE.md | 25-40% late-session | Advisory, framing |
| Hooks | 95-100% | Hard enforcement |
| Skills | 100% when invoked | Workflows |

**Implication**: For AI-agent-agnostic, use SKILL.md (100% when invoked) for workflows, not CLAUDE.md (advisory).

---

## Architecture

### 5-Layer Hybrid Architecture

```
Layer 1: SKILL.md (~300 tokens, always present)
         → Orchestrator identity, core principles, Phase 1 framing, memory layer refs

Layer 2: references/vibe-intent.md (~150 lines, loaded on /vibe:intent)
         → Phase 1 full Q&A, phase gates, state management protocol

Layer 3: references/vibe-research.md, vibe-docs.md, vibe-utilities.md (lazy-loaded per phase)
         → Phase 2: market research protocol
         → Phase 3: documentation templates
         → Phase 4: utility catalog protocol

Layer 4: .vibe/ state directory
         → Ephemeral: state.json (runtime phase tracking)
         → Persistent: projects/{slug}/MANIFEST.yaml (cross-session)
         → Project artifacts: PROJECT.md, PRD.md, research.md, knowledge-base.json

Layer 5: MCP server + CLI (deterministic enforcement)
         → New tools: intent_capture, market_research, doc_generation
         → New commands: vibe-intent, vibe-research, vibe-docs
```

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│  AI AGENT (any platform)                                     │
│  Reads SKILL.md at session start                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      v
┌─────────────────────────────────────────────────────────────┐
│  SKILL.md (entry point, ~300 tokens)                         │
│  - Detects intent ("I want to build X")                      │
│  - Routes to appropriate reference file                      │
│  - Loads skills from skills/ directory                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        v             v             v
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ references/  │ │ skills/  │ │ catalog/     │
│ vibe-think.md│ │ 47 tools │ │ tools.yaml   │
│ vibe-plan.md │ │ via MCP  │ │ 35 community │
│ vibe-break.md│ │ or CLI   │ │ verified     │
│ NEW:         │ │          │ │              │
│ vibe-intent  │ │          │ │              │
│ vibe-research│ │          │ │              │
│ vibe-docs    │ │          │ │              │
│ vibe-utils   │ │          │ │              │
└──────┬───────┘ └────┬─────┘ └──────────────┘
       │              │
       v              v
┌─────────────────────────────────────────────────────────────┐
│  .vibe/ (state directory)                                    │
│  - state.json (ephemeral runtime)                            │
│  - projects/{slug}/MANIFEST.yaml (persistent cross-session)  │
│  - projects/{slug}/PROJECT.md (living spec)                  │
│  - projects/{slug}/PRD.md (requirements)                     │
│  - projects/{slug}/research.md (market research)             │
│  - projects/{slug}/knowledge-base.json (patterns)            │
│  - telemetry/ (usage data)                                   │
│  - learnings/ (patterns, anti-patterns)                      │
│  - utilities-catalog.json (reusable utility registry)        │
└─────────────────────────────────────────────────────────────┘
```

### New Phases (Before Think)

| Phase | Name | Input | Output | Duration |
|-------|------|-------|--------|----------|
| 1 | **Intent Capture** | User's vague idea | PROJECT.md + PRD.md | 3-5 min |
| 2 | **Market Research** | PROJECT.md | research.md + patterns.json | 5-10 min |
| 3 | **Doc Generation** | PROJECT.md + research.md | SRS.md, architecture.md, tests.md | 5-10 min |
| 4 | **(Existing)** Think | All docs | Think document | 2-3 min |
| 5-13 | (Existing) Plan → Learn | Think document | Working software | Variable |

### Phase Flow

```
User: "I want to build X"
    │
    v
┌─────────────────┐
│ Phase 1: Intent │  3-5 min, 3 rounds
│ Capture         │  Output: PROJECT.md + PRD.md
└────────┬────────┘
         │ "Skip" allowed (user can skip)
         v
┌─────────────────┐
│ Phase 2: Market │  5-10 min, web search
│ Research        │  Output: research.md + patterns.json
└────────┬────────┘
         │ "Skip" allowed
         v
┌─────────────────┐
│ Phase 3: Doc    │  5-10 min, template-based
│ Generation      │  Output: SRS.md, architecture.md, tests.md
└────────┬────────┘
         │ "Skip" allowed
         v
┌─────────────────┐
│ Phase 4: Think  │  Existing phase
└─────────────────┘
         │
         v
    (Existing pipeline continues)
```

---

## Phase 1: Intent Capture

### Purpose
Transform vague ideas into structured project documents through conversational Q&A.

### Protocol

**3 Rounds (not 10 flat questions):**

**Round 1: Problem & Vision (5 min)**
```
Q1: "What's the problem you're trying to solve?"
Q2: "Who experiences this problem?"
Q3: "What happens if we don't solve it?"
```
**Progress indicator**: "Round 1 of 3: Problem & Vision"

**Round 2: Solution & Scope (5 min)**
```
Q4: "What's your rough solution idea?"
Q5: "What's the MVP — the smallest thing that works?"
Q6: "What's explicitly OUT of scope?"
```
**Progress indicator**: "Round 2 of 3: Solution & Scope"

**Round 3: Success & Constraints (5 min)**
```
Q7: "How will you know it's working?"
Q8: "Any technical preferences (stack, platform, budget)?"
Q9: "What's your timeline?"
```
**Progress indicator**: "Round 3 of 3: Success & Constraints"

### Skip Protocol
- User can say "skip" at ANY question
- If skipped: smart defaults applied (based on project category)
- If ALL skipped: minimal PROJECT.md generated from project name alone

### Smart Defaults by Category

| Project Type | Stack Default | Timeline Default | MVP Default |
|--------------|---------------|------------------|-------------|
| SaaS App | Next.js + Supabase | 2 weeks | Auth + Core Feature |
| API Service | Node.js + PostgreSQL | 1 week | CRUD + Auth |
| CLI Tool | Node.js + oclif | 3 days | Core Command |
| Browser Extension | TypeScript + Plasmo | 1 week | Content Script + Popup |
| Mobile App | React Native + Expo | 3 weeks | Core Screen + Auth |
| AI Agent | Python + LangChain | 2 weeks | Single Tool + Memory |

### Output Files

**PROJECT.md** (generated):
```markdown
# {Project Name}

## Problem
{from Q1}

## Users
{from Q2}

## Stakes
{from Q3}

## Solution
{from Q4}

## MVP
{from Q5}

## Out of Scope
{from Q6}

## Success Metrics
{from Q7}

## Tech Stack
{from Q8}

## Timeline
{from Q9}
```

**PRD.md** (generated):
```markdown
# Product Requirements Document: {Project Name}

## Overview
{1-paragraph summary from PROJECT.md}

## User Stories
- As a {user type}, I want {feature} so that {benefit}

## Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}

## Technical Requirements
- Stack: {from Q8}
- Performance: {defaults or user input}
- Security: {defaults or user input}

## Out of Scope
{from Q6}
```

### Test Cases

| Test | Input | Expected Output | Pass Criteria |
|------|-------|-----------------|---------------|
| Full Q&A | User answers all 9 questions | PROJECT.md + PRD.md | Both files exist, all sections filled |
| Skip all | User says "skip" to all | Minimal PROJECT.md | File exists, smart defaults applied |
| Skip one | User skips Q3 only | PROJECT.md with "Not specified" for Q3 | File exists, Q3 = "Not specified" |
| Smart defaults | User provides no stack preference | Default stack applied | Stack matches category default |
| Progress indicator | Any Q&A session | 3 progress messages | "Round X of 3" shown for each round |

---

## Phase 2: Market Research

### Purpose
Find existing open-source solutions, analyze failure/success patterns, and extract reusable insights.

### Mandatory with Skip
- **Default**: Runs automatically after Phase 1
- **Skip**: User can say "skip" to skip entire phase
- **Reason**: Every project benefits from research; knowledge base grows faster

### Protocol

**Step 1: Web Search (2-3 min)**
```
Search queries:
- "{problem domain} open source {stack}"
- "{problem domain} GitHub stars:>100"
- "{problem domain} production ready"
- "{problem domain} failure patterns"
```

**Step 2: Repo Analysis (3-5 min)**
For each found repo (5-10 target):
```yaml
name: "repo-name"
url: "https://github.com/org/repo"
stars: 1234
license: "MIT"
last_commit: "2024-01-15"
features:
  - "feature 1"
  - "feature 2"
stack:
  - "Node.js"
  - "PostgreSQL"
pros:
  - "production-ready"
  - "active maintenance"
cons:
  - "complex setup"
  - "no TypeScript"
production_proof:
  - "Company X uses it for Y"
```

**Step 3: Pattern Extraction (2-3 min)**
```json
{
  "success_patterns": [
    {
      "pattern": "Start with auth, then core feature",
      "evidence": "8/10 successful SaaS projects did this",
      "repos": ["repo1", "repo2"]
    }
  ],
  "failure_patterns": [
    {
      "pattern": "Building billing before product-market fit",
      "evidence": "6/10 failed SaaS projects had this",
      "repos": ["repo3", "repo4"]
    }
  ],
  "ux_patterns": [
    {
      "pattern": "Progressive onboarding (3 steps max)",
      "evidence": "All top-rated SaaS tools use this",
      "repos": ["repo5"]
    }
  ]
}
```

### Output Files

**research.md** (generated):
```markdown
# Market Research: {Project Name}

## Executive Summary
{1-paragraph: "Found N repos, M production-ready, K patterns extracted"}

## Existing Solutions

### Tier 1: Direct Competitors
| Repo | Stars | License | Stack | Verdict |
|------|-------|---------|-------|---------|
| {repo1} | 1.2k | MIT | Node | Good fit |
| {repo2} | 800 | Apache | Python | Partial fit |

### Tier 2: Adjacent Solutions
{repos that solve part of the problem}

### Tier 3: Inspiration
{repos with good patterns but different domain}

## Patterns Extracted

### Success Patterns
1. {pattern} — evidenced by {repos}
2. {pattern} — evidenced by {repos}

### Failure Patterns
1. {pattern} — evidenced by {repos}
2. {pattern} — evidenced by {repos}

### UX Patterns
1. {pattern} — evidenced by {repos}

## Recommendations
{3-5 actionable recommendations based on research}
```

**patterns.json** (generated):
```json
{
  "project": "{slug}",
  "timestamp": "2024-01-15T10:00:00Z",
  "repos_analyzed": 8,
  "success_patterns": [...],
  "failure_patterns": [...],
  "ux_patterns": [...],
  "recommendations": [...]
}
```

### Test Cases

| Test | Input | Expected Output | Pass Criteria |
|------|-------|-----------------|---------------|
| Full research | PROJECT.md exists | research.md + patterns.json | Both files exist |
| Skip research | User says "skip" | No files generated | Phase skipped, next phase starts |
| No repos found | Greenfield problem | research.md with "No existing solutions" | File exists, honest about gaps |
| Pattern extraction | 5+ repos analyzed | patterns.json with 3+ patterns | File exists, patterns have evidence |

---

## Phase 3: Doc Generation

### Purpose
Generate structured project documentation from PROJECT.md + research.md using templates.

### Protocol

**Step 1: Load Templates**
```
templates/
├── srs-template.md          # Software Requirements Specification
├── architecture-template.md # System Architecture
├── tests-template.md        # Test Plan
└── deployment-template.md   # Deployment Guide
```

**Step 2: Fill Templates**
- Merge PROJECT.md data into templates
- Inject research.md findings (patterns, recommendations)
- Apply smart defaults for missing fields

**Step 3: Validate Output**
- Check all required sections are filled
- Verify no placeholder text remains
- Ensure consistency across documents

### Output Files

**SRS.md** (generated):
```markdown
# Software Requirements Specification: {Project Name}

## 1. Introduction
### 1.1 Purpose
{from PROJECT.md Problem section}

### 1.2 Scope
{from PROJECT.md Solution section}

### 1.3 Definitions
{auto-generated from context}

## 2. Overall Description
### 2.1 Product Perspective
{from research.md - how it compares to existing solutions}

### 2.2 Product Functions
{from PROJECT.md MVP section}

### 2.3 User Characteristics
{from PROJECT.md Users section}

## 3. Specific Requirements
### 3.1 Functional Requirements
{from PRD.md user stories}

### 3.2 Non-Functional Requirements
{from PROJECT.md Success Metrics}

### 3.3 Technical Requirements
{from PROJECT.md Tech Stack}
```

**architecture.md** (generated):
```markdown
# Architecture: {Project Name}

## System Overview
{high-level diagram from context}

## Components
### Frontend
{stack from PROJECT.md}

### Backend
{stack from PROJECT.md}

### Database
{inferred from stack}

### Infrastructure
{inferred from stack}

## Data Flow
{from PRD.md user stories}

## Security Considerations
{from research.md failure patterns}

## Scalability Plan
{from PROJECT.md Success Metrics}
```

**tests.md** (generated):
```markdown
# Test Plan: {Project Name}

## Test Strategy
- Unit Tests: {stack default}
- Integration Tests: {stack default}
- E2E Tests: {if applicable}

## Test Cases
### From PRD.md Acceptance Criteria
{each criterion → test case}

### From research.md Failure Patterns
{each failure pattern → regression test}

## Test Data
{factory functions or fixtures}

## Coverage Goals
{default: 80%}
```

### Test Cases

| Test | Input | Expected Output | Pass Criteria |
|------|-------|-----------------|---------------|
| Full generation | PROJECT.md + research.md | SRS.md + architecture.md + tests.md | All 3 files exist |
| Partial data | Only PROJECT.md | All docs with defaults | Files exist, no empty sections |
| Pattern injection | research.md with patterns | Patterns in SRS.md | Patterns referenced in requirements |
| Template validation | Any input | No placeholder text | Grep for "TODO" returns 0 |

---

## Phase 4: Knowledge Base & Utilities

### Purpose
Cross-project learning and reusable utility patterns.

### Knowledge Base Schema

**.vibe/knowledge-base.json**:
```json
{
  "version": "1.0",
  "last_updated": "2024-01-15T10:00:00Z",
  "projects": [
    {
      "slug": "my-saas",
      "phase": "done",
      "patterns_used": ["auth-first", "progressive-onboarding"],
      "patterns_added": ["billing-integration"],
      "anti_patterns": ["premature-optimization"],
      "lessons_learned": ["Start with auth, not billing"]
    }
  ],
  "global_patterns": {
    "success": [
      {
        "id": "auth-first",
        "name": "Start with authentication",
        "evidence": "Used in 8/10 SaaS projects",
        "repos": ["repo1", "repo2"]
      }
    ],
    "failure": [
      {
        "id": "premature-optimization",
        "name": "Optimizing before product-market fit",
        "evidence": "Caused failure in 6/10 projects",
        "repos": ["repo3"]
      }
    ],
    "ux": [
      {
        "id": "progressive-onboarding",
        "name": "3-step onboarding max",
        "evidence": "All top SaaS tools use this",
        "repos": ["repo5"]
      }
    ]
  }
}
```

### Utility Catalog Schema

**.vibe/utilities-catalog.json**:
```json
{
  "version": "1.0",
  "categories": {
    "auth": {
      "description": "Authentication & authorization",
      "repos": [
        {
          "name": "next-auth",
          "url": "https://github.com/nextauthjs/next-auth",
          "stars": 22000,
          "license": "ISC",
          "stack": ["Next.js", "React"],
          "features": ["OAuth", "JWT", "Session"],
          "production_proof": ["Vercel", "Nike"],
          "verdict": "Best for Next.js projects"
        }
      ],
      "recommended": "next-auth",
      "alternatives": ["clerk", "auth0", "lucia"]
    },
    "api": {
      "description": "API framework & design",
      "repos": [...]
    },
    "ui": {
      "description": "UI component library",
      "repos": [...]
    },
    "billing": {
      "description": "Payment integration",
      "repos": [...]
    },
    "permissions": {
      "description": "Role-based access control",
      "repos": [...]
    }
  },
  "last_verified": "2024-01-15",
  "verification_standard": {
    "min_stars": 500,
    "max_days_inactive": 180,
    "required_license": ["MIT", "Apache-2.0", "ISC", "BSD"]
  }
}
```

### Knowledge Loop

```
Project A completes
    │
    v
Extract patterns → knowledge-base.json
    │
    v
Next project starts
    │
    v
Load patterns → inject into Phase 2 research
    │
    v
Project B uses patterns from Project A
    │
    v
Knowledge base grows
```

---

## Integration Points

### Existing System Integration

| Existing Component | How It Integrates |
|--------------------|-------------------|
| SKILL.md | Detects intent, routes to Phase 1 |
| references/ | New files: vibe-intent.md, vibe-research.md, vibe-docs.md, vibe-utilities.md |
| skills/ | Market research skill enhanced with repo analysis |
| catalog/ | Utility catalog references tools.yaml |
| .vibe/state.json | Extended with project-specific state |
| MCP server | New tools: intent_capture, market_research, doc_generation |
| CLI | New commands: vibe-intent, vibe-research, vibe-docs |

### MCP Tool Definitions

```javascript
// New tools for MCP server
tools: {
  intent_capture: {
    description: "Start Q&A session to capture user intent",
    input: { topic: "string" },
    output: { project_md: "string", prd_md: "string" }
  },
  market_research: {
    description: "Research existing solutions and extract patterns",
    input: { project_md: "string" },
    output: { research_md: "string", patterns: "object" }
  },
  doc_generation: {
    description: "Generate project documentation from templates",
    input: { project_md: "string", research_md: "string" },
    output: { srs_md: "string", architecture_md: "string", tests_md: "string" }
  }
}
```

---

## Implementation Steps (Stress-Tested)

### Step 1: Update SKILL.md (Always-On Layer)
**File**: `SKILL.md`
**Changes**: Add orchestrator identity, Phase 1 framing, memory layer refs
**Lines**: +60 lines
**Token cost**: ~150/session

**Tests to write:**
| # | Test | Input | Expected | Pass Criteria |
|---|------|-------|----------|---------------|
| 1 | Intent detection | "I want to build X" | Routes to Phase 1 | Phase 1 starts |
| 2 | Intent detection | "I want to build X" | Routes to Phase 1 | Phase 1 starts |

### Step 2: Create Phase Reference Files (Lazy-Loaded)
**Files to create:**
- `references/vibe-intent.md` — Phase 1 Q&A protocol (~150 lines)
- `references/vibe-research.md` — Phase 2 market research protocol (~150 lines)
- `references/vibe-docs.md` — Phase 3 documentation templates (~200 lines)
- `references/vibe-utilities.md` — Phase 4 utility catalog protocol (~150 lines)

**Tests to write:**
| # | Test | Input | Expected | Pass Criteria |
|---|------|-------|----------|---------------|
| 3 | Full Q&A | User answers all 9 questions | PROJECT.md + PRD.md | Both files exist, all sections filled |
| 4 | Skip all | User says "skip" to all | Minimal PROJECT.md | File exists, smart defaults applied |
| 5 | Skip one | User skips Q3 only | PROJECT.md with "Not specified" for Q3 | File exists, Q3 = "Not specified" |
| 6 | Smart defaults | User provides no stack preference | Default stack applied | Stack matches category default |
| 7 | Progress indicator | Any Q&A session | 3 progress messages | "Round X of 3" shown for each round |
| 8 | Input validation | Empty project name | Error message | Error shown, no file generated |
| 9 | Input validation | Special characters in name | Error message | Error shown, no file generated |

### Step 3: Create Library Files
**Files to create:**
- `lib/intent-capture.js` — Q&A logic
- `lib/market-research.js` — Web search + analysis
- `lib/pattern-extractor.js` — Pattern extraction
- `lib/doc-generator.js` — Template merging
- `lib/knowledge-base.js` — Knowledge base logic
- `lib/utilities-catalog.js` — Utility catalog logic

**Tests to write:**
| # | Test | Input | Expected | Pass Criteria |
|---|------|-------|----------|---------------|
| 10 | Full research | PROJECT.md exists | research.md + patterns.json | Both files exist |
| 11 | Skip research | User says "skip" | No files generated | Phase skipped, next phase starts |
| 12 | No repos found | Greenfield problem | research.md with "No existing solutions" | File exists, honest about gaps |
| 13 | Pattern extraction | 5+ repos analyzed | patterns.json with 3+ patterns | File exists, patterns have evidence |
| 14 | Web search fails | Network error | Fallback message | research.md with "Research unavailable" |
| 15 | Invalid PROJECT.md | Corrupted file | Error message | Error shown, phase skipped |
| 16 | Full generation | PROJECT.md + research.md | SRS.md + architecture.md + tests.md | All 3 files exist |
| 17 | Partial data | Only PROJECT.md | All docs with defaults | Files exist, no empty sections |
| 18 | Pattern injection | research.md with patterns | Patterns in SRS.md | Patterns referenced in requirements |
| 19 | Template validation | Any input | No placeholder text | Grep for "TODO" returns 0 |
| 20 | Rollback | Bad docs generated | Revert to previous state | Previous state restored |
| 21 | Knowledge base loads | .vibe/knowledge-base.json exists | Object loaded | File parsed correctly |
| 22 | Utility catalog loads | .vibe/utilities-catalog.json exists | Object loaded | File parsed correctly |
| 23 | Patterns extracted | Completed project | Patterns in knowledge-base.json | File updated with new patterns |
| 24 | Patterns injected | New project starts | Patterns from knowledge base | Patterns available for Phase 2 |
| 25 | Size limit | knowledge-base.json > 10MB | Archive old entries | File size < 10MB |

### Step 4: Create Templates
**Files to create:**
- `lib/templates/project-template.js` — PROJECT.md template
- `lib/templates/prd-template.js` — PRD.md template
- `lib/templates/research-template.js` — research.md template
- `lib/templates/srs-template.md` — SRS template
- `lib/templates/architecture-template.md` — Architecture template
- `lib/templates/tests-template.md` — Test plan template

### Step 5: Create State Files
**Files to create:**
- `.vibe/knowledge-base.json` — Initial schema
- `.vibe/utilities-catalog.json` — Initial catalog
- `.vibe/projects/{slug}/MANIFEST.yaml` — Cross-session persistence

### Step 6: Integration
**Files to modify:**
- `SKILL.md` — Add intent detection
- `bin/mcp-server.js` — Add new tools
- `bin/cli.js` — Add new commands
- `.vibe/state.json` — Extend schema

**Tests to write:**
| # | Test | Input | Expected | Pass Criteria |
|---|------|-------|----------|---------------|
| 26 | MCP tools | Call intent_capture | Returns PROJECT.md + PRD.md | Tools work |
| 27 | CLI commands | Run vibe-intent | Starts Q&A | Command works |
| 28 | State persistence | Session restart | State restored | state.json + handoff.md consistent |
| 29 | Rollback | Bad state | Revert to previous | Previous state restored |

---

## Success Metrics (Stress-Tested)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Intent Capture | No Q&A | 3-round conversational | Time to PROJECT.md |
| Market Research | No research | 5-10 repos analyzed | Repos found, patterns extracted |
| Doc Generation | Manual | 3 docs auto-generated | Docs generated, no placeholders |
| Knowledge Base | Empty | 10+ projects, 20+ patterns | Entries in knowledge-base.json |
| Utility Catalog | Partial | 5 categories, 7+ repos each | Entries in utilities-catalog.json |
| Multi-Agent | SKILL.md only | SKILL.md + MCP + CLI | All 3 integration points work |
| User Satisfaction | Unknown | NPS > 8 | Post-project survey |

---

## Risk Register (Stress-Tested)

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| Q&A too long | User abandons | Medium | 3 rounds max, skip allowed | ✅ Mitigated |
| Market research finds 0 repos | No patterns | Low | Flag as greenfield, skip to docs | ✅ Mitigated |
| Doc generation produces empty docs | Useless output | Medium | Template validation | ✅ Mitigated |
| State corruption | Lost progress | Low | Dual-tier state (JSON + YAML) | ✅ Mitigated |
| Knowledge base grows unbounded | Slow queries | Medium | Size limits, archival | ✅ Mitigated |
| MCP server changes break existing tools | Regression | Low | Backward compatibility layer | ✅ Mitigated |
| No input validation | Garbage in → garbage out | High | Input validation in Phase 1 | ✅ Mitigated |
| No fallback path | Pipeline blocks on failure | Medium | Fallback for each phase | ✅ Mitigated |
| No rollback | Bad output can't be reverted | Medium | Rollback mechanism | ✅ Mitigated |
| Token budget exceeded | Skill body truncated | Medium | Lazy-loaded reference files | ✅ Mitigated |
| CLAUDE.md compliance gap | Advisory ignored | High | Use SKILL.md (100% when invoked) | ✅ Mitigated |
| Claude Code-specific | Not AI-agent-agnostic | High | Use SKILL.md + MCP + CLI | ✅ Mitigated |

---

## Timeline (Stress-Tested)

| Week | Deliverable | Tests | Dependencies | Risk |
|------|-------------|-------|--------------|------|
| 1 | Step 1-2: SKILL.md + Reference Files | 9 tests | None | Low |
| 2 | Step 3-4: Library Files + Templates | 17 tests | M1 | Medium |
| 3 | Step 5-6: State Files + Integration | 4 tests | M1, M2 | Low |
| 4 | Testing & Polish | 0 tests | M1, M2, M3 | Low |
| **Total** | **Full orchestrator** | **29 tests** | — | — |

---

## Final Checklist

- [ ] AI-agent-agnostic (no Claude Code)
- [ ] Mandatory with skip for Phase 2
- [ ] 3-round Q&A (not 10 flat questions)
- [ ] Knowledge base for cross-project learning
- [ ] Utility catalog with verified repos
- [ ] Integration with existing vibenexus
- [ ] 29 tests across 6 steps
- [ ] Input validation for Phase 1
- [ ] Fallback paths for each phase
- [ ] Size limits on state files
- [ ] Rollback mechanism
- [ ] Error recovery for each phase
- [ ] Token budget awareness (lazy-loaded reference files)
- [ ] Dual-tier state persistence (JSON + YAML)
- [ ] Integration with existing 47 skills

---

## Open Questions

1. Should Phase 2 be fully automatic or require user confirmation? (Proposal: Automatic with "skip" option)
2. Should the knowledge base use JSON or SQLite? (Proposal: JSON for simplicity, upgrade later if needed)
3. Should utility catalog repos be verified automatically or manually? (Proposal: Manual for v1, automate later)

---

## Timeline

| Week | Deliverable | Tests |
|------|-------------|-------|
| 1 | Phase 1: Intent Capture | 5 tests |
| 2 | Phase 2: Market Research | 5 tests |
| 3 | Phase 3: Doc Generation | 5 tests |
| 4 | Phase 4: Knowledge Base & Utilities | 5 tests |
| 5 | Integration & Polish | 10 tests |
| **Total** | **Full orchestrator** | **30 tests** |

---

## Appendix: File Structure

```
.
├── SKILL.md                          # Entry point (enhanced with intent detection)
├── references/
│   ├── vibe-think.md                 # Existing
│   ├── vibe-plan.md                  # Existing
│   ├── vibe-break.md                 # Existing
│   ├── vibe-build.md                 # Existing
│   ├── vibe-intent.md                # NEW — Q&A protocol (lazy-loaded)
│   ├── vibe-research.md              # NEW — Research protocol (lazy-loaded)
│   ├── vibe-docs.md                  # NEW — Doc generation protocol (lazy-loaded)
│   └── vibe-utilities.md             # NEW — Utility catalog protocol (lazy-loaded)
├── lib/
│   ├── intent-capture.js             # NEW — Q&A logic
│   ├── market-research.js            # NEW — Web search + analysis
│   ├── pattern-extractor.js          # NEW — Pattern extraction
│   ├── doc-generator.js              # NEW — Template merging
│   ├── knowledge-base.js             # NEW — Knowledge base logic
│   ├── utilities-catalog.js          # NEW — Utility catalog logic
│   └── templates/
│       ├── project-template.js       # NEW — PROJECT.md template
│       ├── prd-template.js           # NEW — PRD.md template
│       ├── research-template.js      # NEW — research.md template
│       ├── srs-template.md           # NEW — SRS template
│       ├── architecture-template.md  # NEW — Architecture template
│       └── tests-template.md         # NEW — Test plan template
├── .vibe/
│   ├── state.json                    # Extended (ephemeral runtime)
│   ├── knowledge-base.json           # NEW — Cross-project patterns
│   ├── utilities-catalog.json        # NEW — Reusable utilities
│   └── projects/
│       └── {slug}/
│           ├── MANIFEST.yaml         # NEW — Persistent cross-session state
│           ├── PROJECT.md            # NEW — Living spec
│           ├── PRD.md                # NEW — Requirements
│           └── research.md           # NEW — Market research
├── bin/
│   ├── mcp-server.js                 # Enhanced (new tools)
│   └── cli.js                        # Enhanced (new commands)
└── docs/
    └── design-doc.md                 # Existing (enhanced)
```
