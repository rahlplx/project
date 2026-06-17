# Visual Plans Skill

Generate UI mockups and visual plans from natural language descriptions.

## Overview

The Visual Plans skill transforms plain English descriptions into structured UI component plans, mockup code, and ASCII visualizations. Perfect for quickly prototyping interfaces before writing actual code.

## Installation

```javascript
const VisualPlansSkill = require('./skills/preview/visual-plans');
const skill = new VisualPlansSkill({ style: 'modern' });
```

## Usage

### Basic Example

```javascript
const plan = skill.generatePlan(
  'A login form with username and password inputs, a primary submit button, and a header saying "Welcome Back"'
);

console.log(plan.mockup);
// Generates React-like JSX code
// Generates component structure
// Generates styling guide
```

### Advanced Configuration

```javascript
const skill = new VisualPlansSkill({
  colorScheme: 'dark', // 'light', 'dark', or 'modern'
  style: 'brutalist', // 'minimal', 'modern', or 'brutalist'
});
```

## Features

### Component Detection

The skill automatically identifies UI components from descriptions:

| Component  | Keywords                 |
| ---------- | ------------------------ |
| Button     | button, btn              |
| Input      | input, text field, field |
| Header     | header, heading, title   |
| Navigation | nav, navigation, menu    |
| Card       | card, panel, container   |
| Image      | image, img, photo        |
| List       | list, items              |
| Form       | form                     |
| Footer     | footer                   |
| Modal      | modal, dialog, popup     |

### Layout Detection

Automatically determines appropriate layout structures:

- **sidebar-layout**: Detected when both sidebar and navigation present
- **app-layout**: Detected when header and navigation present
- **single-page**: Default layout for simple pages

### Output Structure

The generated plan includes:

```javascript
{
  type: 'visual-plan',
  timestamp: '2024-01-15T10:30:00.000Z',
  layout: 'app-layout',
  components: [
    { type: 'header', label: 'Welcome Back', position: 'top', styles: {} },
    { type: 'input', label: 'username', position: 'auto', styles: {} }
  ],
  mockup: '// Generated React code...',
  styling: { fontFamily: 'Inter', spacing: '16px', ... }
}
```

### ASCII Mockup Generation

```javascript
const ascii = skill.generateAsciiMockup(components);
console.log(ascii);
// ┌─────────────────────────────────────┐
// │           UI Mockup                 │
// ├─────────────────────────────────────┤
// │ [HEADER] Welcome Back               │
// │ [INPUT] username                   │
// └─────────────────────────────────────┘
```

## Examples

### E-commerce Product Card

```javascript
const plan = skill.generatePlan(
  'A product card with image, title, price, and a rounded primary "Add to Cart" button at the bottom'
);
```

### Dashboard Layout

```javascript
const plan = skill.generatePlan(
  'A dashboard with sidebar navigation on the left, a header at top with user profile, and main content area with cards showing statistics'
);
```

### Login Page

```javascript
const plan = skill.generatePlan(
  'A centered login form with logo at top, email and password inputs, a large primary "Sign In" button, and a footer with "Forgot Password?" link'
);
```

## Styling Guides

### Minimal Style

Clean, minimal design with:

- System fonts
- 8px base spacing
- 4px border radius
- No shadows

### Modern Style

Contemporary design with:

- SF Pro / Inter fonts
- 16px base spacing
- 12px border radius
- Subtle shadows

### Brutalist Style

Bold, stark design with:

- Monospace fonts
- 4px base spacing
- No border radius
- Hard offset shadows

## Integration

Use with other preview skills for complete visualization:

```javascript
const VisualPlans = require('./visual-plans');
const FlowchartGen = require('./flowchart-gen');
const DiffPreview = require('./diff-preview');

// Generate visual plan
const plan = new VisualPlans().generatePlan(description);

// Generate architecture diagram
const diagram = new FlowchartGen().generateFlowchart(codeStructure);

// Preview changes
const diff = new DiffPreview().generateDiff(oldCode, newCode);
```

## License

MIT
