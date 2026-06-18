---
name: vibe-security
description: "OWASP Top 10 security audit + code pattern scanning + security defaults enforcement.
  Use when: before any release, when handling user data, adding auth, integrating payments,
  building APIs. Auto-triggers on any auth/database/payment/API code. Wraps: security-audit,
  security-defaults, guardrails skills. Injects 41 OWASP checks + 6 code-pattern detectors.
  Outputs findings with severity + remediation steps."
argument-hint: "[scan|checklist|defaults|pentest] [--file path] [--app-type web|api|mobile]"
version: 1.0.0
allowed-tools:
  - Read
  - Bash(grep -rn*)
  - Bash(npm audit*)
  - Bash(cat*)
  - Bash(find . -name*)
  - Bash(node skills/quality/security-audit/index.js*)
  - AskUserQuestion
---

<EXTREMELY-IMPORTANT>
Security findings rated CRITICAL or HIGH are MERGE BLOCKERS. Do not rationalize shipping
with known vulnerabilities. "We'll fix it after launch" has never worked. The cost of
a breach is always higher than the cost of the delay.
</EXTREMELY-IMPORTANT>

# Vibe-Security — OWASP Security Audit

## Dispatcher

- No args or `scan` → full code scan + OWASP checklist on current codebase
- `checklist` → OWASP 10-category checklist only (no code scan)
- `defaults` → generate security-defaults configuration for the project stack
- `pentest` → full audit + threat model + attack vector enumeration
- `--file {path}` → scan specific file only
- `--app-type {type}` → tailor checklist to web app, REST API, or mobile backend

---

## Step 1 — Automated Code Pattern Scan

Run these grep patterns against the codebase (or `--file` target):

```bash
# A02 — Cryptographic Failures: weak hashing
grep -rn "md5\|sha1\|sha256.*password\|base64.*password\|btoa.*pass" --include="*.js" --include="*.ts" --include="*.py" .

# A03 — Injection: unsanitized input
grep -rn "innerHTML\s*=\|dangerouslySetInnerHTML\|document\.write\|eval(" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" .
grep -rn "\$.*WHERE\|query.*\+\|execute.*\+" --include="*.js" --include="*.ts" --include="*.py" .

# A07 — Auth Failures: hardcoded credentials
grep -rn "password\s*=\s*['\"].\{3,\}['\"] \|secret\s*=\s*['\"].\{5,\}['\"] \|api_key\s*=\s*['\"].\{5,\}['\"] " --include="*.js" --include="*.ts" --include="*.py" --include="*.env" . | grep -v "process\.env\|config\.\|example\|test"

# A05 — Misconfiguration: CORS wildcard
grep -rn "origin.*\*\|Access-Control-Allow-Origin.*\*" --include="*.js" --include="*.ts" .

# A09 — Logging Failures: sensitive data in logs
grep -rn "console\.log.*password\|console\.log.*token\|console\.log.*secret\|logger\.info.*password" --include="*.js" --include="*.ts" .

# A10 — SSRF: user-supplied URLs
grep -rn "fetch(req\.\|axios.get(req\.\|http\.get(req\.\|got(req\." --include="*.js" --include="*.ts" .
```

For each hit: report file path, line number, severity, category, and fix.

---

## Step 2 — OWASP Top 10 Checklist

From `skills/quality/security-audit/index.js`. For each category, ask/verify the control:

### A01 — Broken Access Control 🔴
- [ ] All routes have explicit auth middleware (not just login check at app level)
- [ ] Users cannot access other users' resources (IDOR check: can user A see user B's data?)
- [ ] Admin functions require admin role check, not just "is logged in"
- [ ] Directory listing disabled on server
- [ ] JWT tokens validated server-side (not just decoded)

### A02 — Cryptographic Failures 🔴
- [ ] Passwords hashed with bcrypt/argon2/scrypt (NOT md5, sha1, sha256)
- [ ] Sensitive data encrypted at rest (PII, payment info, health data)
- [ ] TLS 1.2+ enforced (no TLS 1.0/1.1, no SSLv3)
- [ ] Secrets in environment variables, not source code
- [ ] API keys rotated and have minimal permissions

### A03 — Injection 🔴
- [ ] All database queries use parameterized statements / ORM
- [ ] No string concatenation in SQL, shell commands, or LDAP queries
- [ ] HTML output escaped (no `innerHTML =` with user input)
- [ ] File paths validated against allowlist before use
- [ ] No `eval()` with user-controlled input

