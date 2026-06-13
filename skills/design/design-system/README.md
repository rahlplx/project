# Design System Skill

Industry-grade design rules for creating consistent, accessible, and professional user interfaces. Provides comprehensive spacing, colors, typography, components, and utility functions.

## Overview

This design system skill implements a systematic approach to design using:
- **Design tokens**: Immutable values that design decisions are based on
- **Semantic naming**: Intention-revealing names over implementation details
- **Scale-based systems**: Consistent relationships between values
- **Component generators**: Pre-styled components following design principles

## Installation

```javascript
const DesignSystem = require('./skills/design/design-system');
const designSystem = new DesignSystem();
```

### Custom Configuration

```javascript
const designSystem = new DesignSystem({
  colors: {
    primary: {
      500: '#6366f1',  // Custom primary color
      600: '#4f46e5',
      700: '#4338ca'
    }
  },
  typography: {
    fonts: {
      sans: {
        family: '"Inter", system-ui, sans-serif'
      }
    }
  }
});
```

## Core Concepts

### Design Tokens

Design tokens are the atomic values that make up your design system:

```javascript
// Access spacing
designSystem.spacing('md');        // 16
designSystem.spacing(24);          // 24 (raw value)

// Access colors
designSystem.color('primary');              // { 50: '#eff6ff', ... }
designSystem.color('primary', 600);        // '#2563eb'
designSystem.color('semantic', 'success'); // { light: '#dcfce7', ... }

// Access typography
designSystem.typography('h1');   // { fontSize: '36px', lineHeight: 1.2 }
designSystem.typography('body');  // { fontSize: '16px', lineHeight: 1.6 }

// Access border radius
designSystem.radius('card');   // 12
designSystem.radius('lg');     // 12

// Access shadows
designSystem.shadow('md');     // '0 4px 6px -1px rgb(0 0 0 / 0.1)...'
```

### CSS Variable Generation

```javascript
// Generate all CSS variables
const cssVars = designSystem.generateAllVariables();
// {
//   '--space-xs': '4px',
//   '--space-md': '16px',
//   '--color-primary-500': '#3b82f6',
//   ...
// }

// Export as CSS string
const css = designSystem.toCSS();
/* :root {
  --space-xs: 4px;
  ...
} */

// Export as CSS-in-JS object
const cssinjs = designSystem.toCSSinJS();

// Export as Tailwind config
const tailwind = designSystem.toTailwindConfig();
```

## Spacing System

The spacing system uses a base-4 scale for consistent rhythm:

| Token | Value | Common Use |
|-------|-------|------------|
| `none` | 0px | Reset spacing |
| `xs` | 4px | Tight internal spacing |
| `sm` | 8px | Component internal spacing |
| `md` | 16px | Default spacing |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Large gaps |
| `2xl` | 40px | Section separators |
| `3xl` | 48px | Hero sections |
| `4xl` | 64px | Major sections |
| `5xl` | 80px | Page margins |
| `6xl` | 96px | Large containers |
| `7xl` | 128px | Maximum spacing |

### Semantic Spacing

```javascript
designSystem.config.spacing.semantic.containerPadding;  // 24
designSystem.config.spacing.semantic.sectionGap;       // 64
designSystem.config.spacing.semantic.gridGap;           // 24
```

## Color System

### Color Palettes

The default color system includes:

#### Primary (Blue)

| Shade | Hex | Use Case |
|-------|-----|----------|
| 50 | #eff6ff | Hover backgrounds |
| 100 | #dbeafe | Light backgrounds |
| 200 | #bfdbfe | Borders |
| 300 | #93c5fd | Disabled states |
| 400 | #60a5fa | Placeholder text |
| 500 | #3b82f6 | Default primary |
| 600 | #2563eb | Hover primary |
| 700 | #1d4ed8 | Active/pressed |
| 800 | #1e40af | Dark hover |
| 900 | #1e3a8a | Darkest shade |

