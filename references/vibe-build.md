# vibe:build — TDD Execution with Subagent Dispatch

Implements tasks using RED-GREEN-REFACTOR loop with isolated subagents.

## When to Run

After `/vibe:break` produces a task decomposition.

## Critical Rules

### Q&A Blocking Fix
All subagent dispatches MUST include:
1. `--non-interactive` flag (OpenCode) or `--print` (Codex)
2. Explicit "do not ask questions" instruction in the prompt
3. All decisions pre-made in the prompt (no ambiguity)

### Iron Laws for Build
- TDD IS MANDATORY: No production code without failing test first
- Tests are the specification: If requirements change, change tests first
- Each task is one subagent call: Never combine tasks
- Subagents get full context: Include relevant existing code, test patterns, and expected API

## Steps

### 1. RED — Write the Test
- One subagent per task
- Write failing test that defines expected behavior
- Test must be runnable in isolation
- Verify test fails (RED confirmed)

### 2. GREEN — Implement
- Same subagent (so it sees the test it needs to pass)
- Minimal implementation to pass the test
- No optimization, no refactoring
- Verify test passes (GREEN confirmed)

### 3. REFACTOR — Clean Up
- Same subagent
- Improve code quality without changing behavior
- Tests must still pass after each change

### 4. VERIFY
- Run full test suite
- Run typecheck if applicable
- Run lint if applicable

### 5. Commit (if requested)
- Feat-scoped commit message
- One commit per completed task

## Subagent Dispatch Template

```
Task: <task-name>
Context: <files and patterns to reference>
Acceptance: <specific test or behavior>
Non-interactive: true — do NOT ask questions. All decisions in prompt.
```

## Reference
- Superpowers TDD workflow
- `skills/workflow/tdd-vibe` — TDD implementation skill
- `skills/workflow/verification` — verification gates
