# T07 Plan — Write ToolRegistry Tests

## Objective
Create comprehensive tests for ToolRegistry in `lib/tool-registry.test.js`.

## Files to Create
- `lib/tool-registry.test.js`

## Test Coverage

### Unit Tests
1. **register** — adds tool to registry
2. **register** — validates required fields (name, category, isUsable)
3. **register** — duplicate name overwrites (last wins)
4. **findAll** — returns all tools in category
5. **findAll** — returns empty array for unknown category
6. **findUsable** — returns only tools where isUsable() = true
7. **findUsable** — filters out tools where isUsable() = false
8. **findUsable** — handles isUsable() throwing (returns false)
9. **findUsable** — 3s timeout on slow isUsable()
9. **getUnusable** — returns tools with isUsable() = false + reasons
10. **getUnusable** — includes reason string from error/timeout

### Integration Tests
11. **Real isUsable: git** — `git --version` returns true
12. **Real isUsable: missing CLI** — non-existent command returns false

## Test Structure
```javascript
const { ToolRegistry } = require('./tool-registry.js');

describe('ToolRegistry', () => {
  let registry;
  
  beforeEach(() => {
    registry = new ToolRegistry();
  });
  
  // Unit tests...
  
  describe('integration', () => {
    test('git isUsable returns true', async () => {
      registry.register('git-test', {
        category: 'test',
        isUsable: () => checkCommand('git --version')
      });
      const usable = await registry.findUsable('test');
      expect(usable.length).toBe(1);
    });
    
    test('missing CLI isUsable returns false', async () => {
      registry.register('missing-cli', {
        -cli', {
        category: 'test',
        isUsable: () => checkCommand('nonexistent-cli --version')
      });
      const usable = await registry.findUsable('test');
      expect(usable.length).toBe(0);
    });
  });
});
```

## Verification
- File exists at `lib/tool-registry.test.js`
- All tests pass with `npm test`
- Coverage meets project thresholds