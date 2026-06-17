# Theme Factory Skill

Generates custom theme configurations with colors, fonts, and design tokens. Supports dark, light, and custom themes with accessibility compliance.

## Overview

The Theme Factory provides a systematic approach to creating and managing design themes:

- **Preset Themes**: Pre-built themes for common use cases
- **Custom Themes**: Generate themes from configuration
- **Color Utilities**: Manipulate colors with brightness, saturation, and contrast
- **CSS Export**: Generate ready-to-use CSS variables
- **Accessibility**: Built-in WCAG compliance checking

## Installation

```javascript
const ThemeFactory = require('./skills/design/theme-factory');
const themeFactory = new ThemeFactory();
```

## Quick Start

```javascript
// Use a preset theme
const package = themeFactory.generatePackage('midnight');
console.log(package.css); // Ready-to-use CSS

// Create a custom theme from primary color
const quick = themeFactory.quickTheme('#6366f1', 'Purple Power');
```

## Preset Themes

### Dark Themes

| Theme      | Description                          | Best For                      |
| ---------- | ------------------------------------ | ----------------------------- |
| `midnight` | Deep purple-blue with indigo accents | Modern apps, dashboards       |
| `noir`     | Pure black with white accents        | Minimalist, high-contrast     |
| `ocean`    | Deep ocean blues with cyan accents   | Data visualization, analytics |

### Light Themes

| Theme   | Description                   | Best For            |
| ------- | ----------------------------- | ------------------- |
| `cloud` | Clean white with blue accents | SaaS, corporate     |
| `paper` | Warm cream with amber accents | Editorial, blogs    |
| `mint`  | Fresh green tones             | Health, nature, eco |

### Special Themes

| Theme          | Description                  | Accessibility        |
| -------------- | ---------------------------- | -------------------- |
| `highContrast` | Maximum contrast black/white | WCAG AAA compliance  |
| `corporate`    | Professional navy blue       | Enterprise, business |

### Available Presets

```javascript
const presets = themeFactory.getAvailablePresets();
console.log(presets);
/*
[
  { id: 'midnight', name: 'Midnight', type: 'dark' },
  { id: 'noir', name: 'Noir', type: 'dark' },
  { id: 'ocean', name: 'Ocean Deep', type: 'dark' },
  { id: 'cloud', name: 'Cloud', type: 'light' },
  { id: 'paper', name: 'Paper', type: 'light' },
  { id: 'mint', name: 'Mint', type: 'light' },
  { id: 'highContrast', name: 'High Contrast', type: 'both' },
  { id: 'corporate', name: 'Corporate', type: 'light' }
]
*/
```

## Usage Examples

### Using Preset Themes

```javascript
// Get a specific preset
const midnight = themeFactory.getPreset('midnight');

// Generate complete package
const package = themeFactory.generatePackage('ocean');

// Access components
console.log(package.theme.colors.background.primary); // '#0c1929'
console.log(package.css); // CSS variables string
console.log(package.variables['--bg-primary']); // '#0c1929'
```

### Quick Theme from Primary Color

```javascript
// Generate theme from any primary color
const brandTheme = themeFactory.quickTheme('#ec4899', 'Brand Pink');
console.log(brandTheme.css);
```

### Custom Theme Configuration

```javascript
const customTheme = themeFactory.createTheme({
  name: 'My Custom Theme',
  type: 'light',
  primaryColor: '#8b5cf6',
  backgroundColor: '#1e1b4b',
  textColor: '#f5f3ff',
  borderColor: '#4338ca',
  fontFamily: {
    heading: '"Playfair Display", serif',
    body: '"Inter", sans-serif',
    mono: '"Fira Code", monospace',
  },
});
```

### Generate Theme Package

```javascript
const package = themeFactory.generatePackage('custom', {
  name: 'Custom Dark Theme',
  type: 'dark',
  primaryColor: '#10b981',
  backgroundColor: '#064e3b',
  textColor: '#ecfdf5',
});
```

## Color Manipulation Utilities

