---
name: vibe-review
description: "Full virtual team code review — 6 expert perspectives (CEO, CTO, Designer, QA,
  Security, PM) on any code, feature, PR, or architectural decision. Use when: you want
  a second opinion, before merging, after a major feature, or when something feels off.
  Wraps: virtual-team, code-health, done-verifier, vibe-review skills. Outputs actionable
  findings per role with severity (blocker/warning/suggestion)."
argument-hint: "[quick|deep|roles CEO,CTO,...] [--pr] [--pre-merge]"
version: 1.0.0
allowed-tools:
  - Read
  - Bash(git diff*)
  - Bash(git log*)
  - Bash(npm test*)
  - Bash(npm run lint*)
  - Bash(node skills/orchestration/virtual-team/index.js*)
  - Bash(node skills/quality/done-verifier/index.js*)
  - AskUserQuestion
---

# Vibe-Review — Virtual Team Code Review

## Dispatcher

Read `$ARGUMENTS`:
- No args → full 6-role review of current diff or pasted code
- `quick` → CEO + CTO + Security only (3 roles, faster)
- `deep` → all 6 roles + done-verifier 14-point checklist + test run
- `roles CEO,Security` → only named roles (comma-separated)
- `--pr` → pull review scope from `git diff main...HEAD`
- `--pre-merge` → deep review + block on any ❌ findings

---

## Pre-Review Context Gathering

Before running any role review:

1. If `--pr` flag: run `git diff main...HEAD --stat` to understand scope
2. If no flag: ask user to paste the code or name the file(s) to review
3. Check if `.vibe/projects/{slug}/PRD.md` exists — if yes, load it as acceptance criteria context
4. Check `npm run lint` output if package.json exists — capture any existing lint errors

---

## The 6-Role Review (from `skills/orchestration/virtual-team/index.js`)

Run each role sequentially. Each role gives:
- **2–4 concrete findings** (not vague observations)
- **Severity**: 🔴 Blocker | 🟡 Warning | 🟢 Suggestion
- **Specific line/file reference** when possible
- **One actionable fix** per finding

---

### CEO Review
**Lens**: Business value, scope, ROI, time-to-market risk

Key questions this role always asks:
- Does this code deliver the value proposition in PROJECT.md?
- What was added that wasn't in the spec? (scope creep detector)
- What's the fastest path to ship if something here was cut?
- Does this create customer-visible behavior or only technical debt?

Output format:
```
CEO 📊
  🟡 Scope creep: {X} added but not in PRD.md — confirm intentional
  🟢 Could defer {Y} to v1.1 — saves {N} days of QA
```

---

### CTO Review
**Lens**: Architecture, scalability, tech debt, security posture, maintainability

Key questions:
- Does this introduce a new pattern inconsistent with the existing codebase?
- What breaks at 10× scale?
- Is there hidden complexity (N+1 queries, unbounded loops, memory leaks)?
- What's the blast radius if this module fails?

Output format:
```
CTO 🏗️
  🔴 N+1 query in {file}:{line} — will degrade at >100 records
  🟡 Missing error boundary — async failure uncaught
```

---

### Designer Review
**Lens**: Anti-slop 41 rules, WCAG, taste-skill dials, visual consistency

Key questions:
- Does any UI code violate the 41 anti-slop rules? (run `/vibe-design audit` if needed)
- Is this component consistent with the established design system?
- Are all interactive states handled (hover, focus, active, disabled, loading, empty, error)?
- Does copy follow the standards in guardrails.md?

Output format:
```
Designer 🎨
  🔴 [C06] Default blue button — apply brand color from design-system tokens
  🟡 No empty state for {component} — add illustration + CTA
  🟢 Typography hierarchy looks clean
```

---

### QA Review
**Lens**: Edge cases, error states, race conditions, mobile, accessibility

Key questions:
- What happens if the API returns 0 results, null, or 500?
- What's the mobile experience at 375px?
- Are there race conditions in async operations?
- What input validation is missing?
- What does the user see during loading, error, and empty states?

Output format:
```
QA 🧪
  🔴 No error state for failed API call at {file}:{line}
  🟡 Race condition possible if user clicks submit twice before response
  🟡 Not tested: empty array return from {endpoint}
```

---

### Security Review
**Lens**: OWASP Top 10, auth, data exposure, injection, secrets

Key questions:
- Is user input sanitized before use in queries, HTML, or shell?
- Are auth checks present on all protected routes?
- Is sensitive data logged anywhere?
- Are there hardcoded credentials or API keys?
- Is CORS configured correctly?

Run code scan patterns:
```bash
# Check for common vulnerabilities
grep -n "innerHTML\|dangerouslySetInnerHTML" {file} 2>/dev/null
grep -n "eval\|exec\|system(" {file} 2>/dev/null
grep -n "password\|secret\|api_key\|token" {file} 2>/dev/null | grep -v "process.env\|config\."
```

Output format:
```
Security 🔒
  🔴 [A03] Unparameterized query at {file}:{line} — SQL injection risk
  🔴 [A02] Hardcoded API key found — move to env var immediately
  🟡 [A01] Route {endpoint} missing auth middleware
```

---

### PM Review
**Lens**: Requirements alignment, user stories, KPIs, acceptance criteria

Key questions:
- Does this implementation match the user stories in PRD.md?
- Are all acceptance criteria met?
- Will the defined KPIs be trackable with this code?
- Is there any UX flow that contradicts the user journey defined in PRD.md?

Output format:
```
PM 📋
  🔴 User story US-03 not implemented: "user can export results as CSV"
  🟡 KPI "time to first value" not measurable — no analytics event fired
  🟢 All Must-have features from MoSCoW list present
```

---

## Done Verifier (14-Point Checklist)

Run on `deep` or `--pre-merge`. From `skills/quality/done-verifier/index.js`:

| # | Check | Status |
|---|-------|--------|
| 1 | All Must features from PRD.md present | ✅/❌ |
| 2 | Unit test coverage ≥80% on business logic | ✅/❌ |
| 3 | Zero `npm audit` critical/high vulnerabilities | ✅/❌ |
| 4 | OWASP Top 10 checks passed | ✅/❌ |
| 5 | Anti-slop 41 rules: zero violations | ✅/❌ |
| 6 | WCAG AA contrast on all text | ✅/❌ |
| 7 | Mobile responsive at 375px | ✅/❌ |
| 8 | Empty states implemented for all lists/feeds | ✅/❌ |
| 9 | Loading states for all async operations >500ms | ✅/❌ |
| 10 | Error states with actionable messages | ✅/❌ |
| 11 | README.md accurate and runnable | ✅/❌ |
| 12 | No secrets in codebase | ✅/❌ |
| 13 | Smoke test passes on staging | ✅/❌ |
| 14 | KPIs trackable with current implementation | ✅/❌ |

---

## Review Report Format

```
VIBE-REVIEW — {scope description}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLES RUN: CEO | CTO | Designer | QA | Security | PM

BLOCKERS (must fix before merge):
  🔴 [Security] Hardcoded API key in config.js:14
  🔴 [QA] No error handling for failed payment API call

WARNINGS (fix before release):
  🟡 [CTO] N+1 query in ProductList component
  🟡 [Designer] Default blue button — not on brand

SUGGESTIONS (improve when time allows):
  🟢 [CEO] Could defer CSV export to v1.1
  🟢 [PM] Add analytics event on checkout completion

VERDICT: {SHIP IT ✅ | FIX BLOCKERS FIRST 🔴 | NEEDS WORK 🟡}
```

If `--pre-merge` and any 🔴 blockers exist: output `MERGE BLOCKED` and stop.
