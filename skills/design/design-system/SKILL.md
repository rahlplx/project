# Design System

A skill for managing and applying design tokens and themed components.

## When to use

- When creating a consistent visual language for a project.
- To apply color palettes, typography, and shapes across multiple screens.

## Methods

- `create(config)` - Define a new design system from tokens.
- `apply(assetId, project)` - Apply a design system to a set of project screens.
- `update(assetId, config)` - Modify an existing design system.

## Output

- A standardized JSON design system asset.
- Updated UI screen definitions with consistent styling.

## Example

\`\`\`js
const ds = require('./skills/design/design-system');
await ds.apply('assets/123', 'my-project');
\`\`\`
