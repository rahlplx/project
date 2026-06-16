---
name: vibe-design
description: "Design audit + anti-slop enforcement + WCAG check + taste-skill dial configuration.
  Use when: reviewing UI code, generating design systems, checking color contrast, applying
  brand identity, or any time design quality is at stake. Auto-triggers on any UI/CSS/component
  work. Injects 41 anti-slop rules + 3 taste-skill dials + WCAG AA contrast enforcement.
  Wraps: anti-slop, color-gen, design-system, typography-rules, theme-factory skills."
argument-hint: "[audit|palette|system|typography|dials] [--fix]"
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash(node skills/design/anti-slop/index.js*)
  - Bash(node skills/design/color-gen/index.js*)
  - Bash(node skills/design/design-system/index.js*)
  - Bash(grep -r*)
  - AskUserQuestion
---

<EXTREMELY-IMPORTANT>
Any time you write or review UI code — React, HTML, CSS, Tailwind, Svelte, Vue, or any
component — this skill MUST run. Do not ship visual output without passing the 41 anti-slop
rules and WCAG AA contrast check. "It looks fine" is not a passing condition.
</EXTREMELY-IMPORTANT>

# Vibe-Design — Design Quality Enforcement

## Dispatcher

Read `$ARGUMENTS`:
- No args or `audit` → run full design audit (Steps 1–4) on current file or pasted code
- `palette [#hex]` → run Step 2 (color audit) only, generate WCAG-compliant palette
- `system` → run Step 3 (design tokens) only, generate full token set
- `typography` → run Step 4 (typography rules) only
- `dials` → run Step 0 (configure taste-skill dials) interactively
- `--fix` appended to any command → apply fixes automatically after audit

---

## Step 0 — Taste-Skill Dial Configuration

**Always ask this FIRST on a new project. Skip if dials already set in `.vibe/projects/{slug}/guardrails.md`.**

Three dials control all downstream design decisions. Infer from project brief/references if possible; confirm with user.

| Dial | Range | What it controls |
|------|-------|-----------------|
| **DESIGN_VARIANCE** | 1–10 | How much visual risk is acceptable (1=corporate safe, 10=avant-garde) |
| **MOTION_INTENSITY** | 1–10 | Animation/transition use (1=none, 5=purposeful, 10=cinematic) |
| **VISUAL_DENSITY** | 1–10 | Information density (1=ultra-minimal, 5=editorial, 10=data-dense dashboard) |

**Signal → Dial inference table:**

| If the brief/refs say... | VARIANCE | MOTION | DENSITY |
|--------------------------|---------|--------|---------|
| "clean", "minimal", "Apple-like" | 3–4 | 2–3 | 2–3 |
| "editorial", "magazine", "NYT" | 5–6 | 3–4 | 4–5 |
| "bold", "brutalist", "unconventional" | 8–9 | 5–6 | 5–7 |
| "SaaS", "B2B", "dashboard" | 3–5 | 2–3 | 6–8 |
| "consumer", "mobile-first", "Gen Z" | 6–8 | 6–8 | 3–5 |
| "luxury", "premium", "tasteful" | 4–6 | 4–5 | 2–4 |

Apply dials to every decision below. High VARIANCE = allow bolder choices. Low VARIANCE = enforce safer defaults.

---

## Step 1 — Anti-Slop Scan (41 Rules)

Run against the target code. Report violations as: `[RULE-ID] Rule name — what you found — fix`.

### Color Rules (10)
- **C01** No AI-purple gradients (`#7c3aed→#ec4899` or similar) without brand justification
- **C02** No rainbow palette (>4 unrelated hues on one page)
- **C03** No neon accents (`#00ff00`, `#ff00ff`, `#00ffff`) unless brand identity
- **C04** No gradient text on body copy (only acceptable on display headings, VARIANCE ≥7)
- **C05** No stacked box shadows (max 1 shadow depth per element)
- **C06** No default blue CTA buttons without brand color override (`#3b82f6` is an AI default)
- **C07** Contrast ratio ≥4.5:1 for normal text, ≥3:1 for large text (WCAG AA) — HARD RULE
- **C08** No pure black (`#000000`) on white (`#ffffff`) — use `#111827` on `#ffffff` minimum
- **C09** Palette size ≤5 named colors per page (background, foreground, primary, accent, semantic)
- **C10** No flat grayscale-only palette unless VARIANCE ≤2 and explicitly editorial

### Typography Rules (8)
- **T01** Inter is not a brand font — use it as a fallback, not an identity choice (if Inter is only font and VARIANCE ≥5, flag it)
- **T02** No font soup (>2 typeface families per page; display + body = max)
- **T03** Heading hierarchy must be present: h1 > h2 > h3 with visible size distinction (ratio ≥1.25)
- **T04** No centered body text >3 lines (readability degrades)
- **T05** No ALL CAPS body copy; headings limited to 2 words max in ALL CAPS
- **T06** No decorative display fonts (Papyrus, Comic Sans, Lobster) without VARIANCE ≥9
- **T07** Font weight chaos: max 3 weights in use per page (regular + medium + bold)
- **T08** No text <12px on desktop, <14px on mobile (accessibility floor)

### Layout Rules (10)
- **L01** No three-equal-column "feature card" grid as only layout pattern (AI default)
- **L02** No hero section taller than 80vh with only text + button (bloat)
- **L03** Spacing must follow 4px base scale: 4/8/12/16/24/32/48/64/96px — no arbitrary values
- **L04** No purely symmetrical layouts at VARIANCE ≥6 — introduce tension
- **L05** Footer must not exceed 3 rows of links (footer bloat; link lists = nav problem)
- **L06** No decorative grid lines as visual elements (confuses structure with style)
- **L07** Infinite scroll only when content is genuinely feed-like (not for product lists)
- **L08** No sticky headers + sticky footers simultaneously (sandwiches viewport)
- **L09** Max content width ≤1280px on desktop; never fixed 960px for modern displays
- **L10** Minimum column width 45ch for body text; max 75ch (reading line length)

