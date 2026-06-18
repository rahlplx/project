# Taste-Skill — Three-Dial Design Discipline

Faithful port of Leonxlnx/taste-skill (https://github.com/Leonxlnx/taste-skill) —
gives the agent "good taste" by parameterizing layout risk, motion, and density
through three dials, and enforcing the framework's hard, mechanically-checkable
anti-slop rules (em-dash ban, duplicate-CTA-intent, hero/eyebrow discipline).
Composes with `skills/design/anti-slop` for color/typography/layout coverage it
already has — this skill does not re-implement those.

## When to use

- Before generating a new landing page, portfolio, or marketing section: read the
  brief, infer the three dials, and state the one-line design read.
- During a Pre-Flight Check before shipping generated UI copy/markup: run
  `preflightCheck()` to catch the framework's hard-rule violations.
- `.claude/skills/vibe-design/SKILL.md`'s Step 0 dial table documents the same
  three dials at the prompt level — this module is the executable counterpart
  callable from JS/tests, not a replacement for that doc.

## The Three Dials

| Dial               | Range | 1–3                                                | 4–7                                                | 8–10                                              |
| ------------------ | ----- | -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `DESIGN_VARIANCE`  | 1–10  | Predictable: symmetrical grids, centered alignment | Offset: varied aspect ratios, left-aligned headers | Asymmetric: masonry, fractional grid units        |
| `MOTION_INTENSITY` | 1–10  | Static: hover/active only                          | Fluid CSS: transitions, cascading delays           | Advanced Choreography: scroll-triggered, parallax |
| `VISUAL_DENSITY`   | 1–10  | Art Gallery: massive white space                   | Daily App: standard app spacing                    | Cockpit: tight padding, mono numerals             |

**Baseline:** `DESIGN_VARIANCE=8, MOTION_INTENSITY=6, VISUAL_DENSITY=4`, overridable per brief.

## Hard Rules Enforced

- **Em-dash ban** — `—`/`–` anywhere visible fails the Pre-Flight Check.
- **No duplicate CTA intent** — two CTAs with the same intent ("Get in touch" /
  "Contact us") on one page is a Pre-Flight Fail.
- **Hero discipline** — headline ≤2 lines, subtext ≤20 words, top padding ≤`pt-24`
  (6rem), ≤4 stack elements, CTA visible without scrolling.
- **Eyebrow restraint** — max 1 eyebrow per 3 sections.
- **Pure black/white ban** — use off-black/off-white, never `#000000`/`#ffffff`.
- **Marquee max-one-per-page**.

## Methods

| Method                                       | Description                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `inferDials(brief)`                          | Infers dial values from `brief.vibeWords`, falling back to baseline when no signal matches. |
| `describeBriefRead(brief)`                   | One-line "Reading this as: ..." design read.                                                |
| `bandFor(dial, value)`                       | Looks up the rubric band/label for a dial value.                                            |
| `checkEmDash(text)`                          | Detects em/en-dash characters.                                                              |
| `checkDuplicateCTAIntent(ctas)`              | Detects CTAs sharing the same intent group.                                                 |
| `checkHeroDiscipline(hero)`                  | Checks headline/subtext/padding/stack/CTA-visibility rules.                                 |
| `checkEyebrowRestraint(count, sectionCount)` | Checks eyebrow count against `ceil(sections / 3)`.                                          |
| `checkPureBlackWhite(colors)`                | Flags exact `#000000`/`#ffffff`.                                                            |
| `checkMarqueeCount(count)`                   | Flags more than one marquee.                                                                |
| `preflightCheck(design)`                     | Aggregates the above into a pass/fail findings report.                                      |

## Example

```js
const TasteSkill = require('./index');
const taste = new TasteSkill();

taste.inferDials({ vibeWords: ['minimalist'] });
// { dials: { DESIGN_VARIANCE: 3, MOTION_INTENSITY: 2, VISUAL_DENSITY: 2 }, usedBaseline: false }

taste.preflightCheck({
  copyText: 'Build faster — ship sooner.',
  ctas: ['Contact us', 'Get in touch'],
});
// { passed: false, findings: [{ rule: 'em-dash-ban', ... }, { rule: 'duplicate-cta-intent', ... }] }
```
