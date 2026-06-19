# vibe:harness — Production Readiness Gate

Auto-maintenance harness that runs 7 automated checks. This is a MANDATORY gate — cannot proceed without passing.

## When to Run

After `/vibe:build` completes all tasks. Before `/vibe:review`.

Trigger: `node .vibe/lifecycle/auto-maintain.js`

## The 7 Checks

### 1. Catalog YAML Valid
- Verifies `catalog/tools.yaml` is valid YAML
- Counts registered tools
- Uses `js-yaml` for parsing

### 2. Catalog Category Count
- Ensures every category has ≥3 tools
- Reports per-category distribution
- Prevents thin categories

### 3. Handoff Templates Exist
- Checks `docs/handoffs/` for all 8 required templates:
  - AGENTS.md, standard.md, qa-pass.md, qa-fail.md
  - escalation.md, phase-gate.md, sprint.md, incident.md

### 4. Phase Gates Document
- Validates `docs/gates.md` contains all 10 phase transitions
  - think→plan, plan→break, break→build, build→harness
  - harness→review, review→ship, ship→retro
  - retro→learn, learn→evolve, evolve→done

### 5. Test Suite
- Runs `npm test` with 120s timeout
- Passes only if 0 failures
- Reports suite count and test count

### 6. Skill Originality
- Runs `lib/check-originality.js` Jaccard similarity check
- Flags skills exceeding similarity threshold (default 40%)
- Warns on borderline similarity (default 20%)

### 7. Skill Lint
- Runs `lib/lint-skills.js` structural linter
- Checks all 55+ skills for:
  - module.exports presence (error if missing)
  - class/object pattern compliance
  - Minimum file size (warning if <10 lines)
  - this.name and this.description for class-based skills

## Failure Protocol

```
ANY FAIL → Fix the issue → Re-run harness → Loop until all pass
ALL PASS → Write handoff → /clear → Enter review phase
```

## Reference

- `.vibe/lifecycle/auto-maintain.js` — harness implementation
- `lib/check-originality.js` — originality checking engine
- `lib/lint-skills.js` — structural linter
- `.vibe/evolution.json` — harness check configuration
