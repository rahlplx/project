# Color Generator Skill

Generates WCAG-compliant color palettes with accessibility considerations. Supports brand color expansion, semantic color systems, and comprehensive contrast checking.

## Overview

The Color Generator provides tools for:

- **Palette Generation**: Create complete color scales from a single base color
- **Accessibility Checking**: Verify WCAG compliance for all combinations
- **Color Harmonies**: Generate complementary, analogous, and triadic colors
- **Semantic Systems**: Create success, warning, error, and info color palettes
- **Export Options**: Output as CSS, Tailwind, or JSON formats

## Installation

```javascript
const ColorGenerator = require('./skills/design/color-gen');
const colorGen = new ColorGenerator();
```

## Quick Start

```javascript
// Generate a complete color system from primary color
const pkg = colorGen.generatePackage('#6366f1', 'Indigo');
console.log(pkg.css); // Ready-to-use CSS variables
console.log(pkg.system.scale); // 10-step color scale
```

## Core Utilities

### Color Conversion

```javascript
// Hex to RGB
colorGen.hexToRgb('#3b82f6');
// { r: 59, g: 130, b: 246 }

// RGB to Hex
colorGen.rgbToHex(59, 130, 246);
// '#3b82f6'

// RGB to HSL
colorGen.rgbToHsl(59, 130, 246);
// { h: 217, s: 91, l: 60 }

// HSL to RGB
colorGen.hslToRgb(217, 91, 60);
// { r: 59, g: 130, b: 246 }
```

### Contrast & Accessibility

```javascript
// Calculate contrast ratio
colorGen.getContrastRatio('#ffffff', '#000000');
// 21

// Check WCAG compliance
colorGen.meetsWCAG('#3b82f6', '#ffffff', 'AA');
// { ratio: 3.87, passesNormal: false, passesLarge: true, level: 'AA' }

colorGen.meetsWCAG('#1e3a8a', '#ffffff', 'AA');
// { ratio: 8.59, passesNormal: true, passesLarge: true, level: 'AA' }

// Get accessible text color for background
colorGen.getAccessibleTextColor('#3b82f6');
// { color: '#ffffff', ratio: 3.87 }
```

## Palette Generation

### Color Scale Generation

Generate a 10-step color scale from any base color:

```javascript
const scale = colorGen.generateScale('#3b82f6');
console.log(scale);
// {
//   50: '#eff6ff',
//   100: '#dbeafe',
//   200: '#bfdbfe',
//   300: '#93c5fd',
//   400: '#60a5fa',
//   500: '#3b82f6',  // Base color
//   600: '#2563eb',
//   700: '#1d4ed8',
//   800: '#1e40af',
//   900: '#1e3a8a',
//   950: '#172554'
// }
```

**Custom Options:**

```javascript
const customScale = colorGen.generateScale('#10b981', {
  steps: 12, // Number of steps (default: 10)
  startLightness: 95, // Lightest shade lightness (default: 95)
  endLightness: 10, // Darkest shade lightness (default: 10)
  startShade: 50, // Starting shade number (default: 50)
  shadeStep: 100, // Shade increment (default: 100)
});
```

### Color Harmonies

```javascript
const base = '#3b82f6'; // Blue

// Complementary (opposite on color wheel)
colorGen.getComplementary(base);
// '#f6a53b' (orange)

// Analogous (adjacent colors)
colorGen.getAnalogous(base);
// ['#5b7af6', '#3b82f6', '#7af63b']

// Analogous with custom angle
colorGen.getAnalogous(base, 45);
// ['#3b5ef6', '#3b82f6', '#3bf6a5']

// Triadic (evenly spaced)
colorGen.getTriadic(base);
// ['#3b82f6', '#f63b82', '#82f63b']

// Split-complementary
colorGen.getSplitComplementary(base);
// ['#3b82f6', '#f6a53b', '#f6d13b']
```

### Brand Palette

Generate a complete brand palette with all color relationships:

```javascript
const brand = colorGen.generateBrandPalette('#8b5cf6');
console.log(brand);
// {
//   primary: { 50: '#f5f3ff', ..., 950: '#2e1065' },
//   accent: {
//     primary: '#8b5cf6',
//     complementary: '#c6f63b',
//     triadic: ['#8b5cf6', '#f63b8c', '#3bc8f6'],
//     analogous: ['#a57af6', '#8b5cf6', '#c83bf6']
//   },
//   neutral: { 0: '#ffffff', ..., 950: '#0f172a' }
// }
```

### Neutral Palette

Generate a neutral gray palette:

```javascript
const neutral = colorGen.generateNeutralPalette('#64748b');
// Or for dark theme:
const neutralDark = colorGen.generateNeutralPalette('#1e293b');
```

### Semantic Palette

Generate success, warning, error, and info colors:

```javascript
const semantic = colorGen.generateSemanticPalette('#3b82f6');
console.log(semantic);
// {
//   success: {
//     light: '#dcfce7',
//     main: '#22c55e',
//     dark: '#15803d'
//   },
//   warning: {
//     light: '#fef9c3',
//     main: '#eab308',
//     dark: '#a16207'
//   },
//   error: {
//     light: '#fee2e2',
//     main: '#ef4444',
//     dark: '#b91c1c'
//   },
//   info: {
//     light: '#e0f2fe',
//     main: '#0ea5e9',
//     dark: '#0369a1'
//   }
// }
```

## Accessibility Features

### Accessible Palette Generation

Ensure your palette meets WCAG contrast requirements:

```javascript
// Generate accessible variant of a color
const accessible = colorGen.generateAccessiblePalette('#60a5fa', '#ffffff');
console.log(accessible);
// {
//   original: '#60a5fa',
//   accessible: '#1d4ed8',  // Darker version with better contrast
//   contrastRatio: 4.54,
//   wcag: { ratio: 4.54, passesNormal: true, passesLarge: true, level: 'AA' }
// }
```

### Dual Palette (Light/Dark)

Generate matching palettes for both light and dark themes:

```javascript
const dual = colorGen.generateDualPalette('#6366f1');
console.log(dual);
// {
//   light: {
//     background: '#ffffff',
//     foreground: '#1e1b2e',
//     primary: '#6366f1',
//     50: '#f5f3ff', ...
//   },
//   dark: {
//     background: '#0f172a',
//     foreground: '#f5f3ff',
//     primary: '#818cf8',  // Adjusted for dark background
//     50: '#1e1b4b', ...
//   }
// }
```

### Contrast Matrix

Generate a contrast matrix to verify all color combinations:

```javascript
const matrix = colorGen.generateContrastMatrix(palette, '#ffffff');
console.log(matrix);
// [
//   { color: '#3b82f6', contrast: 2.92, passesAA: false, passesAAA: false, textColor: '#ffffff' },
//   { color: '#1e3a8a', contrast: 8.59, passesAA: true, passesAAA: true, textColor: '#ffffff' },
//   ...
// ]
```

## Complete Color System

### Generate Full System

Create a complete color system with one call:

```javascript
const system = colorGen.createColorSystem('#ec4899');
// Returns: { brand, semantic, neutral, scale, dual, contrastMatrix }
```

### Generate Package

Generate a complete package with exports:

```javascript
const pkg = colorGen.generatePackage('#f97316', 'Sunset');
console.log(pkg);
// {
//   name: 'Sunset',
//   primaryColor: '#f97316',
//   system: { brand, semantic, neutral, scale, dual, contrastMatrix },
//   css: ':root { ... }',
//   variables: { '--color-brand-primary-500': '#f97316', ... },
//   tailwind: { colors: { 'sunset-primary-500': '#f97316', ... } },
//   accessibility: [...]  // Colors that pass AA
// }
```

## Export Formats

### CSS Variables

```javascript
const vars = colorGen.toCSSVariables(palette, 'brand');
console.log(vars);
// {
//   '--brand-primary-50': '#eff6ff',
//   '--brand-primary-500': '#3b82f6',
//   '--brand-success-main': '#22c55e',
//   ...
// }
```