### A04 — Insecure Design 🟡
- [ ] Threat model documented (who are attackers, what do they want?)
- [ ] Business logic flaws considered (can user buy item at $0? can they skip steps?)
- [ ] Rate limiting on all forms and APIs
- [ ] Multi-factor authentication available for sensitive operations

### A05 — Security Misconfiguration 🟡
- [ ] No default credentials in production
- [ ] Debug mode / stack traces disabled in production
- [ ] CORS not set to `*` in production
- [ ] Security headers present: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Security-Policy`
- [ ] Error messages don't reveal internal stack traces to users
- [ ] Unnecessary features/endpoints disabled

### A06 — Vulnerable Components 🟡
Run: `npm audit --audit-level=moderate` (or `pip-audit` / `cargo audit`)
- [ ] Zero critical vulnerabilities
- [ ] Zero high vulnerabilities
- [ ] Dependencies pinned or have upper bounds
- [ ] Dependency update process documented

### A07 — Authentication Failures 🔴
- [ ] Brute force protection (lockout after N failed attempts or CAPTCHA)
- [ ] Session tokens invalidated on logout
- [ ] Password reset tokens expire within 15 minutes
- [ ] "Remember me" uses separate long-lived token (not the session token)
- [ ] Multi-factor auth available for high-privilege accounts

### A08 — Software & Data Integrity Failures 🟡
- [ ] Dependencies sourced from trusted registries (not arbitrary URLs)
- [ ] CI/CD pipeline has integrity checks (signed commits, artifact checksums)
- [ ] Auto-update mechanisms verify signatures

### A09 — Security Logging & Monitoring Failures 🟡
- [ ] Authentication events logged (login, logout, failed login)
- [ ] Authorization failures logged (403 errors)
- [ ] High-value transactions logged (payments, account changes)
- [ ] Logs do NOT contain passwords, tokens, or PII
- [ ] Log anomaly alerting configured

### A10 — Server-Side Request Forgery (SSRF) 🟡
- [ ] User-supplied URLs validated against allowlist before server-side fetch
- [ ] Internal network ranges blocked from SSRF target URLs
- [ ] Response from external URL not directly proxied to user without sanitization

---

## Step 3 — Threat Model (for `pentest` mode)

Answer and document these for the project:

**Who are the adversaries?**
- External attacker (no auth)
- Authenticated user (low-privilege)
- Privileged insider
- Automated scanner/bot

**What do they want?**
- User data (PII exfiltration)
- Financial gain (payment bypass, free tier abuse)
- Service disruption
- Reputational damage

**What's the blast radius of a breach?**
- How many users affected?
- What data is exposed?
- What's the regulatory impact? (GDPR, HIPAA, PCI-DSS)

Write threat model to `.vibe/projects/{slug}/security.md` (adds to Phase 3 doc).

---

## Step 4 — Security Defaults Configuration

Generate for the project's stack. Inject these defaults:

**Node.js/Express:**
```js
// Required security middleware
import helmet from 'helmet'           // Sets 11 security headers
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'

app.use(helmet())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
```

**Environment variables checklist:**
```bash
# Required — throw if missing
DATABASE_URL=         # Never hardcode
JWT_SECRET=           # Min 32 chars of entropy
SESSION_SECRET=       # Min 32 chars of entropy
# Never log these values
```

**CSP header (minimal starting point):**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
```

---

## Audit Report Format

```
VIBE-SECURITY AUDIT — {scope}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL (ship-blocking):
  🚨 [A03] SQL injection at db/queries.js:47 — string concatenation in SELECT
  🚨 [A02] Hardcoded DB password in config.js:12

HIGH (fix before release):
  🔴 [A01] /admin route missing role check
  🔴 [A07] No brute-force protection on /login

MEDIUM (fix in next sprint):
  🟡 [A05] CORS set to * in server.js:23
  🟡 [A06] 2 high-severity npm audit findings

LOW (track in backlog):
  🟢 [A09] Failed login attempts not logged

npm audit: {N} critical | {N} high | {N} moderate
OWASP score: {N}/10 categories passing

VERDICT: {SECURE ✅ | CRITICAL ISSUES — DO NOT SHIP 🚨 | NEEDS REMEDIATION 🔴}
```
