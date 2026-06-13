# Pattern: Handoff Template Pattern

## Context
Multi-agent pipelines need structured handoffs between agents and phases to prevent context loss.

## Pattern
Each handoff template follows a consistent structure:
1. **Metadata table** (From, To, Phase, Task, Priority, Timestamp)
2. **Context section** (Current state, relevant files, dependencies)
3. **Deliverable specification** (What's needed, acceptance criteria)
4. **Quality expectations** (Must pass criteria, evidence required)

## Application
- vibe-stack uses 8 templates in `docs/handoffs/` mapped to 11 pipeline phases
- Templates are Markdown with bracketed `[Field]` placeholders
- Auto-maintain harness verifies all templates exist at startup

## Source
Adapted from NEXUS agency-agents handoff-templates.md (agency-agents repository)
