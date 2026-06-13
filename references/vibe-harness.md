# vibe:harness — Production Readiness Gate

Validates code against 6 known production failure patterns. This is a MANDATORY gate — cannot proceed to review without passing.

## When to Run

After `/vibe:build` completes all tasks. Before `/vibe:review`.

## The 6 Checks

### 1. Error Handling Audit
- Every external call wrapped in try/catch
- Graceful degradation paths exist
- No unhandled promise rejections
- Error messages don't leak internals

### 2. Input Validation
- All user/API inputs validated at boundary
- Type coercion prevented
- Injection vectors closed
- Rate limiting considered

### 3. State Consistency
- No stale state after errors
- Transactions roll back cleanly
- Race conditions identified and handled
- Caching invalidation correct

### 4. Resource Management
- File handles closed in all paths (including error)
- Database connections pooled and released
- Memory limits considered
- No unbounded array/object growth

### 5. Configuration Safety
- Secrets not hardcoded
- Environment variables validated at startup
- Sensible defaults with explicit overrides
- Config changes don't require code changes

### 6. Logging & Observability
- Logs at appropriate levels (info/warn/error)
- No sensitive data in logs
- Correlation IDs for request tracing
- Startup health validated

## Failure Protocol
```
ANY FAIL → Fix the issue → Re-run harness → Loop until all pass
ALL PASS → Write handoff → /clear → Enter review phase
```

## Reference
- v1.1: Production readiness harness
- OWASP ASVS (Application Security Verification Standard)
- Twelve-Factor App methodology
