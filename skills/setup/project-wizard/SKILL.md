# Project Wizard

An interactive tool that guides users through creating a comprehensive project specification.

## When to use
- At the start of a new project to capture requirements.
- When you need to generate a `PROJECT.md` foundation for other skills.

## Methods
- `main()` - Starts the interactive CLI session.
- `generateProjectSpec(answers)` - Programmatically generates the Markdown content.

## Output
- A `PROJECT.md` file in the current directory.
- Structured sections for Overview, Tech Stack, Features, Design, and Deployment.

## Example
```js
const wizard = require('./skills/setup/project-wizard');
const spec = await wizard.generateProjectSpec({
  projectName: 'Vibe App',
  projectType: 'saas',
  features: ['auth', 'database']
});
```
