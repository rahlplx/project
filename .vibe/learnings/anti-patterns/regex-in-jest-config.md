# Anti-Pattern: Unescaped Dot in Jest Ignore Patterns

## Symptom
Test files not discovered by Jest despite matching all expected criteria:
- Correct `*.test.js` naming
- Not in `node_modules`, `.vibe`, or `.gsd`
- Valid Jest test content
- Discovered by glob module but not by Jest's internal crawler

## Root Cause
Jest's `testPathIgnorePatterns` and `modulePathIgnorePatterns` use **regex patterns**, not glob patterns. The pattern `.vibe` means "any character followed by `vibe`" — not "the literal string `.vibe`".

This causes paths like `skills/quality/vibe-review/index.test.js` and `skills/workflow/tdd-vibe/index.test.js` to match the pattern, silently excluding them from test discovery.

## How vibe-stack Should Catch It
- Harness check: `npx jest --listTests | wc -l` should match `glob.sync('**/*.test.js', { ignore: ['node_modules/**'] }).length`
- If counts differ, one or more test files are being silently excluded

## Fix
```json
// Before — matches ANY path containing "vibe"
"testPathIgnorePatterns": [".vibe"]

// After — matches only paths starting with ".vibe"
"testPathIgnorePatterns": ["\\.vibe"]
```

## Incident
Vibe-Stack Curated Collection, 2026-06-14. Two test files (10 tests) invisible for the entire lifecycle of the project.
