# Break: Unified AI Engineering Orchestrator

**Source**: `.opencode/plans/unified-orchestrator.md`
**Phase**: break → build
**Tests**: 29 tests across 6 steps

---

## Milestones

### M1: Intent Capture (Phase 1)
**Value**: User can say "I want to build X" and get structured PROJECT.md + PRD.md
**Effort**: 1 build session
**Acceptance Criteria**:
- [ ] 3-round Q&A completes in <5 min
- [ ] Skip works at any question
- [ ] Smart defaults applied by category
- [ ] PROJECT.md generated with all sections
- [ ] PRD.md generated with user stories
- [ ] Input validation catches empty/special chars
- [ ] 9 tests pass

### M2: Market Research (Phase 2)
**Value**: Automatic research of existing solutions + pattern extraction
**Effort**: 1 build session
**Acceptance Criteria**:
- [ ] Web search finds 5-10 repos
- [ ] Repo analysis extracts features, pros, cons
- [ ] Pattern extraction works (success, failure, UX)
- [ ] research.md generated with tiers
- [ ] patterns.json generated with evidence
- [ ] Skip works
- [ ] Fallback works (no repos found)
- [ ] 6 tests pass

### M3: Doc Generation (Phase 3)
**Value**: Auto-generate SRS.md, architecture.md, tests.md from templates
**Effort**: 1 build session
**Acceptance Criteria**:
- [ ] Templates merge correctly with data
- [ ] No placeholder text remains
- [ ] Patterns injected into SRS.md
- [ ] All 3 docs generated
- [ ] Partial data handled (defaults fill gaps)
- [ ] Rollback mechanism works
- [ ] 5 tests pass

### M4: Knowledge Base & Utilities
**Value**: Cross-project learning + reusable utility catalog
**Effort**: 1 build session
**Acceptance Criteria**:
- [ ] knowledge-base.json loads/saves correctly
- [ ] utilities-catalog.json loads/saves correctly
- [ ] Patterns extracted from completed projects
- [ ] Patterns injected into new projects
- [ ] Size limit enforced (10MB max)
- [ ] MANIFEST.yaml created for cross-session
- [ ] 5 tests pass

### M5: Integration & Polish
**Value**: MCP + CLI integration, full pipeline working
**Effort**: 1 build session
**Acceptance Criteria**:
- [ ] MCP tools exposed (intent_capture, market_research, doc_generation)
- [ ] CLI commands work (vibe-intent, vibe-research, vibe-docs)
- [ ] State persists across sessions
- [ ] Rollback works for bad state
- [ ] 4 tests pass

---

## Vertical Slices

### Slice 1: Intent Capture Core (M1)
**Dependency**: None
**Files**: `lib/intent-capture.js`, `lib/templates/project-template.js`, `lib/templates/prd-template.js`
**Tests**: 9

#### Tasks

**T1.1: Project Template**
- RED: Write test for project template generation
- GREEN: Implement `lib/templates/project-template.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T1.2: PRD Template**
- RED: Write test for PRD template generation
- GREEN: Implement `lib/templates/prd-template.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T1.3: Intent Capture Logic**
- RED: Write test for Q&A flow (3 rounds, skip, defaults)
- GREEN: Implement `lib/intent-capture.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T1.4: Input Validation**
- RED: Write test for empty/special char validation
- GREEN: Add validation to intent-capture.js
- REFACTOR: Clean up
- VERIFY: Run tests

**T1.5: Reference File**
- RED: Write test for vibe-intent.md existence
- GREEN: Create `references/vibe-intent.md`
- REFACTOR: Clean up
- VERIFY: Run tests

### Slice 2: Market Research Core (M2)
**Dependency**: Slice 1 (needs PROJECT.md)
**Files**: `lib/market-research.js`, `lib/pattern-extractor.js`, `lib/templates/research-template.js`
**Tests**: 6

#### Tasks

**T2.1: Research Template**
- RED: Write test for research template generation
- GREEN: Implement `lib/templates/research-template.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T2.2: Pattern Extractor**
- RED: Write test for pattern extraction (success, failure, UX)
- GREEN: Implement `lib/pattern-extractor.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T2.3: Market Research Logic**
- RED: Write test for web search + repo analysis
- GREEN: Implement `lib/market-research.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T2.4: Reference File**
- RED: Write test for vibe-research.md existence
- GREEN: Create `references/vibe-research.md`
- REFACTOR: Clean up
- VERIFY: Run tests

### Slice 3: Doc Generation Core (M3)
**Dependency**: Slice 1 + Slice 2 (needs PROJECT.md + research.md)
**Files**: `lib/doc-generator.js`, `lib/templates/srs-template.md`, `lib/templates/architecture-template.md`, `lib/templates/tests-template.md`
**Tests**: 5

#### Tasks

**T3.1: SRS Template**
- RED: Write test for SRS template
- GREEN: Create `lib/templates/srs-template.md`
- REFACTOR: Clean up
- VERIFY: Run tests

