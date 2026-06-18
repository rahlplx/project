# vibe:review — Multi-Perspective Code Review

Finds bugs, security issues, and quality problems before shipping.

## When to Run

After `/vibe:harness` passes all 6 checks (mandatory gate).

## Steps

### 1. Code Review
- Review all changed files
- Check for:
  - Logic errors and edge cases
  - Dead code or unused imports
  - Inconsistent naming or patterns
  - Missing error handling
  - Performance anti-patterns

### 2. Security Audit
- Check OWASP Top 10:
  - Injection (SQL, NoSQL, command)
  - Broken authentication
  - Sensitive data exposure
  - XXE
  - Broken access control
  - Security misconfiguration
  - XSS
  - Insecure deserialization
  - Known vulnerable components
  - Insufficient logging
- Check for secrets in code

### 3. Fix Issues
- For each issue found:
  - Severity (critical/major/minor)
  - Fix recommendation
  - Implement fix
  - Re-run tests to verify

### 4. Output
- Review report with issue count and severity breakdown
- All critical and major issues fixed
- Tests pass after fixes

## Reference
- gstack `/review`
- Superpowers two-stage review (code + security)
- `skills/quality/code-review` — automated code review
- `skills/quality/security-defaults` — security baseline checks
- `skills/quality/vibe-review` — comprehensive project review