#### Neutral (Slate)

Perfect for text, backgrounds, and borders. Includes shades from white (0) to black (950).

#### Semantic Colors

```javascript
designSystem.color('semantic', 'success');   // Light/main/dark variants
designSystem.color('semantic', 'warning');
designSystem.color('semantic', 'error');
designSystem.color('semantic', 'info');
```

### Contrast Utilities

```javascript
// Get contrasting text color
designSystem.getContrastColor('#3b82f6');  // '#ffffff'
designSystem.getContrastColor('#ffffff');   // '#000000'
```

## Typography System

### Font Families

| Name | Stack | Use Case |
|------|-------|----------|
| `sans` | system-ui, -apple-system, Segoe UI, Roboto | Body text, UI |
| `serif` | Georgia, Times New Roman | Headlines, editorial |
| `mono` | Fira Code, SF Mono, Monaco | Code, data |

### Type Scale

| Name | Size | Line Height | Use Case |
|------|------|-------------|----------|
| `xs` | 12px | 1.5 | Captions, badges |
| `sm` | 14px | 1.5 | Small text, helper text |
| `base` | 16px | 1.6 | Body text |
| `lg` | 18px | 1.5 | Large body text |
| `xl` | 20px | 1.4 | Small headings |
| `2xl` | 24px | 1.3 | H4 headings |
| `3xl` | 30px | 1.2 | H3 headings |
| `4xl` | 36px | 1.2 | H2 headings |
| `5xl` | 48px | 1.1 | H1 headings |
| `6xl` | 60px | 1 | Display text |
| `7xl` | 72px | 1 | Hero headlines |

### Semantic Typography

```javascript
designSystem.typography('h1');   // Page titles
designSystem.typography('h2');   // Section titles
designSystem.typography('h3');   // Subsection titles
designSystem.typography('body'); // Paragraph text
designSystem.typography('small'); // Secondary text
```

## Border Radius System

| Token | Value | Use Case |
|-------|-------|----------|
| `none` | 0px | Sharp edges |
| `sm` | 4px | Badges, small elements |
| `DEFAULT` / `md` | 8px | Buttons, inputs |
| `lg` | 12px | Cards |
| `xl` | 16px | Modals |
| `2xl` | 24px | Large cards, featured items |
| `full` | 9999px | Pills, avatars |

### Semantic Radius

```javascript
designSystem.radius('button');  // 8px
designSystem.radius('input');   // 8px
designSystem.radius('card');   // 12px
designSystem.radius('modal');  // 16px
designSystem.radius('badge');  // 4px
```

## Shadow System

| Token | Effect |
|-------|--------|
| `none` | No shadow |
| `sm` | Subtle, for resting elements |
| `DEFAULT` / `md` | Default card shadow |
| `lg` | Elevated elements |
| `xl` | Dropdowns, popovers |
| `2xl` | Modals, dialogs |
| `inner` | Inset shadows |

### Semantic Shadows

```javascript
designSystem.shadow('card');     // Default card shadow
designSystem.shadow('dropdown'); // Dropdown menu shadow
designSystem.shadow('modal');    // Modal overlay shadow
designSystem.shadow('focus');    // Focus ring (blue glow)
```

## Breakpoints

| Token | Value | Device |
|-------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Wide screens |

### Media Query Generation

```javascript
const mediaQuery = designSystem.mediaQuery('md', `
  .container { max-width: 768px; }
`);
```

## Z-Index Scale

### Semantic Z-Index

```javascript
designSystem.zIndex('base');        // 0
designSystem.zIndex('dropdown');     // 100
designSystem.zIndex('sticky');       // 200
designSystem.zIndex('fixed');        // 300
designSystem.zIndex('modalBackdrop'); // 400
designSystem.zIndex('modal');        // 500
designSystem.zIndex('popover');      // 600
designSystem.zIndex('tooltip');      // 700
designSystem.zIndex('toast');        // 800
```