### Brightness Adjustment

```javascript
const colors = themeFactory.colorManipulation;

// Lighten by 20%
const lighter = colors.adjustBrightness('#3b82f6', 20); // '#7db3f9'

// Darken by 30%
const darker = colors.adjustBrightness('#3b82f6', -30); // '#1d4ed8'
```

### Color Conversion

```javascript
// Hex to HSL
const hsl = colors.hexToHsl('#3b82f6');
console.log(hsl); // { h: 217, s: 91, l: 60 }

// HSL to Hex
const hex = colors.hslToHex(217, 91, 60); // '#3b82f6'
```

### Color Scale Generation

```javascript
// Generate 10-step scale from base color
const scale = colors.generateScale('#3b82f6');
console.log(scale);
// {
//   100: '#f0f5ff',
//   200: '#dbeafe',
//   ...
//   1000: '#1e3a8a'
// }
```

### Accessibility

```javascript
// Calculate contrast ratio
const ratio = colors.getContrastRatio('#ffffff', '#000000');
console.log(ratio); // 21

// Get accessible text color
const textColor = colors.getAccessibleTextColor('#3b82f6');
// Returns '#ffffff' or '#000000' based on contrast
```

## CSS Export

### Generate CSS Variables

```javascript
const package = themeFactory.generatePackage('cloud');
const cssVars = themeFactory.generateCSSVariables(package.theme);

// Output:
// {
//   '--bg-primary': '#ffffff',
//   '--text-primary': '#0f172a',
//   '--accent-primary': '#3b82f6',
//   ...
// }
```

### Export as CSS String

```javascript
const package = themeFactory.generatePackage('midnight');
console.log(package.css);

/*
:root {
  --bg-primary: #0f0f23;
  --bg-secondary: #1a1a2e;
  --text-primary: #eeeeee;
  --accent-primary: #6366f1;
  ...
}
*/
```

### Dark Mode Support

```javascript
// Themes with 'type: both' auto-generate dark mode variants
const highContrast = themeFactory.generatePackage('highContrast');
console.log(highContrast.css);

/*
:root {
  --bg-primary: #ffffff;
  ...
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #000000;
    ...
  }
}
*/
```

## Theme Structure

### Colors

```javascript
{
  background: {
    primary: '#ffffff',      // Main background
    secondary: '#f8fafc',    // Card/section backgrounds
    tertiary: '#f1f5f9',      // Subtle backgrounds
    elevated: '#ffffff'       // Elevated surfaces (modals, dropdowns)
  },
  text: {
    primary: '#0f172a',      // Primary text
    secondary: '#475569',    // Secondary text
    muted: '#94a3b8',        // Muted/placeholder text
    inverse: '#ffffff'       // Text on colored backgrounds
  },
  border: {
    default: '#e2e8f0',      // Default borders
    subtle: '#f1f5f9',       // Subtle borders
    strong: '#cbd5e1'        // Emphasized borders
  },
  accent: {
    primary: '#3b82f6',      // Primary accent color
    secondary: '#6366f1',    // Secondary accent
    success: '#22c55e',      // Success states
    warning: '#eab308',     // Warning states
    error: '#ef4444',         // Error states
    info: '#0ea5e9'          // Info states
  }
}
```

### Typography

```javascript
{
  fontFamily: {
    heading: '"Plus Jakarta Sans", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"Fira Code", monospace'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
}
```

### Border Radius

```javascript
{
  sm: 4,     // Badges, small elements
  md: 8,     // Buttons, inputs
  lg: 12,    // Cards
  xl: 16,    // Modals
  full: 9999 // Pills, avatars
}
```

### Shadows

```javascript
{
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(59, 130, 246, 0.15)'
}
```

## Integration Examples

### React Integration

