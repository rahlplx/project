# Break: Design Doc Implementation — Milestone → Slice → Task Decomposition

## Milestone M001: Enhancement MVP

Delivers 3 priorities: AGENTS.md docs + Tool Registry + CI Gates.

**Risk**: Low — no external dependencies, all self-contained changes.
**Dependencies**: None.

---

## Dependency Graph

```
M001-S01 (AGENTS.md) ──→ no deps, parallel-safe
M001-S02 (Tool Registry) ──→ no deps, parallel-safe with S01
M001-S03 (CI Gates) ──→ no deps, parallel-safe with S01/S02
```

All 3 slices are independent. Can build in any order. Recommend: S01 → S02 → S03 (easiest → hardest).

---

## Slice S01: AGENTS.md Per Section

**Must-haves**: 4 AGENTS.md files created, each with required sections.

### Tasks

**T01-RED**: Write test that verifies all 4 AGENTS.md files exist with required sections.

- Files: `lib/agents-md.test.js`
- Must-haves: test file with 4 `fs.existsSync` checks + content regex checks
- Verify: test fails (files don't exist yet)

**T01-GREEN**: Create 4 AGENTS.md files.

- Files: `catalog/AGENTS.md`, `skills/AGENTS.md`, `references/AGENTS.md`, `.vibe/AGENTS.md` (check existing)
- catalog/AGENTS.md: how to add/find tools, YAML format, category rules, verification steps
- skills/AGENTS.md: skill structure (index.js + SKILL.md), naming conventions, test requirements
- references/AGENTS.md: file map, how phase guides work
- .vibe/AGENTS.md: already exists — verify content covers purpose, file index, lifecycle
- Must-haves: each file has purpose statement, section map, and cross-reference to related docs
- Verify: test passes

**T01-REFACTOR**: Review content for consistency. Ensure cross-references are accurate.

**T01-VERIFY**: `npm test` — all pass.

---

## Slice S02: Tool Registry

**Must-haves**: ToolRegistry class, skill-loader refactored to use it, all existing behavior preserved.

### Tasks

**T02-RED**: Write tests for ToolRegistry.

- Files: `lib/tool-registry.test.js`
- Tests:
  - `register(name, { isUsable })` stores entry
  - `findUsable('deploy')` returns only tools where isUsable is true
  - `findAll()` returns all registered
  - `getUnusable('deploy')` returns unusable tools with reason
  - `register` with same name overwrites (last wins)
  - isUsable throws → tool treated as unusable
- Verify: tests fail (class doesn't exist)

**T02-GREEN**: Implement ToolRegistry class.

- Files: `lib/tool-registry.js`
- API:
  ```js
  class ToolRegistry {
    register(name, { isUsable, category, metadata }) {}
    findUsable(category) {} // returns [{ name, metadata }]
    findAll() {} // returns [{ name, category, metadata }]
    getUnusable(category) {} // returns [{ name, reason, metadata }]
  }
  ```
- Must-haves: class works, tests pass, all edge cases covered
- Verify: `npm test` — new tests pass, all old tests pass

**T02-GREEN (refactor)**: Update bin/skill-loader.js to use ToolRegistry.

- Files: `bin/skill-loader.js`
- Change: import ToolRegistry, register each skill with isUsable check, export registry
- Must-haves: skill-loader still loads all 50 skills, registry populated
- Verify: `npm test` — all pass

**T02-REFACTOR**: Clean up any duplicated loading logic. Ensure registry is the single source of truth.

- Files: `bin/skill-loader.js`, `lib/tool-registry.js`

**T02-VERIFY**: `npm test` — all pass.

---

## Slice S03: CI Quality Gates

**Must-haves**: ESLint config, pre-commit hook, harness checks include lint + validate.

### Tasks

**T03-RED**: Write test for ESLint config validity.

- Files: `lib/lint-config.test.js`
- Must-haves: test that `.eslintrc.js` parses correctly, rules are valid keys
- Verify: test fails (config doesn't exist yet)

**T03-GREEN**: Create ESLint config and pre-commit hook.

- Files: `.eslintrc.js`, `.husky/pre-commit`
- ESLint rules (8-10): no-unused-vars, semi, quotes, no-console, eqeqeq, curly, no-var, prefer-const
- Pre-commit: run `npx eslint lib/ bin/ --no-eslintrc -c .eslintrc.js` + `node -e "require('js-yaml').load(require('fs').readFileSync('catalog/tools.yaml','utf8'))"`
- Must-haves: both files exist, ESLint config parses
- Verify: `npx eslint --no-eslintrc -c .eslintrc.js --print-config lib/tool-registry.js` works

**T03-GREEN (harness update)**: Add lint + validate gates to auto-maintain.js.

- Files: `.vibe/lifecycle/auto-maintain.js`
- New check: `eslint-lint-pass` — runs eslint, passes if 0 errors
- New check: `yaml-valid` — runs js-yaml.load on tools.yaml
- Must-haves: harness returns results for both new checks
- Verify: `npm test` — auto-maintain tests pass

**T03-REFACTOR**: Ensure pre-commit hook is executable. Add .husky/ to tracked files.

**T03-VERIFY**: `npm test` — all pass. Run `node --test lib/lint-config.test.js` (if node:test format).

---

## Effort Estimate

| Slice              | Tasks       | Est. Time  | Files Changed | Risk                         |
| ------------------ | ----------- | ---------- | ------------- | ---------------------------- |
| S01: AGENTS.md     | 4 sub-tasks | 5 min      | 4             | None                         |
| S02: Tool Registry | 5 sub-tasks | 15 min     | 3             | Low — new code, isolated     |
| S03: CI Gates      | 6 sub-tasks | 10 min     | 4             | Low — infra, no logic change |
| **Total**          | **15**      | **30 min** | **11**        | **Low**                      |
