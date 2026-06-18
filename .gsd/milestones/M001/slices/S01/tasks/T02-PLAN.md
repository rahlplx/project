# T02: Refactor skill-loader.js to use ToolRegistry

## Plan
Rewrite `bin/skill-loader.js` to import and use ToolRegistry.
Each skill directory registers itself on import.
The loader's `getSkills()` method delegates to `ToolRegistry.getAll()`.

## Files
- `bin/skill-loader.js` — refactored
- `bin/skill-loader.test.js` — updated if needed

## Must-haves
- All skills auto-register when loaded
- `getSkills()` returns same shape as before (backward compat)
- `getUsableSkills(category)` is new — returns only usable tools
- Old callers of `getSkills()` continue to work unchanged

## Verify
- `node bin/skill-loader.test.js` or `npm test` — 209 tests pass
- `getSkills()` returns 45 skills (unchanged)
- `getUsableSkills('deploy')` returns only deploy skills
