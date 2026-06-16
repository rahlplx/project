# Phase 3 — Documentation Suite Generation

> Lazy-loaded by `/vibe phase3`. Requires Phase 2 complete.

## Prerequisites Check

1. Read `.vibe/projects/{slug}/MANIFEST.yaml` — confirm `phase2_complete: true`
2. Read `.vibe/projects/{slug}/PROJECT.md` — living spec
3. Read `.vibe/projects/{slug}/knowledge-base.json` — market research
4. If prerequisites missing: stop, tell user which phase to complete first

---

## Document Generation Order

Generate all 10 documents in this sequence. Write each to `.vibe/projects/{slug}/`.
Confirm with a 1-line status after each file write: "✅ {filename} written."

---

### 1. PRD.md — Product Requirements Document

```markdown
# PRD — {Product Name}
> Version 1.0 | Phase 3 output | {date}

## Problem Statement
{From PROJECT.md — one paragraph}

## Goals & Non-Goals
**Goals:** {numbered list}
**Non-Goals:** {numbered list — critical: keeps scope tight}

## User Stories
{Format: As a [persona], I want to [action] so that [outcome].}
{Minimum 5, maximum 10 for v1}

## Feature List (MoSCoW)
| Feature | Priority | Rationale |
|---------|----------|-----------|
| {feature} | Must | {why} |
| {feature} | Should | {why} |
| {feature} | Could | {why} |
| {feature} | Won't (v1) | {why} |

## Acceptance Criteria
For each Must feature:
- Given [context], when [action], then [outcome]

## KPIs
{From PROJECT.md — with measurement method}

## Open Questions
{Unresolved decisions that need user input or validation}
```

---

### 2. SRS.md — Software Requirements Specification

```markdown
# SRS — {Product Name}
> Version 1.0 | {date}

## Functional Requirements
{FR-001 through FR-0XX — one sentence each, testable}

## Non-Functional Requirements
| Category | Requirement | Target |
|----------|-------------|--------|
| Performance | Page load | <2s p95 |
| Uptime | Availability | 99.5% |
| Security | Auth | MFA required for admin |
| Accessibility | WCAG | Level AA |
| Scalability | Concurrent users | {N} at launch |

## Constraints
{Technical, legal, budget constraints from PROJECT.md}

## Dependencies
{External services, APIs, third-party integrations}

## Data Requirements
{What data is stored, for how long, where, who can access it}
```

---

### 3. architecture.md — System Architecture

```markdown
# Architecture — {Product Name}
> Version 1.0 | {date}

## System Overview

{Mermaid diagram — use flowchart-gen skill conventions}

\`\`\`mermaid
graph TD
    A[User] --> B[Frontend]
    B --> C[API Gateway]
    C --> D[Backend Services]
    D --> E[(Database)]
    D --> F[External APIs]
\`\`\`

## Technology Choices
| Layer | Technology | Rationale | Alternatives Rejected |
|-------|-----------|-----------|----------------------|
| Frontend | {tech} | {why} | {rejected options} |
| Backend | {tech} | {why} | {rejected options} |
| Database | {tech} | {why} | {rejected options} |
| Hosting | {tech} | {why} | {rejected options} |
| Auth | {tech} | {why} | {rejected options} |

## Data Flow
{Step-by-step: user action → what happens at each layer}

## Scalability Plan
- Vertical scaling ceiling: {N}
- Horizontal scaling trigger: {condition}
- CDN strategy: {approach}
- Caching layer: {what gets cached, TTL}

## Single Points of Failure
{List + mitigation for each}
```

---

### 4. database.md — Database Design

```markdown
# Database — {Product Name}
> Version 1.0 | {date}

## Schema
{Key tables/collections — columns, types, constraints}

## Indexing Strategy
{Which columns get indexed and why}

## Migration Plan
{How schema changes are handled — tool, rollback approach}

## Backup & Recovery
{RPO, RTO, backup frequency, restore procedure}
```

---

### 5. api.md — API Design

```markdown
# API Design — {Product Name}
> Version 1.0 | {date}

## Authentication
{Auth method, token lifetime, refresh strategy}

## Rate Limiting
{Limits per endpoint tier — free vs. paid}

## Versioning
{Strategy: URL versioning v1/, header versioning, etc.}

## Core Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | None | {description} |
| GET | /api/v1/{resource} | Bearer | {description} |

## Error Format
\`\`\`json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Human-readable message",
    "details": {}
  }
}
\`\`\`
```

---

### 6. security.md — Security Design

Reference `skills/quality/security-audit/index.js` for OWASP checks.

