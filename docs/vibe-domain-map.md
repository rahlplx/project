# 🗺️ VibeNexus Domain Map & Efficiency Guide

This document maps the core domains of the VibeNexus codebase, analyzed through the lens of multiple expert personas to maximize efficiency, performance, and clarity.

---

## 1. CLI Entry & Command Dispatch

**The "Front Door" of the system.**

- **WHAT**: Handles user input, registers commands, and dispatches to the correct handler.
- **WHY**: Provides a single, unified interface for all vibe-coding operations.
- **WHO**: **Bolt ⚡** (Persona: Performance Expert).
- **WHEN**: Every time a user or agent runs `node bin/vibe.js`.
- **WHERE**: `bin/vibe.js`, `lib/vibe-commands/index.js`.
- **HOW**: Uses a registry pattern with lazy-loaded handlers to minimize boot tax.
- **REAL-WORLD RESULT**: Fast response times for utility commands like `status` or `help`.
- **EFFICIENCY RATING**: ⭐⭐⭐ (Good, but high "boot tax" on heavy commands).
- **PROVEN SOLUTION**: Implement granular lazy-loading for heavy constants and telemetry tracers.

---

## 2. Orchestration & Pipeline

**The "Brain" of the operation.**

- **WHAT**: Manages the 5-phase workflow (Think → Plan → Break → Build → Harness... → Done).
- **WHY**: Ensures complex engineering tasks are broken down and executed in the correct order.
- **WHO**: **The Architect** (Persona: System Integrity).
- **WHEN**: During multi-step agent engagements.
- **WHERE**: `lib/orchestrator/`, `lib/gstack/`, `lib/superpowers/`.
- **HOW**: Uses a finite state machine (`state-machine.js`) to track progress and validate transitions.
- **REAL-WORLD RESULT**: Reliable, repeatable software delivery without skipping critical steps like "Review" or "Harness".
- **EFFICIENCY RATING**: ⭐⭐⭐⭐ (Solid logic, complex dependencies).
- **PROVEN SOLUTION**: Use `QueryEnricher` with `TTLCache` to prevent redundant context injection.

---

## 3. Context & State Management

**The "Long-term Memory".**

- **WHAT**: Persists project state, goals, and handoff documents.
- **WHY**: Allows agents to "resume" work across different sessions or even different LLMs.
- **WHO**: **The CTO** (Persona: Strategy & Continuity).
- **WHEN**: Every time a phase completes or a goal is set.
- **WHERE**: `.vibe/state.json`, `lib/vibe-commands/state-helpers.js`, `lib/orchestrator/context-manager.js`.
- **HOW**: Writes structured JSON and Markdown handoffs to the `.vibe/` directory.
- **REAL-WORLD RESULT**: Agents never "forget" what they were doing between restarts.
- **EFFICIENCY RATING**: ⭐⭐ (High I/O overhead; redundant reads/writes).
- **PROVEN SOLUTION**: Consolidate state and lifecycle updates into single atomic operations.

---

## 4. Telemetry & Tracing

**The "Observability Layer".**

- **WHAT**: Records command usage, errors, and performance spans via a lightweight OTel shim.
- **WHY**: To identify bottlenecks, detect "stuck" agents, and feed the autonomous learning loop.
- **WHO**: **QA** (Persona: Validation & Diagnostics).
- **WHEN**: Background process during every command execution.
- **WHERE**: `lib/telemetry/`, `.vibe/telemetry/`.
- **HOW**: Writes `.jsonl` span files that are later aggregated.
- **REAL-WORLD RESULT**: Clear visibility into which skills are used most and where errors happen.
- **EFFICIENCY RATING**: ⭐⭐⭐ (Low overhead, but adds constant startup tax).
- **PROVEN SOLUTION**: Move tracer initialization inside the command execution block to skip for utility commands.

---

## 5. Skill & Catalog Management

**The "Capability Library".**

- **WHAT**: A collection of JS-based agent skills and a curated YAML catalog of 3rd-party tools.
- **WHY**: To give the agent specific, verified superpowers for tasks like "one-click-deploy" or "security-audit".
- **WHO**: **The Librarian** (Persona: Discovery & Curation).
- **WHEN**: During the "Think" and "Plan" phases.
- **WHERE**: `skills/`, `catalog/`, `lib/discovery-index.js`.
- **HOW**: Indexed via SHA-256 digests for integrity and originality checks.
- **REAL-WORLD RESULT**: Agents can find the "right tool for the job" instantly.
- **EFFICIENCY RATING**: ⭐⭐⭐⭐ (Well organized, easily extensible).
- **PROVEN SOLUTION**: Pre-index skills during the `postformat` hook to avoid runtime scanning.

---

## 6. Autonomous Maintenance

**The "Self-Healing Loop".**

- **WHAT**: Background scripts that evolve rules and clean up technical debt based on telemetry.
- **WHY**: To keep the codebase "sharp" and improve agent performance over time.
- **WHO**: **The Gardener** (Persona: Optimization).
- **WHEN**: Triggered automatically after N interactions or periodically.
- **WHERE**: `.vibe/lifecycle/`, `lib/auto-maintain.js`.
- **HOW**: Detached child processes that run non-blocking maintenance tasks.
- **REAL-WORLD RESULT**: A system that gets better (faster, more accurate) the more you use it.
- **EFFICIENCY RATING**: ⭐⭐⭐ (Powerful, but trigger logic is scattered).
- **PROVEN SOLUTION**: Centralize lifecycle triggers in `state-helpers.js` to eliminate redundant file reads.

---

## 7. External Integrations (MCP/IDE)

**The "Bridge to the World".**

- **WHAT**: Connects vibenexus to Cursor, Claude Code, and other MCP-compatible environments.
- **WHY**: To bring vibe-coding skills directly into the user's preferred editor.
- **WHO**: **The Ambassador** (Persona: Interoperability).
- **WHEN**: Installation and during live MCP sessions.
- **WHERE**: `bin/mcp-server.js`, `lib/install-ide.js`, `plugin/`.
- **HOW**: Implements the Model Context Protocol (MCP) for tool discovery and execution.
- **REAL-WORLD RESULT**: "Talk to your code" in Cursor with full VibeNexus context.
- **EFFICIENCY RATING**: ⭐⭐⭐ (Interpreted bridge; slight latency).
- **PROVEN SOLUTION**: Use `ResponseStreamer` for real-time progress updates during long-running tool calls.
