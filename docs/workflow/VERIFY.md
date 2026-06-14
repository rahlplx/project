# VERIFY: Independent Quality Gate

## Protocol

VERIFY runs as a **separate agent invocation** with fresh context. The agent:
1. Reads `SCOPE.md` to understand what was supposed to be built
2. Reads the build output (changed files, test results, git diff)
3. Has NOT been involved in the BUILD phase
4. Runs all 7 checks below
5. Writes `verify-report.json` with structured results

## 7-Step Check Sequence

### 1. Structural Scan
- File tree: all expected deliverables exist
- Naming conventions: kebab-case, no spaces, consistent extensions
- YAML validity: catalog/tools.yaml parses cleanly

### 2. Security Scan
- OWASP ASI01-ASI08 patterns: execSync, eval, hardcoded secrets, injection vectors
- Report 0 CRITICAL, 0 HIGH findings

### 3. Test Suite
- All baseline tests pass (770+ tests, 78 suites)
- No regressions from pre-build state
- New tests exist for new code

### 4. Index Integrity
- `.well-known/agent-skills/index.json` matches on-disk skill files
- No orphaned entries, no missing entries

### 5. Catalog Validity
- `catalog/tools.yaml` parses correctly
- `catalog/quality-scores.json` covers all tools
- No D-grade tools

### 6. Evolution Check
- No regressions in active rules (evolution.json)
- Proposed rules still valid

### 7. Verify Report
- Write structured `verify-report.json`:
```json
{
  "phase": "verify",
  "agent": "independent",
  "timestamp": "ISO-8601",
  "status": "pass|fail",
  "checks": {
    "structural-scan": { "status": "pass|fail", "details": "..." },
    "security-scan": { "status": "pass|fail", "details": "..." },
    "test-suite": { "status": "pass|fail", "details": "..." },
    "index-integrity": { "status": "pass|fail", "details": "..." },
    "catalog-validity": { "status": "pass|fail", "details": "..." },
    "evolution-check": { "status": "pass|fail", "details": "..." }
  },
  "summary": "All 7 checks pass",
  "failed_checks": []
}
```

## Failure Handling

If any check fails:
1. Document specific failure in verify-report.json
2. Return to BUILD phase
3. BUILD agent fixes issue
4. VERIFY re-runs with fresh context

Max 3 VERIFY iterations before escalation to user.
