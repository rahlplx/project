# vibe:qa — Real Browser QA Testing

Finds UI bugs by clicking through the application with Playwright in a real Chromium browser.

## When to Run

After `/vibe:review` passes. Only if `stack.has_ui` is true.

## Steps

### 1. Setup
- Ensure Playwright is installed (`npx playwright install chromium`)
- Start dev server
- Configure test environment

### 2. Critical Path Testing
- Smoke test: main user flows work end-to-end
- Navigation: all routes render without errors
- Forms: submit with valid/invalid data, error states visible
- Auth: login, logout, protected routes, session expiry

### 3. Edge Case Testing
- Empty states
- Loading states
- Error states
- Maximum data (long lists, large files)
- Rapid interactions (double clicks, fast typing)

### 4. Visual Regression
- Compare against approved design screenshots
- Check responsive breakpoints (mobile, tablet, desktop)

### 5. Bug Tracking
- Each bug documented with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshot
  - Severity
- All critical bugs must be fixed before proceeding

### 6. Regression
- Re-run all passing tests
- Confirm fixes don't break existing behavior

## Reference
- gstack `/qa` with real Chromium
- Playwright test runner
- `skills/quality/testing-guide` — test patterns and conventions
