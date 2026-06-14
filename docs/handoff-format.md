# Handoff Format Standard

## Purpose

This document defines the standard handoff format for the Spec-Driven Workflow phase. All handoffs between agents must follow this structure to ensure consistent context transfer.

## Format

Handoff documents use Markdown with YAML frontmatter. The frontmatter contains structured metadata; the body contains narrative content in standard sections.

### YAML Frontmatter

```yaml
---
spec: <spec-title>
version: <semver>
generated: <ISO-8601-timestamp>
features: <count>
totalTasks: <count>
totalMilestones: <count>
totalEffort: <points>
source: <engine|architect|manual>
---
```

### Required Sections

#### Context

Brief summary of what this handoff covers. Include the project name, current phase, and any relevant background.

```
## Context
```

#### Spec

Link to or inline the current specification. Include the title, features, requirements, and constraints.

```
## Spec
```

#### Decomposition

Task breakdown organized by milestone. Each task should show its ID, feature, type (RED/GREEN/REFACTOR/VERIFY), and complexity.

```
## Decomposition

### Milestone 1
| ID | Feature | Type | Complexity |
|----|---------|------|------------|
| FEAT-001-RED | Login | RED | small |
```

#### Acceptance Criteria

Per-feature criteria that must pass before the handoff is considered complete.

```
## Acceptance Criteria
```

#### Files

List of files affected by this handoff. Use relative paths from project root.

```
## Files
- src/feature.js
- tests/feature.test.js
```

#### Dependencies

External dependencies or prerequisites required before executing this handoff.

```
## Dependencies
```

#### Risks

Known risks, open questions, or decisions that were deferred.

```
## Risks
```

#### Deliverable Request

What the receiving agent should produce. Be specific about output format and location.

```
## Deliverable Request
```

#### Quality Gates

Gates that must pass before the handoff is considered complete.

```
## Quality Gates
- [ ] All tests pass
- [ ] Lint clean
- [ ] Typecheck clean
- [ ] No CRITICAL issues
```

#### Evidence

Evidence of pre-handoff verification. Include test results, lint output, or verification reports as links or inline summaries.

```
## Evidence
```

#### Artifacts Checklist

Checklist of files and documents that should exist after execution.

```
## Artifacts Checklist
- [ ] Implementation files
- [ ] Test files
- [ ] Updated spec (if changed)
```

## Example

```yaml
---
spec: User Authentication System
version: 1.0.0
generated: 2026-06-14T12:00:00.000Z
features: 3
totalTasks: 12
totalMilestones: 3
totalEffort: 21 points
source: architect
---
```

## Cross-References

- `docs/gates.md` for phase gate criteria
- `skills/workflow/spec-engine/` for spec generation
- `skills/workflow/architect/` for task decomposition
