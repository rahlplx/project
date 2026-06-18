# T05 Plan — Implement ToolRegistry Class

## Objective
Create `lib/tool-registry.js` with a ToolRegistry class that manages tool registration and filtering.

## Files to Create
- `lib/tool-registry.js`

## API Specification

```javascript
class ToolRegistry {
  constructor() {
    this.tools = new Map(); // name -> { name, category, isUsable, metadata }
  }

  // Register a tool with isUsable check
  register(name, { category, isUsable, metadata = {} }) {
    // Validate required fields
    // Store in Map (last registered wins)
  }

  // Find tools in category where isUsable() === true
  async findUsable(category) {
    // Filter tools by category
    // Run isUsable() with 3s timeout via Promise.race
    // Return array of { name, metadata }
  }

  // Find all tools in category (regardless of isUsable)
  findAll(category) {
    // Return all tools in category
  }

  // Find unusable tools with reasons
  async getUnusable(category) {
    // Run isUsable() with 3s timeout
    // Return array of { name, reason, metadata }
  }
}

module.exports = { ToolRegistry };
```

## Key Implementation Details

### isUsable() Timeout (3s)
```javascript
async function runWithTimeout(fn, timeout = 3000) {
  return Promise.race([
    fn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('isUsable timeout')), timeout)
    )
  ]).catch(() => false);
}
```

### Registration Validation
- `name`: required, string
- `category`: required, string
- `isUsable`: required, function returning Promise<boolean> or boolean
- `metadata`: optional, object

## Verification
- File exists at `lib/tool-registry.js`
- Exports ToolRegistry class
- All methods implemented per spec
- Handles edge cases (no tools, duplicate names, isUsable throws)