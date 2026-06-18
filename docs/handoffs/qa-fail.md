# QA Verdict: FAIL

Use when QA rejects a task.

## Task

| Field | Value |
|-------|-------|
| **Task** | [Task description] |
| **From** | [Agent Name] |
| **QA Agent** | [Agent Name] |
| **Attempt** | [N] of 3 |
| **Timestamp** | [YYYY-MM-DDTHH:MM:SSZ] |

## Verdict: FAIL

## Issues Found

### Issue 1: [Category] -- [Severity: Critical/High/Medium/Low]
**Description**: [Exact description of the problem]
**Expected**: [What should happen according to acceptance criteria]
**Actual**: [What actually happens]
**Evidence**: [Screenshot filename or test output]
**Fix instruction**: [Specific, actionable instruction to resolve]
**File(s) to modify**: [Exact file paths]

### Issue 2: [Category] -- [Severity]
**Description**: [Exact description of the problem]
**Expected**: [What should happen]
**Actual**: [What actually happens]
**Evidence**: [Screenshot or test output]
**Fix instruction**: [Specific, actionable instruction]
**File(s) to modify**: [Exact file paths]

[Continue for all issues found]

## Acceptance Criteria Status

- [x] [Criterion 1] -- passed
- [ ] [Criterion 2] -- FAILED (see Issue 1)
- [ ] [Criterion 3] -- FAILED (see Issue 2)

## Retry Instructions

**For Developer Agent**:
1. Fix ONLY the issues listed above
2. Do NOT introduce new features or changes
3. Re-submit for QA when all issues are addressed
4. This is attempt [N] of 3 maximum

**If attempt 3 fails**: Task will be escalated.