```markdown
# Security — {Product Name}
> Version 1.0 | OWASP Top 10 mapped | {date}

## Threat Model
{Who are adversaries? What do they want? What's the blast radius?}

## OWASP Top 10 Mapping
| # | Category | Risk Level | Mitigation |
|---|----------|-----------|-----------|
| A01 | Broken Access Control | H/M/L | {control} |
| A02 | Cryptographic Failures | H/M/L | {control} |
| A03 | Injection | H/M/L | {control} |
| A04 | Insecure Design | H/M/L | {control} |
| A05 | Security Misconfiguration | H/M/L | {control} |
| A06 | Vulnerable Components | H/M/L | {control} |
| A07 | Auth Failures | H/M/L | {control} |
| A08 | Software & Data Integrity | H/M/L | {control} |
| A09 | Security Logging | H/M/L | {control} |
| A10 | SSRF | H/M/L | {control} |

## Data Classification
| Data Type | Sensitivity | Encryption at Rest | Encryption in Transit |
|-----------|-------------|-------------------|----------------------|
| {type} | PII/Financial/Public | Yes/No | Yes/No |

## Secrets Management
{No secrets in code. Tool: {Vault/SSM/env-file}. Rotation policy: {N} days.}

## Incident Response
{Detection → Containment → Eradication → Recovery → Post-mortem}
```

---

### 7. guardrails.md — Design Guardrails

Reference `skills/design/anti-slop/index.js` (41 rules) and taste-skill dials.

```markdown
# Guardrails — {Product Name}
> Version 1.0 | Anti-slop + taste-skill dials | {date}

## Taste-Skill Dials (from external/taste-skill/)
| Dial | Setting (1-10) | Rationale |
|------|---------------|-----------|
| Minimalism | {N} | {why} |
| Polish | {N} | {why} |
| Personality | {N} | {why} |

## Anti-Slop Rules (Top 10 for this product)
{Pull the 10 most relevant rules from anti-slop/index.js for this product type}

## Accessibility (WCAG AA)
- Contrast ratio: ≥4.5:1 for normal text, ≥3:1 for large text
- Keyboard navigation: all interactive elements focusable
- Screen reader: all images have alt text
- Motion: respect prefers-reduced-motion

## Copy Standards
- No jargon the target user wouldn't use
- Error messages explain what to do, not just what went wrong
- Empty states guide the user to first action
```

---

### 8. testing.md — Test Strategy

Reference `skills/workflow/` testing patterns.

```markdown
# Testing — {Product Name}
> Version 1.0 | TDD protocol | {date}

## Test Pyramid
- Unit tests: {target coverage %}
- Integration tests: {key flows}
- E2E tests: {critical paths only}

## TDD Protocol (Red → Green → Refactor)
1. Write failing test that describes expected behavior
2. Write minimum code to pass
3. Refactor — no duplication, clean names
4. Repeat

## Load Testing
- Tool: {k6 / Artillery / Locust}
- Targets: {N} concurrent users, <{N}ms p95 response
- Run before: every major release

## Critical Test Cases
{List the 5 flows that must never break}
```

---

### 9. deployment.md — Deployment Plan

Reference `skills/deploy/` for one-click deploy patterns.

```markdown
# Deployment — {Product Name}
> Version 1.0 | One-click deploy | {date}

## Environments
| Env | URL | Deploy trigger | Who can access |
|-----|-----|---------------|----------------|
| dev | {url} | Every push to main | Team |
| staging | {url} | Tag v*.*.0-rc* | Team + stakeholders |
| prod | {url} | Tag v*.*.* | Public |

## Deploy Steps
{Numbered: build → test → deploy → smoke test → notify}

## Rollback Plan
{How to roll back in <5 minutes}

## Feature Flags
{Tool, convention for flag naming, how to clean up}
```

---

### 10. README.md (Project Root)

```markdown
# {Product Name}
> {One-sentence description}

## Quick Start
\`\`\`bash
{3 commands to go from zero to running locally}
\`\`\`

## Architecture
See [architecture.md](.vibe/projects/{slug}/architecture.md)

## Documentation
- [PRD](.vibe/projects/{slug}/PRD.md)
- [API](.vibe/projects/{slug}/api.md)
- [Security](.vibe/projects/{slug}/security.md)
- [Testing](.vibe/projects/{slug}/testing.md)
- [Deployment](.vibe/projects/{slug}/deployment.md)
```

---

## Phase 3 Gate

Present the doc checklist:

| Document | Status | Key decision inside |
|----------|--------|---------------------|
| PRD.md | ✅/❌ | {top decision} |
| SRS.md | ✅/❌ | {top decision} |
| architecture.md | ✅/❌ | {top tech choice} |
| database.md | ✅/❌ | {DB choice} |
| api.md | ✅/❌ | {auth method} |
| security.md | ✅/❌ | {top risk} |
| guardrails.md | ✅/❌ | {taste setting} |
| testing.md | ✅/❌ | {coverage target} |
| deployment.md | ✅/❌ | {deploy platform} |
| README.md | ✅/❌ | — |

Ask (AskUserQuestion):
- Option A: "Proceed to Phase 4 — build it"
- Option B: "Revise [specific doc]"
- Option C: "Save and exit"

On proceed: update MANIFEST.yaml `phase3_complete: true`, `phase: 4`. Tell user to run `/vibe phase4`.
