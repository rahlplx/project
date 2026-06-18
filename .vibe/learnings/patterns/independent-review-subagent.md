# Independent Review Subagent

## Pattern

Before shipping, invoke a separate agent exclusively dedicated to code review
with fresh context. The implementing agent is blind to its own oversights.

## When to Use

- Before every SHIP gate
- After all tests pass and before commit+push

## Why It Works

- Fresh context catches assumptions the implementer accepted
- Independent agent has no sunk-cost bias toward the code
- Can see structural issues (redundancy, convention violations, missing
  coverage) that the builder normalized

## Verified

- 4 issues found across 3-slice build that would have shipped:
  1. Missing node:test files in harness runner (bug)
  2. execSync(string) instead of execFileSync (convention)
  3. Redundant duplicate harness check (design)
  4. Stale cross-reference count in docs (accuracy)

## Anti-Pattern to Avoid

- Review by same agent that wrote the code (confirmation bias)
- Review that re-runs tests only (misses structural/convention issues)
