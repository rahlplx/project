# Skills: AGENTS.md

## Purpose

The `skills/` directory contains 50 agent skill modules organized by category. Each skill is a pair of files: an `index.js` with prompt instructions and a `SKILL.md` with documentation.

## Structure

Each skill directory follows this convention:

```
skills/<category>/<skill-name>/
├── index.js       — Agent prompt instructions (required)
└── SKILL.md       — Skill documentation (required)
```

### index.js

- Exports a `prompt` string that the agent injects into its system prompt
- May export `config` with metadata (name, description, version)
- Must use CommonJS (`module.exports`)

### SKILL.md

- Describes what the skill does, when to use it, and how it works
- Includes examples and cross-references

## Naming Conventions

- Directory names: kebab-case
- Category directories: single word (design, deploy, quality, etc.)
- Test files: `*.test.js` alongside the skill or in `lib/`

## Test Requirements

Every skill must have a corresponding test file. Tests use either:

- `node:test` — `const { describe, it } = require('node:test')`
- Jest — global `describe`/`test`/`expect`

## Adding a New Skill

1. Create `skills/<category>/<skill-name>/`
2. Write `index.js` with prompt + config
3. Write `SKILL.md` with documentation
4. Write `*.test.js` covering the skill's prompt output
5. Run `npm test` to confirm all tests pass

## Cross-Reference

- `.well-known/agent-skills/index.json` — all 50 skills indexed with SHA-256 digests
- `lib/skill-files.js` — skill file discovery utility
- `lib/check-originality.js` — Jaccard similarity check
- `lib/lint-skills.js` — structural lint for skill files
- `SKILL.md` — agent entry point
