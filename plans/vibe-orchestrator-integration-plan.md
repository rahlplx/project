# Vibe-Stack Orchestrator Integration Plan

**Date:** 2026-06-16
**Author:** OpenCode Agent
**Status:** Plan Ready for Implementation

**Implemented so far:** `lib/gstack/strategy-engine.js` (3.1, gstack CEO/Designer/Engineer
review only — `role-evaluator.js`/`design-scorer.js` below are still unbuilt), wired into
`lib/vibe-commands/plan.js`. `skills/orchestration/gsd-workflow/` (GSD Define→Build→Ship,
not the orchestrator-directory rewrite this plan originally scoped). `skills/design/taste-skill/`
(dials + hard rules, not the `lib/design/semantic-design.js` split below). `skills/knowledge/graphify/`
extended with EXTRACTED/INFERRED/AMBIGUOUS tagging and reporting. QA workflow (3.2) and the
`lib/design/*` file split (4.1/4.2) remain unimplemented.

## Executive Summary

This plan outlines the systematic integration of characteristics from 5 repos into the vibe-stack project:

1. **gsd-build/get-shit-done** - Context stabilization and auto-mode
2. **garrytan/gstack** - Strategy, decisions, and QA workflows
3. **obra/superpowers** - TDD and subagent execution
4. **pbakaus/impeccable** - Design audit and quality scoring
5. **leonxlnx/taste-skill** - Semantic design system

The goal is to merge these repos' full systems into vibe-stack, ensuring they work together like magic while being tailored to our existing architecture.

## Current State Analysis

### What We Already Have

**Architecture:**

- Node.js framework with CommonJS modules
- MCP SDK integration for AI agent tools
- Skill-based architecture with 49 skills across 11 categories
- Autonomous lifecycle system in .vibe/ directory

**CLI Commands:**

- 21 `/vibe:*` commands in bin/vibe.js
- Command routing with hybrid phase validation
- Telemetry integration for every command

**Quality Gates:**

- 15 harness checks passing
- 0 ESLint errors (349 warnings)
- 910 tests (762 Jest + 148 node:test)

**State Management:**

- .vibe/state.json for pipeline state
- .vibe/lifecycle.json for maintenance triggers
- .vibe/evolution.json for rule management

## Integration Strategy

### Phase 1: Core Orchestrator (Week 1)

**Goal:** Create the unified orchestrator that combines all 5 repos' workflows

#### 1.1 Unified State Machine

Extract from gsd and gstack to create a unified state machine:

**Files to Create:**

- `lib/orchestrator/state-machine.js` - Unified state machine
- `lib/orchestrator/phase-gates.js` - Phase validation gates
- `lib/orchestrator/context-manager.js` - Context hygiene management

#### 1.2 Context Hygiene System

Extract from GSD to implement context stabilization:

**Files to Create:**

- `lib/orchestrator/context-manager.js` - Context hygiene
- `lib/orchestrator/handoff-formatter.js` - Handoff document formatting

#### 1.3 Role Loading System

Extract from gstack to implement lazy role loading:

**Files to Create:**

- `lib/orchestrator/role-loader.js` - Lazy role loading
- `lib/orchestrator/token-manager.js` - Token optimization

### Phase 2: Superpowers TDD Integration (Week 1-2)

**Goal:** Integrate Superpowers TDD workflow with subagent dispatch

#### 2.1 TDD Workflow Engine

Extract from Superpowers to implement TDD with subagent dispatch:

**Files to Create:**

- `lib/superpowers/tdd-workflow.js` - TDD workflow engine
- `lib/superpowers/subagent-dispatch.js` - Non-interactive subagent dispatch
- `lib/superpowers/prompt-builder.js` - TDD prompt construction

#### 2.2 Subagent Management

Extract from Superpowers to manage subagent lifecycle:

**Files to Create:**

- `lib/superpowers/subagent-manager.js` - Subagent lifecycle
- `lib/superpowers/context-isolator.js` - Context isolation

### Phase 3: gstack Strategy Integration (Week 2)

**Goal:** Integrate gstack's strategy, decisions, and QA workflows

#### 3.1 Strategy Engine

Extract from gstack to implement strategic planning:

**Files to Create:**

- `lib/gstack/strategy-engine.js` - Strategic planning
- `lib/gstack/role-evaluator.js` - Role-based evaluation
- `lib/gstack/design-scorer.js` - Design dimension scoring

#### 3.2 QA Workflow

Extract from gstack to implement QA with real browser testing:

**Files to Create:**

- `lib/gstack/qa-workflow.js` - QA workflow
- `lib/gstack/browser-tester.js` - Browser testing
- `lib/gstack/bug-detector.js` - Bug detection

### Phase 4: Design Quality Integration (Week 2-3)

**Goal:** Integrate impeccable and taste-skill for design quality

#### 4.1 Design Audit System

Extract from impeccable to implement design audit:

**Files to Create:**

- `lib/design/audit-system.js` - Design audit
- `lib/design/anti-pattern-detector.js` - Anti-pattern detection
- `lib/design/quality-scorer.js` - Quality scoring

#### 4.2 Semantic Design System

Extract from taste-skill to implement semantic design:

**Files to Create:**

- `lib/design/semantic-design.js` - Semantic design tokens
- `lib/design/typography-system.js` - Typography rules
- `lib/design/color-system.js` - Color palette generation
- `lib/design/layout-system.js` - Layout patterns

## Implementation Roadmap

### Week 1: Foundation

1. Create orchestrator directory structure
2. Implement unified state machine
3. Implement context hygiene system
4. Implement role loading system
5. Write tests for all new modules

### Week 2: TDD & Strategy

1. Implement TDD workflow engine
2. Implement subagent management
3. Implement strategy engine
4. Implement QA workflow
5. Write tests for all new modules

### Week 3: Design Quality

1. Implement design audit system
2. Implement semantic design system
3. Integrate with existing vibe-design command
4. Write tests for all new modules

### Week 4: Integration & Testing

1. Integrate all modules with existing vibe-stack commands
2. Run full test suite
3. Run harness checks
4. Update documentation
5. Create handoff documents

## Quality Gates

### For Each Module

- Unit tests passing
- Integration tests passing
- ESLint with 0 errors
- TypeScript type checking passing

### For Full Integration

- All 15 harness checks passing
- All 21 CLI commands working
- 910+ tests passing
- Documentation updated

## Risk Assessment

### High Risk

- Context pollution between phases
- Token bloat from role loading
- Subagent timeout handling

### Medium Risk

- Integration with existing commands
- State synchronization
- Error recovery

### Low Risk

- Design quality scoring
- Typography system
- Color palette generation

## Success Criteria

1. All 5 repos' characteristics integrated
2. All tests passing
3. All harness checks passing
4. No ESLint errors
5. Documentation complete
6. Handoff documents created

## Next Steps

1. Review this plan with team
2. Get approval to proceed
3. Start Phase 1 implementation
4. Daily standups during implementation
5. Weekly reviews with stakeholders
