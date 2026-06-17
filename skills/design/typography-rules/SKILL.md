# Typography Rules Skill

Typography best practices including font pairing rules, hierarchy guidelines, and systematic approaches to type selection for professional design.

## Overview

The Typography Rules skill provides:

- **20+ Font Pairings**: Curated combinations for different moods and use cases
- **Type Scales**: Mathematical scales (Minor Third, Major Third, Perfect Fourth, Golden Ratio)
- **Line Height Guidelines**: Context-appropriate line spacing
- **Font Stack Generation**: Production-ready CSS font stacks
- **Style Generation**: Heading, body, and utility text styles

## Installation

```javascript
const TypographyRules = require('./skills/design/typography-rules');
const typo = new TypographyRules();
```

## Quick Start

```javascript
// Get a font pairing
const pairing = typo.getPairing('plus-jakarta');
console.log(pairing);
// { heading: '"Plus Jakarta Sans"', body: '"Inter"', mood: 'Modern, professional', ... }

// Generate typography styles
const styles = typo.generateTypography({
  fontFamily: pairing,
  typeScale: 'majorThird',
  baseSize: 16
});

// Export as CSS
console.log(typo.toCSS(styles));
```

## Font Pairings

### Modern & Clean (8 pairings)

| ID | Heading | Body | Mood | Best For |
|----|---------|------|------|----------|
| `plus-jakarta` | Plus Jakarta Sans | Inter | Modern, professional | SaaS, Apps, Portfolios |
| `dm-sans` | DM Sans | IBM Plex Sans | Friendly, approachable | Startups, Creative, Agency |
| `outfit` | Outfit | Source Sans 3 | Bold, contemporary | Modern apps, Dashboards |
| `sora` | Sora | Work Sans | Futuristic, minimal | Tech, Finance, Premium |
| `manrope` | Manrope | Manrope | Versatile, geometric | Universal, Product |
| `space-grotesk` | Space Grotesk | IBM Plex Sans | Techy, distinctive | Dev tools, Gaming |
| `figtree` | Figtree | Figtree | Friendly, rounded | Consumer apps, Social |
| `general-sans` | General Sans | General Sans | Swiss-inspired, balanced | Editorial, Branding |

### Serif & Editorial (5 pairings)

| ID | Heading | Body | Mood | Best For |
|----|---------|------|------|----------|
| `fraunces` | Fraunces | Source Serif 4 | Warm, distinctive | Magazines, Blogs, Luxury |
| `playfair` | Playfair Display | Source Sans 3 | Elegant, classic | Fashion, Luxury, Editorial |
| `libre-baskerville` | Libre Baskerville | Libre Franklin | Traditional, authoritative | News, Academic, Legal |
| `cormorant` | Cormorant | Jost | Delicate, refined | Art, Culture, Boutique |
| `newsreader` | Newsreader | Newsreader | Editorial, newspaper | Publications, Long-form |

### Display & Impact (3 pairings)

| ID | Heading | Body | Mood | Best For |
|----|---------|------|------|----------|
| `bebas` | Bebas Neue | Barlow | Bold, impactful | Sports, Events, Promo |
| `anton` | Anton | Work Sans | Heavy, commanding | Headlines, Hero, Ads |
| `big-shoulders` | Big Shoulders | Big Shoulders | Industrial, urban | Sports, City, Bold |

### Mono & Technical (2 pairings)

| ID | Heading | Body | Mood | Best For |
|----|---------|------|------|----------|
| `jetbrains` | JetBrains Mono | Inter | Technical, precise | Documentation, Code |
| `fira-code` | Fira Code | Fira Sans | Clean, readable | Developer, Tech docs |

## Type Scale Systems

### Available Scales

| Scale | Ratio | Use Case |
|-------|-------|----------|
| `minorThird` | 1.2 | Compact UI, small viewports |
| `majorThird` | 1.25 | Balanced, general use (default) |
| `perfectFourth` | 1.333 | Readable, modern feel |
| `goldenRatio` | 1.618 | Dramatic, artistic expression |

### Using Type Scales

```javascript
// Get predefined scale
const scale = typo.getTypeScale('majorThird');
console.log(scale.scale);
// [
//   { name: 'xs', size: 12, px: '12px', rem: '0.75rem' },
//   { name: 'sm', size: 14, px: '14px', rem: '0.875rem' },
//   ...
// ]

// Calculate custom scale
const custom = typo.calculateScale(16, 1.25, 6);
// Generates scale from base 16px with 1.25 ratio
```

## Line Height Guidelines

