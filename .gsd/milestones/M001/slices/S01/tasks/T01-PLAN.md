# T01: Create ToolRegistry class

## Plan
Create `lib/tool-registry.js` with a `ToolRegistry` class that provides:
- `register(name, entry)` — register a tool with metadata and factory
- `findUsable(category)` — return only tools whose is_usable() returns true
- `getAll()` — return all registered tools regardless of usability
- `getCategories()` — return distinct category names

Entry structure:
```js
{
  name: 'git-free-deploy',
  category: 'deploy',
  description: '...',
  isUsable: () => true/false,
  factory: () => import or create instance,
  metadata: { stars, license, ... }
}
```

## Files
- `lib/tool-registry.js` — new file
- `lib/tool-registry.test.js` — new test file

## Must-haves
- register() stores entry, throws on duplicate name
- findUsable('deploy') filters by category + is_usable()
- getAll() returns all entries
- getCategories() returns unique sorted categories
- All exported as ESM module

## Verify
- `node lib/tool-registry.test.js` passes
- `npm test` still passes (209 tests)