### CSS String

```javascript
const css = colorGen.toCSS(palette, 'brand');
console.log(css);
/*
:root {
  --brand-primary-50: #eff6ff;
  --brand-primary-500: #3b82f6;
  ...
}
*/
```

### Tailwind Config

```javascript
const config = colorGen.toTailwindConfig(palette, 'brand');
console.log(config);
// {
//   colors: {
//     'brand-primary-50': '#eff6ff',
//     'brand-primary-500': '#3b82f6',
//     'brand-success-main': '#22c55e',
//     ...
//   }
// }
```

## Preset Palettes

Quick access to common color palettes:

```javascript
const presets = colorGen.getPresetPalettes();
console.log(presets);
// {
//   ocean: { primary: '#0ea5e9', palette: {...} },
//   forest: { primary: '#22c55e', palette: {...} },
//   sunset: { primary: '#f97316', palette: {...} },
//   berry: { primary: '#ec4899', palette: {...} },
//   violet: { primary: '#8b5cf6', palette: {...} },
//   emerald: { primary: '#10b981', palette: {...} },
//   rose: { primary: '#f43f5e', palette: {...} },
//   amber: { primary: '#f59e0b', palette: {...} }
// }

// Use a preset
const pkg = colorGen.generatePackage(presets.ocean.primary, 'Ocean');
```

## WCAG Requirements Reference

| Level | Normal Text (4.5:1) | Large Text (3:1) |
| ----- | ------------------- | ---------------- |
| AA    | ✓ Minimum           | ✓ Minimum        |
| AAA   | ✓ Enhanced          | ✓ Enhanced       |

- **Normal Text**: Below 18pt regular or 14pt bold
- **Large Text**: 18pt+ regular or 14pt+ bold

## Integration Examples

### React with CSS Variables

```jsx
import { useEffect } from 'react';

function ColorProvider({ palette }) {
  useEffect(() => {
    const root = document.documentElement;
    const vars = colorGen.toCSSVariables(palette, 'app');

    Object.entries(vars).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
  }, [palette]);

  return <YourApp />;
}

// Usage
function Button() {
  return <button style={{ background: 'var(--app-primary-500)' }}>Click me</button>;
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
const colorGen = new ColorGenerator();
const pkg = colorGen.generatePackage('#6366f1', 'indigo');

module.exports = {
  theme: {
    extend: {
      colors: pkg.tailwind.colors,
    },
  },
};
```

### Styled Components

```javascript
import styled from 'styled-components';
const colorGen = new ColorGenerator();
const palette = colorGen.generateBrandPalette('#6366f1');

export const Card = styled.div`
  background: ${palette.neutral[0]};
  border: 1px solid ${palette.neutral[200]};
  border-radius: 8px;
`;

export const Button = styled.button`
  background: ${palette.primary[500]};
  color: ${colorGen.getAccessibleTextColor(palette.primary[500]).color};

  &:hover {
    background: ${palette.primary[600]};
  }
`;
```

### CSS File Generation

```javascript
const fs = require('fs');
const colorGen = new ColorGenerator();

// Generate for brand
const pkg = colorGen.generatePackage('#ec4899', 'brand');
fs.writeFileSync('colors.css', pkg.css);

// Generate all presets
const presets = colorGen.getPresetPalettes();
Object.entries(presets).forEach(([name, { primary }]) => {
  const presetPkg = colorGen.generatePackage(primary, name);
  fs.writeFileSync(`${name}-colors.css`, presetPkg.css);
});
```

## Best Practices

1. **Test All Combinations**: Use `generateContrastMatrix()` to verify contrast for all text/background pairs
2. **Provide Dark Variants**: Use `generateDualPalette()` for themes that support both modes
3. **Limit Palette Size**: Stick to 5-7 colors plus neutral scale
4. **Use Semantic Colors Consistently**: Success should always mean success
5. **Document Accessibility**: Note which color combinations pass WCAG levels

## License

MIT
