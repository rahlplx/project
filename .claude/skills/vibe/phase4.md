# Phase 4 — Implementation, Quality Gates & Deploy

> Lazy-loaded by `/vibe phase4`. Requires Phase 3 complete.

## Prerequisites Check

1. Read `.vibe/projects/{slug}/MANIFEST.yaml` — confirm `phase3_complete: true`
2. Read `.vibe/projects/{slug}/PROJECT.md` — for intent verification
3. Read `.vibe/projects/{slug}/PRD.md` — for feature acceptance criteria
4. Read `.vibe/projects/{slug}/security.md` — OWASP mapping
5. Read `.vibe/projects/{slug}/guardrails.md` — anti-slop + taste dials
6. If Phase 3 not complete: stop, tell user to run `/vibe phase3` first

---

## Implementation Protocol

### Step 1 — Anti-Slop Pre-Flight

Before writing any UI code, load and enforce the 41 rules from `skills/design/anti-slop/index.js`.

Top 10 rules that must be checked for EVERY component written:

1. No lorem ipsum — all placeholder text must be realistic data
2. No gradient abuse — max 1 gradient per page unless brand identity requires
3. No shadow stacking — one shadow depth per element
4. Consistent spacing — use 4/8/16/24/32/48/64px scale only
5. No icon decoration — icons must communicate, not decorate
6. Contrast ratio ≥4.5:1 for body text (verify with `skills/design/color-gen/index.js`)
7. No centered body text >3 lines
8. No ALL CAPS for body copy (headings allowed, max 2 words)
9. Loading states for every async operation
10. Empty states with clear call-to-action for every list/feed/table

Cross-reference with taste-skill dials from `external/taste-skill/skills/taste-skill/SKILL.md`:
- Read the dial settings from `guardrails.md` (set in Phase 3)
- Apply accordingly before generating any UI

---

### Step 2 — TDD Protocol (Red → Green → Refactor)

Reference `skills/workflow/` for TDD patterns.

For EVERY feature in the MoSCoW "Must" list from PRD.md:

**Red phase** — write the test first:
```js
// Describe the expected behavior, not the implementation
test('{feature}: {expected behavior}', () => {
  // Arrange
  // Act
  // Assert
})
```

**Green phase** — minimum code to pass:
- Write the simplest implementation that makes the test pass
- No premature optimization
- No features beyond what the test covers

**Refactor phase**:
- No duplicated logic
- Names describe intent
- Functions do one thing

**Coverage gate**: Do NOT proceed to Step 3 until unit test coverage ≥80% on core business logic.

---

### Step 3 — Security Gates (OWASP Top 10)

Run `skills/quality/security-audit/index.js` against generated code.

Check each OWASP category against actual implementation:

| Check | Tool/Method | Pass Condition |
|-------|-------------|----------------|
| A01 Broken Access Control | Code review: all routes have auth middleware | Every protected route has explicit auth check |
| A02 Crypto Failures | Grep for `md5`, `sha1`, `base64 password` | Zero hits |
| A03 Injection | Grep for string concatenation in SQL/shell | Zero unparameterized queries |
| A04 Insecure Design | Review against threat model in security.md | All high-risk flows have mitigations |
| A05 Security Misconfiguration | Check default creds, debug flags, CORS | No wildcard CORS in prod config |
| A06 Vulnerable Components | `npm audit` / `pip audit` | Zero critical/high CVEs |
| A07 Auth Failures | Test: brute force, session fixation, logout | All fail correctly |
| A08 Data Integrity | Check CI/CD pipeline for unsigned artifacts | Supply chain protected |
| A09 Security Logging | Verify auth events, errors are logged | Login fails, permission errors logged |
| A10 SSRF | Review all user-supplied URLs used in server calls | Allowlist enforced |

**Hard gate**: If any HIGH or CRITICAL item fails, stop implementation and fix before continuing.

---

### Step 4 — Virtual Team Final Review

All 6 roles review the implementation before deploy.

