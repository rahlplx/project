---
name: vibe-tdd
description: "Test-Driven Development workflow — Red→Green→Refactor cycle for any feature.
  Use when: writing new features, fixing bugs, or any time 'just write the code' is tempting.
  Auto-triggers on 'write tests', 'test this', 'TDD', 'how do I test'. Generates realistic
  test scenarios, tracks cycle state, enforces coverage gate before declaring done.
  Wraps: tdd-vibe, verification-agent, checkpoints, spec-driven skills."
argument-hint: "[feature description] [--fix bug-description] [--coverage] [--lang js|ts|py]"
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash(npm test*)
  - Bash(npx jest*)
  - Bash(python -m pytest*)
  - Bash(npm run test:coverage*)
  - Bash(node skills/workflow/tdd-vibe/index.js*)
  - AskUserQuestion
---

<EXTREMELY-IMPORTANT>
The TDD rule is non-negotiable: WRITE THE TEST FIRST. Every time. No exceptions.
"I'll add tests later" has never happened in the history of software. Red → Green → Refactor.
If you skip Red and go straight to Green, you are not doing TDD — you are doing testing theater.
</EXTREMELY-IMPORTANT>

# Vibe-TDD — Test-Driven Development

## Dispatcher

- No args → start a new TDD cycle (ask for feature description)
- `{feature description}` → start cycle for that feature immediately
- `--fix {bug}` → TDD cycle for a bug fix (Red = failing reproduction test first)
- `--coverage` → run coverage report on existing tests, identify gaps
- `--lang {js|ts|py}` → force language for test generation (auto-detected if omitted)

---

## Step 1 — Red Phase: Write the Failing Test First

Before writing any implementation code, generate test scenarios.

### Scenario Generation

For the given feature description, generate 5–8 test scenarios covering:

| Scenario Type | Description |
|---------------|-------------|
| **Happy path** | The normal, expected use case |
| **Edge case: empty** | Empty input, empty array, null |
| **Edge case: boundary** | Min/max values, zero, negative numbers |
| **Edge case: invalid** | Wrong type, missing required field, malformed input |
| **Edge case: large input** | 1000 items, very long string, deeply nested object |
| **Error case** | What should happen when it fails? |
| **Async case** | If async: timeout, network error, race condition |
| **Permission case** | If auth-gated: unauthorized user, wrong role |

Present scenarios as a numbered list. Ask user to confirm or add/remove before writing tests.

### Test Template (JavaScript/TypeScript)

```js
// {Feature}: {scenario description}
describe('{FeatureName}', () => {
  // Arrange: set up the world
  // Act: do the thing
  // Assert: verify the outcome

  test('happy path: {description}', () => {
    // Arrange
    const input = {realistic test data, NOT 'foo' or 'test'}

    // Act
    const result = {featureFunction}(input)

    // Assert
    expect(result).{matcher}({expected})
  })

  test('edge case: empty input returns {expected behavior}', () => {
    expect({featureFunction}([])).toEqual({expected})
  })

  test('error case: invalid input throws {ErrorType}', () => {
    expect(() => {featureFunction}(null)).toThrow('{ErrorMessage}')
  })
})
```

### Test Template (Python)

```python
import pytest

class Test{FeatureName}:
    def test_happy_path_{description}(self):
        # Arrange
        input_data = {realistic data}
        # Act
        result = {feature_function}(input_data)
        # Assert
        assert result == {expected}

    def test_edge_case_empty_input(self):
        assert {feature_function}([]) == {expected}

    def test_error_case_invalid_input_raises(self):
        with pytest.raises({ErrorType}):
            {feature_function}(None)
```

**Run the tests. They MUST fail.** If tests pass without implementation, the test is wrong — rewrite it.

```bash
# JS: npm test -- --testPathPattern={test-file}
# Python: python -m pytest {test-file} -v
```

Confirm: `All {N} tests failing ✅ (Red phase complete)`

---

## Step 2 — Green Phase: Minimum Code to Pass

Write the **simplest possible implementation** that makes the tests pass.

Rules for Green phase:
- No over-engineering — write exactly what the tests require
- No features the tests don't cover yet
- No premature optimization
- Hardcoding is acceptable temporarily if it makes a test pass (the refactor phase fixes it)
- No new tests yet — focus on passing existing ones

Run tests after each implementation attempt:
```bash
npm test -- --testPathPattern={test-file}
```

Keep iterating until: `All {N} tests passing ✅ (Green phase complete)`

---

## Step 3 — Refactor Phase: Clean It Up

With tests green, improve the code without changing behavior. Tests are the safety net.

Refactor checklist:
- [ ] No duplicated logic (DRY — but don't over-abstract)
- [ ] Function does one thing (single responsibility)
- [ ] Names describe intent (`getUserById` not `get`, `calculateTax` not `calc`)
- [ ] No magic numbers (extract to named constants)
- [ ] No nested conditionals deeper than 2 levels (extract to early returns or helper)
- [ ] No comments explaining WHAT — only WHY (if a comment explains what the code does, rename the variable instead)

Run tests after each refactor step — they must stay green.

```bash
npm test -- --testPathPattern={test-file}
```

Confirm: `All {N} tests still passing ✅ (Refactor phase complete)`

---

## Step 4 — Coverage Gate

After the cycle completes, run coverage:

```bash
npm run test:coverage -- --testPathPattern={test-file}
# OR
npx jest --coverage --testPathPattern={test-file}
```

Coverage requirements:
- Business logic: ≥80% line coverage
- Utility functions: ≥90% line coverage
- UI components: ≥60% (UI is harder to unit test — supplement with E2E)

If coverage is below threshold: identify uncovered lines and add missing test scenarios. Run another mini-cycle (Red→Green for the gap).

---

## Cycle Summary Format

```
TDD CYCLE — {feature name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 RED    {N} tests written | All failing ✅
🟢 GREEN  {N} tests passing | Implementation: {N} lines
🔵 REFACTOR Changes: {what was cleaned up}
📊 COVERAGE {N}% lines | {N}% branches | {gate: PASS/FAIL}

NEXT: {what feature to TDD next, or "done"}
```

---

## Bug Fix Mode (`--fix`)

For bug fixes, TDD means: **reproduce the bug as a failing test first**.

1. Write a test that demonstrates the bug (it should fail)
2. Confirm the test fails with the same error as the bug report
3. Fix the bug (minimum change)
4. Confirm the test passes
5. Confirm no other tests regressed

```bash
npm test  # Full suite — must be green before and after the fix
```

Never fix a bug without a regression test. The test IS the proof the bug is gone.