### Component Rules (7)
- **CM01** No pill-shaped buttons with gradients as primary CTA (double AI default)
- **CM02** Icons must communicate — if you can remove it with no meaning loss, remove it
- **CM03** Avatar placeholder must not be a generic gray circle with initials (use generated avatars or real photos)
- **CM04** Badges/tags: max 3 variants per page (color-coded by semantic meaning)
- **CM05** Toggles: must have visible label, not just on/off color change
- **CM06** Loading spinner: only for operations >500ms; prefer skeleton screens for layout loads
- **CM07** Empty states: must have illustration OR icon + headline + CTA — never a blank white area

### Interaction Rules (3)
- **I01** No hover-to-reveal cards (content invisible until hover = mobile failure)
- **I02** No autoplaying video or audio without explicit user action
- **I03** Modals require clear close affordance (X button + overlay click + Escape key)

### Content Rules (3)
- **CT01** No lorem ipsum — all placeholder text must be realistic domain content
- **CT02** No stock photo imagery that looks like "Unsplash human" (person staring at laptop, team laughing at whiteboard)
- **CT03** No vague hero headlines ("The platform for modern teams") — must state specific value prop

---

## Step 2 — Color Audit & Palette Generation

For each color in the codebase:
1. Extract all hex values from CSS/Tailwind/styles
2. Run WCAG contrast ratio check against likely background (assume `#ffffff` if unknown)
3. Report: `{hex} on {bg-hex} → ratio {N}:1 → {PASS|FAIL AA|FAIL AAA}`
4. For fails: generate a compliant alternative using color-gen logic:
   - Adjust L* in HSL space until ratio ≥4.5:1
   - Keep hue and saturation as close as possible
   - Report: `Replace {old} with {new} (+{delta}L contrast)`

**Banned AI-default palette families** (flag on detection):
- `#7c3aed` / `#8b5cf6` / `#6d28d9` — AI purple family
- `#ec4899` / `#f472b6` — hot pink pairing
- `#06b6d4` / `#0ea5e9` — default cyan/sky (acceptable only with brand justification)
- `#f5f1ea` / `#e8e0d0` — generic warm beige (premium-consumer cliché)
- `#b08947` / `#c9a96e` — generic gold (luxury cliché)

For new palette generation, follow `skills/design/color-gen/index.js` logic:
- Start from brand primary hue
- Generate 5-step tonal scale (50/200/500/700/900)
- Derive semantic colors (success=green, warning=amber, error=red, info=blue) relative to primary
- Output as CSS custom properties + Tailwind config extension

---

## Step 3 — Design System Tokens

When generating a design system, output these token groups (from `skills/design/design-system/index.js`):

```css
/* Spacing — 4px base scale */
--space-1: 4px;  --space-2: 8px;   --space-3: 12px; --space-4: 16px;
--space-6: 24px; --space-8: 32px;  --space-12: 48px; --space-16: 64px;

/* Typography scale */
--text-xs: 0.75rem;   --text-sm: 0.875rem; --text-base: 1rem;
--text-lg: 1.125rem;  --text-xl: 1.25rem;  --text-2xl: 1.5rem;
--text-3xl: 1.875rem; --text-4xl: 2.25rem; --text-5xl: 3rem;

/* Border radius */
--radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;
--radius-full: 9999px;  /* Pills — use sparingly (CM01 applies) */

/* Shadows — max 1 per element (C05 applies) */
--shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px rgb(0 0 0 / 0.07);
--shadow-lg: 0 10px 15px rgb(0 0 0 / 0.1);
```

One design system per project. Do not mix token systems (no Bootstrap + Tailwind + custom vars).

---

## Step 4 — Typography Rules

- **Display type**: 1 typeface, max weight contrast of 300 points (e.g., thin + bold, not thin + black)
- **Body type**: System font stack preferred unless brand budget supports custom (`font-sans` in Tailwind)
- **Serif discipline**: Only use serif if VARIANCE ≥6 AND the brief uses words like "editorial", "literary", "premium". Do NOT use Fraunces, Instrument Serif as default choices.
- **Italic descenders**: If italic display type contains descenders (g, j, p, q, y), set `leading-[1.1]` minimum
- **Responsive scale**: Scale down by one step at mobile (3xl → 2xl for headings)
- **Line height**: Body = 1.5–1.7. Display = 1.0–1.2. Never 1.0 for body.

---

## Audit Report Format

Output a structured report:

```
DESIGN AUDIT — {filename or "current code"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASTE DIALS: VARIANCE={N} | MOTION={N} | DENSITY={N}

VIOLATIONS ({count} found):
  ❌ [C06] Default blue CTA — Replace #3b82f6 with {brand-color}
  ❌ [T04] Centered body text >3 lines at line 47 — Left-align or shorten
  ⚠️  [L01] Three-card feature grid — Acceptable at VARIANCE≤4, flag at ≥5

WCAG CONTRAST:
  ✅ #1f2937 on #ffffff → 16.1:1 (AAA)
  ❌ #9ca3af on #ffffff → 2.8:1 (FAIL AA) — Replace with #6b7280

PASSING: {N}/41 rules
SCORE: {N}% design quality

RECOMMENDED FIXES:
  1. {specific fix with before/after code}
  2. ...
```

If `--fix` is passed: apply all fixes directly to the file, then re-run audit to confirm 0 violations.
