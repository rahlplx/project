# Skills: AGENTS.md

## Purpose

The `skills/` directory contains 45 legacy skill modules organized by category. Each skill is a self-contained Node.js module that an AI agent can load and invoke. These are the building blocks of the vibe-stack system.

## Directory Convention

```
skills/
  <category>/          # e.g., deploy, design, quality, workflow
    <name>/            # kebab-case, e.g., git-free-deploy
      index.js         # Required — exported module
      index.test.js    # Required — Jest tests
      README.md        # Optional — human docs
```

## Skill Anatomy

Each skill exports either:
- A **constructor function** (instantiated with `new`), or
- A **plain object** with methods

```js
// Constructor pattern
class MySkill {
  constructor() {
    this.description = 'Does something useful';
  }
  run(input) { /* ... */ }
}
module.exports = MySkill;

// Object pattern
module.exports = {
  description: 'Does something useful',
  run(input) { /* ... */ },
};
```

## How to Create a New Skill

1. Pick a category (deploy, design, quality, knowledge, etc.)
2. Create `skills/<category>/<name>/index.js`
3. Create `skills/<category>/<name>/index.test.js` with Jest tests
4. Export a class or object with a `description` string property
5. Verify with `npm test`

Example minimal skill:
```js
// skills/deploy/hello-world/index.js
class HelloWorld {
  constructor() {
    this.description = 'Prints hello world';
  }
  greet(name) {
    return `Hello, ${name}!`;
  }
}
module.exports = HelloWorld;
```

## How Skills Are Loaded

- `bin/skill-loader.js` scans `skills/*/*/index.js` and loads each module
- Each loaded skill is registered in the ToolRegistry (`lib/tool-registry.js`)
- `bin/vibe-stack.js` lists and invokes skills via CLI
- `bin/mcp-server.js` exposes skills as MCP tools for AI agent integration

## Cross-References

- `bin/skill-loader.js` for load logic
- `lib/tool-registry.js` for registration
- `references/vibe-*` for skill categories