```jsx
import { useEffect, useState } from 'react';
import ThemeFactory from './theme-factory';

const themeFactory = new ThemeFactory();

export function useTheme(themeId) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const package = themeFactory.generatePackage(themeId);
    setTheme(package);

    // Apply CSS variables to :root
    const style = document.documentElement;
    Object.entries(package.variables).forEach(([varName, value]) => {
      style.style.setProperty(varName, value);
    });
  }, [themeId]);

  return theme;
}

// Usage
function App() {
  const theme = useTheme('midnight');
  if (!theme) return null;

  return <div style={{ background: 'var(--bg-primary)' }}>...</div>;
}
```

### Tailwind CSS Integration

```javascript
// tailwind.config.js
const themeFactory = new ThemeFactory();
const midnight = themeFactory.getPreset('midnight');

module.exports = {
  theme: {
    extend: {
      colors: midnight.colors,
      fontFamily: midnight.typography.fontFamily,
      borderRadius: midnight.borderRadius,
      boxShadow: midnight.shadows,
    },
  },
};
```

### Styled Components

```javascript
import styled from 'styled-components';
import ThemeFactory from './theme-factory';

const themeFactory = new ThemeFactory();
const cloud = themeFactory.getPreset('cloud');

export const Card = styled.div`
  background: ${cloud.colors.background.elevated};
  border: 1px solid ${cloud.colors.border.default};
  border-radius: ${cloud.borderRadius.lg}px;
  box-shadow: ${cloud.shadows.md};
  padding: ${cloud.spacing.base * 1.5}px;
`;

export const Button = styled.button`
  background: ${cloud.colors.accent.primary};
  color: ${cloud.colors.text.inverse};
  border-radius: ${cloud.borderRadius.md}px;
  padding: ${cloud.spacing.base * 0.625}px ${cloud.spacing.base}px;

  &:hover {
    filter: brightness(1.1);
  }
`;
```

### CSS File Generation

```javascript
const fs = require('fs');
const themeFactory = new ThemeFactory();

// Generate theme CSS
const package = themeFactory.generatePackage('ocean');
fs.writeFileSync('themes/ocean.css', package.css);

// Generate all presets
themeFactory.getAvailablePresets().forEach(preset => {
  const pkg = themeFactory.generatePackage(preset.id);
  fs.writeFileSync(`themes/${preset.id}.css`, pkg.css);
});
```

## Creating Brand Themes

### From Logo Colors

```javascript
// Extract primary color from brand
const brandPrimary = '#ec4899'; // Pink from logo

// Generate matching theme
const brandTheme = themeFactory.quickTheme(brandPrimary, 'Brand Theme');

// Customize further
brandTheme.theme.name = 'Acme Corp Theme';
brandTheme.theme.typography.fontFamily.heading = '"Brand Font", sans-serif';

// Export
console.log(brandTheme.css);
```

### Full Custom Configuration

```javascript
const enterpriseTheme = themeFactory.createTheme({
  name: 'Enterprise Blue',
  type: 'light',
  primaryColor: '#1e40af', // Enterprise blue
  secondaryAccentColor: '#3b82f6',
  backgroundColor: '#f8fafc',
  textColor: '#0f172a',
  borderColor: '#e2e8f0',
  successColor: '#059669',
  warningColor: '#d97706',
  errorColor: '#dc2626',
  fontFamily: {
    heading: '"Libre Franklin", sans-serif',
    body: '"Libre Franklin", sans-serif',
    mono: '"IBM Plex Mono", monospace',
  },
  borderRadius: {
    sm: 2,
    md: 4,
    lg: 6,
    xl: 8,
    full: 9999,
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 1px 4px rgba(0, 0, 0, 0.08)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
    glow: 'none',
  },
});

const package = themeFactory.generatePackage('enterprise-blue', enterpriseTheme);
```

## Best Practices

1. **Consistency**: Use theme variables throughout instead of hardcoded values
2. **Accessibility**: Always check contrast ratios using `getContrastRatio()`
3. **Responsiveness**: Test themes across different viewport sizes
4. **Dark Mode**: Use `type: 'both'` for themes that support both modes
5. **Performance**: Minimize CSS variable usage in critical rendering paths

## License

MIT
