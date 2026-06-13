# Pattern: Test for Every Skill

## Problem
Skills without tests accumulate silently. In a 45-skill repo, 27% (12 skills) had zero tests. Untested skills are a reliability risk — regressions go undetected.

## Solution
Every skill MUST have a corresponding `index.test.js` with at minimum:
1. **Constructor/instance test** — verifies `this.name` matches the directory name (or `this.version` for skills without `this.name`)
2. **One key method test** — verifies the primary method with known input/output
3. **Edge case test** — empty input, null/undefined handling, or error state

## Test Template
```js
const Skill = require('./index');

describe('Skill', () => {
  it('should create instance', () => {
    const s = new Skill();
    expect(s.name).toBe('skill-name');
  });

  it('should [primary behavior]', () => {
    const s = new Skill();
    const r = s.primaryMethod('test input');
    expect(r.success).toBe(true);
  });

  it('should handle empty input', () => {
    const s = new Skill();
    const r = s.primaryMethod('');
    expect(r.success).toBe(false);
  });
});
```

## When to Use
- Creating a new skill
- Auditing existing skills for test gaps
- CI/CD pipeline check (fail if any skill lacks a test file)

## Anti-Patterns to Avoid
- Testing only the constructor — tests the file loads but nothing else
- Testing async methods that depend on unavailable packages (puppeteer, sharp, canvas) — test synchronous methods instead
- Adding tests that always pass regardless of implementation — they provide no regression protection

## Files Changed
- 12 new test files across all skill categories
- 168 new assertions

## Tested On
Vibe-Stack Curated Collection, 2026-06-14