## Component Generators

### Button

```javascript
const primaryBtn = designSystem.button('primary', 'md');
const dangerBtn = designSystem.button('danger', 'sm');
const outlineBtn = designSystem.button('outline', 'lg');
```

**Variants:**
- `primary` - Main action button (blue)
- `secondary` - Secondary actions (gray)
- `outline` - Outlined style
- `ghost` - Text-only style
- `danger` - Destructive actions (red)

**Sizes:**
- `sm` - 14px font, 6px 12px padding
- `md` - 16px font, 10px 16px padding
- `lg` - 18px font, 14px 24px padding

### Input

```javascript
const defaultInput = designSystem.input('md', 'default');
const focusedInput = designSystem.input('md', 'focus');
const errorInput = designSystem.input('md', 'error');
const disabledInput = designSystem.input('md', 'disabled');
```

### Card

```javascript
const defaultCard = designSystem.card('default', 'md');
const elevatedCard = designSystem.card('elevated', 'lg');
const outlinedCard = designSystem.card('outlined', 'md');
const ghostCard = designSystem.card('ghost', 'sm');
```

**Variants:**
- `default` - White bg, subtle border, medium shadow
- `elevated` - No border, large shadow
- `outlined` - Transparent bg, visible border, no shadow
- `ghost` - Light gray bg, no border or shadow

## Integration Examples

### React Integration

```jsx
import { create } from 'zustand';

const useDesignSystem = create((set) => ({
  tokens: designSystem.generateAllVariables(),
  button: (variant, size) => designSystem.button(variant, size),
  input: (size, state) => designSystem.input(size, state),
  card: (variant, padding) => designSystem.card(variant, padding)
}));

// Usage in component
function Button({ children, variant = 'primary' }) {
  const buttonStyle = useDesignSystem(state => state.button(variant, 'md'));
  return <button style={buttonStyle}>{children}</button>;
}
```

### Tailwind CSS Integration

```javascript
// tailwind.config.js
const designSystem = new DesignSystem();

module.exports = {
  ...designSystem.toTailwindConfig(),
  // ... rest of config
};
```

### Styled Components Integration

```javascript
import styled from 'styled-components';

const designSystem = new DesignSystem();

export const Card = styled.div`
  background-color: ${designSystem.color('neutral', 0)};
  border-radius: ${designSystem.radius('card')}px;
  padding: ${designSystem.spacing('md')}px;
  box-shadow: ${designSystem.shadow('md')};
`;

export const PrimaryButton = styled.button`
  background-color: ${designSystem.color('primary', 600)};
  color: white;
  border-radius: ${designSystem.radius('button')}px;
  padding: ${designSystem.spacing('sm')}px ${designSystem.spacing('md')}px;
  
  &:hover {
    background-color: ${designSystem.color('primary', 700)};
  }
`;
```

### CSS Custom Properties

```html
<!-- In your index.html or entry CSS file -->
<style>
  :root {
    /* Generated by designSystem.toCSS() */
    --space-md: 16px;
    --color-primary-500: #3b82f6;
    /* ... all other variables */
  }
</style>
```

## Scoped Design Systems

Create a scoped version for specific parts of your application:

```javascript
const adminScope = designSystem.scope('admin');

// Now all values are prefixed with scope context
// Useful for multi-tenant applications
```

## Extending the Design System

```javascript
const extendedSystem = new DesignSystem({
  colors: {
    ...designSystem.config.colors,
    brand: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87'
    }
  }
});
```

## Best Practices

1. **Use semantic tokens**: Prefer `button()` over raw border-radius values
2. **Maintain consistency**: Use the system for all components
3. **Document customizations**: When extending, document your changes
4. **Test accessibility**: Verify contrast ratios using `getContrastColor()`
5. **Responsive design**: Use breakpoints for adaptive layouts

## License

MIT