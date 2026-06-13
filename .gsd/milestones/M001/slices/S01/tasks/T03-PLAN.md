# T03: Wire registry into vibe-stack.js

## Plan
Update `bin/vibe-stack.js` to use ToolRegistry for tool discovery.
Replace hardcoded tool lists with `findUsable(category)` calls.

## Files
- `bin/vibe-stack.js` — updated

## Must-haves
- `vibe-stack.js` discovers tools via ToolRegistry
- Existing CLI behavior unchanged
- `--list` flag shows only usable tools
- `--list-all` flag shows all registered tools (including unusable)

## Verify
- `node bin/vibe-stack.js --list` runs without errors
- `node bin/vibe-stack.js --list deploy` shows deploy tools
- `npm test` still passes
