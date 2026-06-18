# Escalation Report

Use when a task exceeds 3 retry attempts.

## Task

| Field | Value |
|-------|-------|
| **Task** | [Task description] |
| **Developer Agent** | [Agent Name] |
| **QA Agent** | [Agent Name] |
| **Attempts Exhausted** | 3/3 |
| **Timestamp** | [YYYY-MM-DDTHH:MM:SSZ] |

## Failure History

### Attempt 1
- **Issues found**: [Summary]
- **Fixes applied**: [What was changed]
- **Result**: FAIL -- [Why it still failed]

### Attempt 2
- **Issues found**: [Summary]
- **Fixes applied**: [What was changed]
- **Result**: FAIL -- [Why it still failed]

### Attempt 3
- **Issues found**: [Summary]
- **Fixes applied**: [What was changed]
- **Result**: FAIL -- [Why it still failed]

## Root Cause Analysis

**Why the task keeps failing**: [Analysis of the underlying problem]
**Systemic issue**: [Is this a one-off or pattern?]
**Complexity assessment**: [Was the task properly scoped?]

## Recommended Resolution

- [ ] **Reassign** to different developer
- [ ] **Decompose** into smaller sub-tasks
- [ ] **Revise approach** -- architecture/design change needed
- [ ] **Accept** current state with documented limitations
- [ ] **Defer** to future sprint

## Impact Assessment

**Blocking**: [What is blocked by this]
**Timeline Impact**: [How this affects the overall schedule]
**Quality Impact**: [What quality compromises exist if we accept current state]

## Decision Required

**Decision maker**: [Orchestrator or user]
**Deadline**: [When decision is needed to avoid further delays]
