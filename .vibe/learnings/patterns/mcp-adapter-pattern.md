# Pattern: MCP Adapter with Schema Generation

## Problem
AI agents need structured tool interfaces with proper JSON Schema for parameter validation. Hand-rolled MCP servers use opaque `_args` arrays that force agents to guess parameter names and types.

## Solution
Build an MCP adapter using `@modelcontextprotocol/sdk` that:
1. Auto-generates JSON Schema from method signatures using `fn.toString()` parsing
2. Extracts JSDoc `@param` tags for richer descriptions
3. Provides named parameter schemas with `required` arrays
4. Returns structured errors with `isError: true` flag
5. Implements token budget enforcement with truncation summaries

## Implementation
- `lib/schema-generator.js` - Parses function signatures, extracts params, defaults, infers types from names/JSDoc
- `lib/mcp-adapter.js` - Wraps MCP SDK Server, registers listTools/callTool handlers with generated schemas
- `lib/token-optimizer.js` - Strips ANSI, estimates tokens, truncates at 4000 with summary, sanitizes errors

## Key Insights
- `fn.toString()` + regex parsing works for all 50 skills without modification
- JSDoc coverage is sparse (~10%) so name-based type inference is critical fallback
- Destructured params `{ options }` map to `type: 'object'` with name `options`
- Rest params `...args` become `type: 'array'` and are required
- Schema generation is fast (<5ms for 250 tools) - no caching needed for listTools

## When to Use
- Building MCP servers for AI agent tool exposure
- Any scenario requiring automatic JSON Schema from existing code
- Token-constrained agent contexts needing output hygiene

## Files Changed
- lib/schema-generator.js + test
- lib/mcp-adapter.js + test
- lib/token-optimizer.js + test
- bin/mcp-server.js (rewrite)
- bin/skill-loader.js (augment discoverTools)

## Tested On
vibenexus, 2026-06-14