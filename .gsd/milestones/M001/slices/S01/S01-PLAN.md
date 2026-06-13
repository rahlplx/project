# S01: Tool Registry

Replace hardcoded skill loading with a `ToolRegistry` class.
Tools register themselves with metadata and an `is_usable()` check.

## Must-haves
- `lib/tool-registry.js` — ToolRegistry class with register() and findUsable()
- `bin/skill-loader.js` — refactored to use ToolRegistry
- `bin/vibe-stack.js` — uses registry for tool discovery
- Old behavior preserved: `getSkills()` still works as before
- New behavior: `findUsable('deploy')` returns only installable tools

## Verification
- All 209 tests still pass
- `findUsable('deploy')` returns only tools with available dependencies
- `register()` rejects duplicate names
- `getAll()` returns all registered tools regardless of usability

## Tasks
T01: Create ToolRegistry class
T02: Refactor skill-loader to use registry
T03: Wire registry into vibe-stack.js
