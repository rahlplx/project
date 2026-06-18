# Anti-Slop Design Skill

A deterministic anti-pattern detector that catches 41 common AI-generated design mistakes and enforces professional design quality.

## Overview

AI-generated designs often fall into predictable patterns that make them look generic, unprofessional, or inaccessible. This skill systematically checks designs against 41 anti-patterns across 6 categories to ensure output meets professional standards.

## Installation

```javascript
const AntiSlopSkill = require('./skills/design/anti-slop');
const antiSlop = new AntiSlopSkill();
```

## Usage

```javascript
// Analyze a design
const design = {
  colors: ['#8b5cf6', '#FF0000', '#00FF00', '#0000FF'],
  fontFamily: 'Inter, sans-serif',
  cards: [{}, {}, {}],
  text: 'Welcome to the future of innovation'
};

const result = antiSlop.analyze(design);

console.log(result);
// {
//   passed: false,
//   score: 65,
//   violations: [...],
//   warnings: [...],
//   totalIssues: 3,
//   summary: '⚠️ 3 critical violation(s), 2 warning(s). Score: 65/100'
// }
```

## The 41 Anti-Patterns

### Color Anti-Patterns (1-10)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| 1 | Purple Gradient Ban | Medium | Detects generic purple gradients, an AI design cliché |
| 2 | Rainbow Palette Overuse | High | Catches excessive rainbow color usage |
| 3 | Neon Color Overuse | Medium | Flags over-saturated, neon-like colors |
| 4 | Gradient Text Detection | Low | Identifies gradient text effects |
| 5 | Excessive Drop Shadows | Medium | Catches too many or too heavy shadows |
| 6 | Monotonous Button Color | Medium | Detects all buttons being the same blue |
| 7 | Low Contrast Text | High | Ensures WCAG 4.5:1 contrast ratio |
| 8 | Harsh Pure Black Text | Low | Flags #000000 for potentially better alternatives |
| 9 | Excessive Color Palette | Medium | Warns when >8 colors are used |
| 10 | Flat Grayscale Palette | Low | Detects poorly distributed gray values |

### Typography Anti-Patterns (11-18)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| 11 | Inter Font Overuse | Medium | Catches over-reliance on Inter font |
| 12 | Font Variety Overload | High | Warns when >4 different fonts are used |
| 13 | Missing Type Hierarchy | High | Ensures proper font size scale exists |
| 14 | Excessive Center Alignment | Medium | Flags over 70% centered text |
| 15 | ALL CAPS Header Usage | Medium | Catches ALL CAPS headlines |
| 16 | Inappropriate Font Selection | High | Detects Comic Sans, Papyrus, etc. |
| 17 | Inconsistent Font Weights | Medium | Warns when >5 different weights used |
| 18 | Body Text Too Small | High | Ensures body text is ≥16px |

### Layout Anti-Patterns (19-28)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| 19 | Three Card Feature Layout | Medium | Catches the classic 3-card AI layout |
| 20 | Hero Section Overload | Medium | Warns when hero has >5 elements |
| 21 | Uniform Padding Syndrome | Low | Detects identical padding everywhere |
| 22 | Excessive Symmetry | Low | Flags too-perfect symmetry |
| 23 | Footer Link Overload | Medium | Warns when >20 footer links |
| 24 | Grid Lines as Decoration | High | Catches visible grid lines |
| 25 | Infinite Scroll Without Option | Medium | Ensures load more option exists |
| 26 | Excessive Sticky Elements | Medium | Warns when >1 sticky element |
| 27 | Fixed Width on Mobile | High | Catches non-fluid containers |
| 28 | Narrow Centered Content Column | Medium | Warns about Word-doc style layouts |

### Component Anti-Patterns (29-35)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| 29 | Excessive Pill/Pill Shaped Elements | Medium | Catches overuse of border-radius: 9999px |
| 30 | Icon Overload | Medium | Warns when >15 icons or >2 icon sets |
| 31 | Default Avatar Styling | Low | Flags generic circular avatars |
| 32 | Notification Badge Spam | Medium | Warns when >3 badges used |
| 33 | Toggle Switch Overuse | Low | Ensures toggles used only for on/off |
| 34 | Loading Spinner Instead of Skeleton | Low | Recommends skeleton screens |
| 35 | Missing Empty States | Medium | Ensures empty states are designed |

### Interaction Anti-Patterns (36-38)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| 36 | Excessive Hover Interactions | Medium | Warns when >5 hover effects |
| 37 | Auto-play Media Content | High | Ensures accessibility compliance |
| 38 | Excessive Modal Usage | Medium | Warns when modals exceed page count × 2 |

### Content Anti-Patterns (39-41)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| 39 | Lorem Ipsum Placeholder Text | High | Catches placeholder text in design |
| 40 | Cliché Stock Photos | Medium | Detects generic stock image subjects |
| 41 | Vague Hero Headlines | High | Catches meaningless marketing speak |

## API Reference

### `analyze(design)`

Analyzes a design object and returns violation/warning details.

**Parameters:**
- `design` (Object): Design object to analyze

**Returns:**
```javascript
{
  passed: Boolean,           // true if no high-severity violations
  score: Number,             // 0-100 quality score
  violations: Array,         // High-severity issues
  warnings: Array,           // Medium/low-severity issues
  totalIssues: Number,       // Total count of issues
  summary: String            // Human-readable summary
}
```

### `getCategories()`

Returns all detector categories with their rules.

### `getDetectorInfo(detectorId)`

Returns detailed information about a specific detector.

## Scoring

The quality score is calculated as:
- Base score: 100
- Each high-severity violation: -15 points
- Each medium/low-severity warning: -5 points
- Minimum score: 0, Maximum: 100

### Score Interpretation

| Score | Rating | Description |
|-------|--------|-------------|
| 90-100 | Excellent | Professional, polished design |
| 70-89 | Good | Minor improvements needed |
| 50-69 | Fair | Several issues to address |
| 0-49 | Poor | Significant redesign recommended |

## Integration Examples

### With Design System

```javascript
const AntiSlopSkill = require('./anti-slop');
const DesignSystem = require('../design-system');

const antiSlop = new AntiSlopSkill();
const designSystem = new DesignSystem();

function validateAndApply(design) {
  const analysis = antiSlop.analyze(design);
  
  if (!analysis.passed) {
    console.log(analysis.summary);
    analysis.violations.forEach(v => {
      console.log(`❌ ${v.name}: ${v.message}`);
      console.log(`   Fix: ${v.fix}`);
    });
    return false;
  }
  
  return designSystem.apply(design);
}
```

### CI/CD Integration

```javascript
// pre-commit hook example
const analysis = antiSlop.analyze(designSpec);
if (analysis.score < 70) {
  console.error('Design quality score too low:', analysis.score);
  process.exit(1);
}
```

## License

MIT