**CEO**: "Does the shipped v1 match the scope we agreed in PROJECT.md? What's been added that wasn't approved?"

**CTO**: "Run `npm audit`. Check architecture.md — did we implement what we designed, or drift? What tech debt are we accepting and why?"

**Designer**: Run anti-slop scan (`skills/design/anti-slop/index.js`). Report violations count. "Is visual output consistent with taste-skill dials?"

**QA**: "Test the 5 critical paths from testing.md. Report: pass/fail + edge case found."

**Security**: "Re-run OWASP checklist from Step 3. Any regressions from last check?"

**PM**: "Map each shipped feature to its acceptance criterion from PRD.md. % complete?"

Present team verdict in a table:

| Role | Status | Blocker? |
|------|--------|---------|
| CEO | ✅/⚠️/❌ | {note} |
| CTO | ✅/⚠️/❌ | {note} |
| Designer | ✅/⚠️/❌ | {note} |
| QA | ✅/⚠️/❌ | {note} |
| Security | ✅/⚠️/❌ | {note} |
| PM | ✅/⚠️/❌ | {note} |

Any ❌ = hard block on deploy. Must resolve.

---

### Step 5 — Done Verifier (14-Point Checklist)

Reference `skills/quality/done-verifier/index.js`.

| # | Check | Status |
|---|-------|--------|
| 1 | All Must features from PRD.md shipped | ✅/❌ |
| 2 | Unit test coverage ≥80% (core logic) | ✅/❌ |
| 3 | Zero npm audit critical/high | ✅/❌ |
| 4 | All OWASP checks passed | ✅/❌ |
| 5 | Anti-slop: zero violations | ✅/❌ |
| 6 | WCAG AA contrast on all text | ✅/❌ |
| 7 | Mobile responsive (375px min) | ✅/❌ |
| 8 | Empty states implemented | ✅/❌ |
| 9 | Loading states implemented | ✅/❌ |
| 10 | Error states with clear message | ✅/❌ |
| 11 | README.md accurate and runnable | ✅/❌ |
| 12 | No secrets in codebase (grep `.env`) | ✅/❌ |
| 13 | Deployment smoke test passed | ✅/❌ |
| 14 | KPIs from PROJECT.md are trackable | ✅/❌ |

**Gate**: 14/14 required for "DONE". If any ❌, fix and re-run this step.

---

### Step 6 — Intent Verification

Reference `skills/explain/intent-capture/index.js`.

Compare final output to original PROJECT.md:

> "You wanted to build: {original one-sentence description from Q1 of Phase 1}.
> Here's what we built: {one-sentence description of actual shipped product}.
> Match: {YES / PARTIAL — {what drifted} / NO — {what's missing}}"

If PARTIAL or NO: present the gap and ask user how to resolve before deploy.

---

### Step 7 — One-Click Deploy

Reference `skills/deploy/` for platform-specific deploy scripts.

```bash
# Verify build
npm run build

# Run final test suite
npm test

# Deploy (adapt to platform)
# Vercel: vercel deploy --prod
# Railway: railway up
# Fly.io: fly deploy
# AWS: cdk deploy

# Smoke test
curl -f {prod-url}/health || echo "❌ Health check failed"
```

After deploy, update MANIFEST.yaml:
```yaml
phase4_complete: true
status: complete
last_updated: {ISO timestamp}
deploy_url: {url}
```

Update `.vibe/state.json`:
```json
{
  "current_project": "{slug}",
  "current_phase": 4,
  "agent_status": "idle",
  "dirty": false,
  "last_updated": "{ISO timestamp}"
}
```

---

## Phase 4 Complete

Tell the user:

> "🚀 {Product Name} is deployed to {url}.
>
> Done checklist: 14/14 ✅
> Virtual team: all approved ✅
> Security: OWASP 10/10 ✅
>
> Your PROJECT.md, PRD.md, and all documentation live in `.vibe/projects/{slug}/`.
> To start a new project, run `/vibe` and describe your next idea."
