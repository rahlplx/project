# Project: AI-Native SDLC Adoption

## Summary
Adopted the 5-phase AI-Native SDLC (Brief→Align→Plan→Verify→Ship) mapped to vibenexus's SCOPE→BUILD→VERIFY→SHIP→EVOLVE state machine. Integrated gstack (strategy/QA), GSD (context), Superpowers (TDD/execution) into unified workflow.

## What Worked
1. **MCP SDK compliance** - `@modelcontextprotocol/sdk` v1.29.0 provides CJS-compatible `require` paths. Zero ESM friction.
2. **Schema auto-generation** - `fn.toString()` parsing + JSDoc extraction produces strict JSON Schema for all 250 tool methods across 50 skills.
3. **Token hygiene** - ANSI stripping + 4000-token truncation with summary prevents context window overflow.
4. **Structured errors** - `isError: true` responses let agents self-correct instead of crashing on raw stack traces.
5. **Performance layer** - TTLCache (5min), BatchProcessor (configurable concurrency), SkillCache eliminate redundant skill loading.

## What Didn't
1. **ESLint config merge** - Merging `.eslintrc.json` + `.eslintrc.js` required `--fix` and manual fixes for 2 errors (empty block, regex escape). Prefer single config from start.
2. **Index.json format mismatch** - `buildIndex` returns skill names without category prefix, but index.json had category prefixes. Required format alignment.
3. **ESLint cache** - Cached lint results masked fixes. Use `--no-cache` or clear `.eslintcache` during config changes.
4. **Dead deps** - chalk/ora accumulated silently. Need automated audit.

## Key Decisions
- **MCP SDK over hand-rolled JSON-RPC** - Eliminates 50 lines of boilerplate, adds streaming/ping/error handling
- **Named param schemas over `_args`** - Agents no longer guess parameter order
- **Fail-fast on missing deps** - inquirer catch now throws descriptive error instead of silent null
- **Duplicate dir removal** - `skills/deployment/` (railway) was exact duplicate of `skills/deploy/`, zero imports
- **Unified ESLint config** - Single `.eslintrc.js` replaces `.eslintrc.json` + `.eslintrc.js`

## Files Created/Modified
| File | Action |
|------|--------|
| lib/schema-generator.js | Created (+test) |
| lib/token-optimizer.js | Created (+test) |
| lib/performance-optimizer.js | Created (+test) |
| lib/mcp-adapter.js | Created (+test) |
| bin/mcp-server.js | Rewritten (thin bootstrap) |
| bin/skill-loader.js | Augmented discoverTools |
| .eslintrc.js | Unified config |
| package.json | Removed chalk/ora, added @modelcontextprotocol/sdk |
| .well-known/agent-skills/index.json | Regenerated (49 skills) |

## Metrics
- Tests: 77 Jest suites (762 tests) + 11 node:test suites (63 tests) = 825 total passing
- Harness: 12/12 checks passing
- Lint: 0 errors, 187 warnings
- Dead deps removed: 2 (chalk, ora) + 15 transitive packages
- Duplicate skills removed: 1 (deployment/railway)

## Next Steps
1. Add dead-dep-audit to harness
2. Promote proposed rules: `independent-verify-agent`, `workflow-5-phase-gate`
3. Update evolution.json with new rule scores
4. Rebuild INDEX.md cross-references

## Tested On
vibenexus, 2026-06-14