**T3.2: Architecture Template**
- RED: Write test for architecture template
- GREEN: Create `lib/templates/architecture-template.md`
- REFACTOR: Clean up
- VERIFY: Run tests

**T3.3: Tests Template**
- RED: Write test for tests template
- GREEN: Create `lib/templates/tests-template.md`
- REFACTOR: Clean up
- VERIFY: Run tests

**T3.4: Doc Generator Logic**
- RED: Write test for template merging + pattern injection
- GREEN: Implement `lib/doc-generator.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T3.5: Reference File**
- RED: Write test for vibe-docs.md existence
- GREEN: Create `references/vibe-docs.md`
- REFACTOR: Clean up
- VERIFY: Run tests

### Slice 4: Knowledge Base & Utilities (M4)
**Dependency**: None (can run in parallel with Slices 1-3)
**Files**: `lib/knowledge-base.js`, `lib/utilities-catalog.js`, `.vibe/knowledge-base.json`, `.vibe/utilities-catalog.json`
**Tests**: 5

#### Tasks

**T4.1: Knowledge Base**
- RED: Write test for knowledge base load/save/extract/inject
- GREEN: Implement `lib/knowledge-base.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T4.2: Utility Catalog**
- RED: Write test for utility catalog load/save
- GREEN: Implement `lib/utilities-catalog.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T4.3: State Files**
- RED: Write test for initial schema creation
- GREEN: Create `.vibe/knowledge-base.json`, `.vibe/utilities-catalog.json`
- REFACTOR: Clean up
- VERIFY: Run tests

**T4.4: MANIFEST.yaml**
- RED: Write test for cross-session persistence
- GREEN: Add MANIFEST.yaml support
- REFACTOR: Clean up
- VERIFY: Run tests

**T4.5: Reference File**
- RED: Write test for vibe-utilities.md existence
- GREEN: Create `references/vibe-utilities.md`
- REFACTOR: Clean up
- VERIFY: Run tests

### Slice 5: Integration (M5)
**Dependency**: Slices 1-4 (needs all components)
**Files**: `SKILL.md`, `bin/mcp-server.js`, `bin/cli.js`, `.vibe/state.json`
**Tests**: 4

#### Tasks

**T5.1: SKILL.md Update**
- RED: Write test for intent detection in SKILL.md
- GREEN: Update `SKILL.md` with orchestrator identity
- REFACTOR: Clean up
- VERIFY: Run tests

**T5.2: MCP Tools**
- RED: Write test for MCP tool exposure
- GREEN: Add tools to `bin/mcp-server.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T5.3: CLI Commands**
- RED: Write test for CLI commands
- GREEN: Add commands to `bin/cli.js`
- REFACTOR: Clean up
- VERIFY: Run tests

**T5.4: State Schema**
- RED: Write test for state persistence
- GREEN: Extend `.vibe/state.json` schema
- REFACTOR: Clean up
- VERIFY: Run tests

---

## Dependency Graph

```
Slice 1 (Intent) ──────────────────────────────────────┐
     │                                                  │
     v                                                  │
Slice 2 (Research) ──────────────────────────────────┐ │
     │                                                │ │
     v                                                │ │
Slice 3 (Docs) ────────────────────────────────────┐ │ │
     │                                              │ │ │
     │    Slice 4 (Knowledge) ──────────────────────┤ │ │
     │         │                                    │ │ │
     v         v                                    v v v
Slice 5 (Integration) ◄────────────────────────────┘
```

**Parallel opportunities**:
- Slice 4 can run in parallel with Slices 1-3
- Within each slice, tasks are sequential (T1.1 → T1.2 → T1.3 → ...)

---

## Effort Estimate

| Milestone | Slice | Tasks | Estimated Time |
|-----------|-------|-------|----------------|
| M1 | Slice 1 | 5 | 2-3 hours |
| M2 | Slice 2 | 4 | 2-3 hours |
| M3 | Slice 3 | 5 | 2-3 hours |
| M4 | Slice 4 | 5 | 2-3 hours |
| M5 | Slice 5 | 4 | 1-2 hours |
| **Total** | **5 slices** | **23 tasks** | **9-14 hours** |

---

## Test Summary

| Slice | Tests | Focus |
|-------|-------|-------|
| Slice 1 | 9 | Q&A flow, skip, defaults, validation |
| Slice 2 | 6 | Web search, repo analysis, patterns |
| Slice 3 | 5 | Template merging, pattern injection |
| Slice 4 | 5 | Load/save, extract/inject, size limits |
| Slice 5 | 4 | MCP, CLI, state persistence |
| **Total** | **29** | — |

---

## Next Step

**Ready for `/vibe:build`** to start Slice 1 (Intent Capture Core).

First task: T1.1 — Project Template (RED → GREEN → REFACTOR → VERIFY).
