# skills/AGENTS.md

## Purpose
Skills are reusable AI agent capabilities. Each skill encapsulates a specific workflow (deploy, design, review, orchestrate, etc.).

## Structure
```
skills/
├── AGENTS.md           # This file
├── <category>/
│   ├── <skill-name>/
│   │   ├── index.js    # Main skill implementation
│   │   ├── index.test.js # Tests
│   │   ├── SKILL.md    # Skill manifest for agents
│   │   └── README.md   # Optional human docs
```

## Conventions
- Each skill in its own directory under category
- `index.js` exports: `name`, `description`, `category`, `methods` (sync + async)
- `SKILL.md` has: `name`, `description`, `category`, `tools`, `triggers`, `examples`
- Test file required: `index.test.js` (TDD — test first)
- Skill names: kebab-case, category prefix optional
- Methods return Promises for async, values for sync

## Cross-References
- `SKILL.md` → Entry point, delegates to this file
- `catalog/AGENTS.md` → Tools available to skills
- `references/AGENTS.md` → Reference doc patterns
- `plans/plan-catalog-expansion.md` → Adding skills to catalog