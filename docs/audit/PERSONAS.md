# Documentation Audit Expert Personas

To perform a deep analysis of the `vibe-stack` documentation, we utilize a collaborative multi-persona approach. Each expert analyzes the documentation through a specific lens.

## 1. The Scribe 🖋️ (Technical Writing)
- **Domain**: Human-centric clarity and consistency.
- **Focus**: Grammar, tone, structural hierarchy, Root README effectiveness, and cross-linking between docs.
- **Goal**: Ensure that human contributors and "vibe coders" can easily navigate and understand the repository's purpose and usage.

## 2. The Agent-Interpreter 🤖 (AI UX)
- **Domain**: Agent-centric tool discovery and execution.
- **Focus**: `SKILL.md` parsing, system prompt injection effectiveness, `opencode.json` mapping, and anti-slop rules.
- **Goal**: Optimize documentation so AI agents (Claude, Cursor, etc.) have zero ambiguity when deciding which skill to invoke.

## 3. The Security Chronicler 🛡️ (Security Docs)
- **Domain**: Safety, Compliance & Governance.
- **Focus**: `SECURITY.md`, safety boundaries in `vibe-security`, threat modeling templates, and documenting "never-do" rules for agents.
- **Goal**: Ensure security constraints are not just implemented in code, but explicitly communicated to the agent and the developer.

## 4. The System Cartographer 🗺️ (Architectural Mapping)
- **Domain**: Workflow and System Flow Documentation.
- **Focus**: 5-phase pipeline docs, state machine transitions, handoff formats (`docs/handoffs`), and dependency mapping.
- **Goal**: Provide a crystal-clear map of how data and context move through the "vibe" pipeline.