| Category | Range | Best For |
|----------|-------|----------|
| `tight` | 1.0 - 1.2 | Display text, large headings |
| `snug` | 1.25 - 1.375 | Small headings, UI labels |
| `normal` | 1.4 - 1.5 | Body text, large text (18px+) |
| `relaxed` | 1.5 - 1.625 | Long-form reading, articles |
| `loose` | 1.625 - 2.0 | Accessibility, large print |

### Dynamic Line Height

```javascript
// Get recommended line height for font size
typo.getLineHeight(48);  // 1.0
typo.getLineHeight(24);  // 1.2
typo.getLineHeight(16);  // 1.5
typo.getLineHeight(12);  // 1.6
```

## Font Stack Generation

### Generate Production Font Stacks

```javascript
// Generate complete font stack
typo.generateFontStack('Plus Jakarta Sans', 'sans');
// '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

typo.generateFontStack('Playfair Display', 'serif');
// '"Playfair Display", Georgia, "Times New Roman", serif'

typo.generateFontStack('JetBrains Mono', 'mono');
// '"JetBrains Mono", "SF Mono", Monaco, "Fira Code", monospace'
```

## Style Generation

### Heading Styles

```javascript
const headings = typo.generateHeadingStyles();
console.log(headings.h1);
// {
//   fontSize: '2.5rem',
//   fontWeight: 700,
//   lineHeight: 1.1,
//   letterSpacing: '-0.02em',
//   marginBottom: '0.5em'
// }
```

### Body Styles

```javascript
const bodyStyles = typo.generateBodyStyles();
console.log(bodyStyles.body);
// {
//   fontSize: '1rem',
//   lineHeight: 1.6,
//   marginBottom: '1em'
// }
```

## Complete Typography System

### Generate Full System

```javascript
const pairing = typo.getPairing('plus-jakarta');
const typography = typo.generateTypography({
  fontFamily: pairing,
  typeScale: 'majorThird',
  baseSize: 16
});

console.log(typography);
// {
//   fontFamily: { heading: '...', body: '...', ... },
//   size: { xs: '12px', sm: '14px', base: '16px', ... },
//   lineHeight: { tight: 1.1, snug: 1.3, ... },
//   fontWeight: { normal: 400, medium: 500, ... }
// }
```

### Export as CSS

```javascript
const css = typo.toCSS(typography);
console.log(css);
/*
:root {
  --font-heading: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  ...
}
*/
```

## Font Suggestion

### By Mood or Use Case

```javascript
// Find pairings for tech/startup vibe
const suggestions = typo.suggestPairing('tech');
console.log(suggestions);
// [{ id: 'sora', ... }, { id: 'space-grotesk', ... }]

// Find pairings for luxury/editorial
const luxury = typo.suggestPairing('luxury');
```

## Letter Spacing Guidelines

```javascript
// Get recommended letter spacing
typo.getLetterSpacing(60, 700);           // '-0.03em' (large bold)
typo.getLetterSpacing(32, 600);           // '-0.01em' (medium heading)
typo.getLetterSpacing(16, 400);           // '0' (body text)
typo.getLetterSpacing(12, 600, 'uppercase'); // '0.05em' (uppercase label)
```

## Performance Recommendations

```javascript
const perf = typo.checkFontPerformance('"Plus Jakarta Sans", sans-serif');
console.log(perf.suggestions);
// [
//   "Use font-display: swap for Plus Jakarta Sans",
//   "Preload critical fonts with <link rel='preload'>",
//   "Subset fonts to used character sets",
//   "Consider variable fonts for better performance"
// ]
```

## CSS Examples

### Heading CSS

```css
h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  letter-spacing: -0.01em;
}
```

### Body CSS

```css
body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

p {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  margin-bottom: 1em;
}

.caption {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-muted);
}

.overline {
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: var(--font-semibold);
}
```

## Google Fonts Integration

### Common Font Loading

```html
<!-- Plus Jakarta Sans + Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Playfair Display + Source Sans 3 -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">

<!-- Fraunces + Source Serif 4 -->
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Source+Serif+4:wght@400;500;600&display=swap" rel="stylesheet">
```

## Best Practices

1. **Limit Font Families**: Use 2-3 fonts maximum (heading, body, accent)
2. **Use Optical Sizing**: Enable `font-optical-sizing: auto` where supported
3. **Set Appropriate Line Height**: Larger text needs tighter line height
4. **Mind the Hierarchy**: Ensure clear size differentiation between levels
5. **Consider Readability**: Body text should be 16-18px minimum for long-form
6. **Test at Scale**: Verify fonts look good from 12px to 72px+
7. **Mind Letter Spacing**: All caps needs more tracking; large display needs less

## License

MIT