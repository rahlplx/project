# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Commands

```bash
# Run the interactive project wizard
npm run wizard

# Run the quick-start scaffolding tool
npm start

# Run all tests
npm test

# Run a single test file
npx jest skills/design/anti-slop/index.test.js

# Lint
npm run lint

# Format
npm run format
```

## Architecture

**Vibe-Stack** is a collection of reusable AI agent skills for Node.js (≥18). Each skill lives in `skills/<category>/<skill-name>/index.js` and operates as a standalone module — no cross-skill imports.

### Skill structure

Every skill follows the same pattern:

- **Class-based**: One exported class per skill with a configuration object in the constructor.
- **Generation methods**: Named after what they produce — `generate*()`, `analyze()`, `toCSS()`, `toJSON()`, `toMermaid()`, `toHTML()`.
- **Multi-format output**: Each skill returns a structured object with multiple export formats (e.g., `.visual`, `.summary`, `.stats`) rather than a single string.
- **Structured metadata**: Return objects include `timestamp`, `type`, and relevant `stats`.

### Categories (current implementation)

| Category | Skills | Purpose |
|----------|--------|---------|
| `setup/` | `project-wizard`, `quick-start`, `prompt-templates` | Project initialization and scaffolding |
| `preview/` | `visual-plans`, `diff-preview`, `flowchart-gen`, `screenshot-preview` | Visualization and code diffs |
| `design/` | `anti-slop`, `color-gen`, `design-system`, `theme-factory`, `typography-rules` | Design quality enforcement |

### Key design constraints

- **`anti-slop`** enforces 41 deterministic rules (no ML). Rules are hardcoded in the class — not configurable at runtime.
- **`color-gen`** and **`design-system`** enforce WCAG contrast ratios; accessibility is a first-class concern throughout the design category.
- **`flowchart-gen`** uses AST parsing to produce diagrams in 6 formats (Mermaid, ASCII, SVG, React Flow, etc.).
- **`diff-preview`** implements LCS-based diffing internally — no external diff library.

### Adding a new skill

1. Create `skills/<category>/<skill-name>/index.js` with a default-exported class.
2. Add a `README.md` alongside it documenting the API (methods, parameters, return shape).
3. No registration or index file needs updating — skills are self-contained.
