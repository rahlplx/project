# impeccable-audit

## What

A design quality workflow ported from the community `impeccable` skill
(`pbakaus/impeccable`). Where `anti-slop` is purely a detector library, this skill
adds impeccable's actual command structure: a one-time `init` that captures design
context, plus `critique` (UX review) and `polish` (shipping-readiness) passes that
sit on either side of the detector-based `audit`.

## When to use

- Starting a new UI surface and want to capture brand/voice/audience context once (`init`).
- Before shipping a UI change and want a structured critique + polish pass, not just
  a pattern scan.
- Reviewing whether a design is generic/template-like rather than distinctive.

## How it works

`ImpeccableAudit` (in `index.js`):

- `getCommands()` / `getCommand(name)` — the 23 commands from the original skill
  (`craft`, `init`, `document`, `extract`, `shape`, `critique`, `audit`, `polish`,
  `bolder`, `quieter`, `distill`, `harden`, `onboard`, `animate`, `colorize`,
  `typeset`, `layout`, `delight`, `overdrive`, `clarify`, `adapt`, `optimize`, `live`).
  Only `init`/`critique`/`audit`/`polish` have dedicated logic below; the rest are
  reference descriptions for the agent to act on directly (see the `vibe-design`
  wrapper for how each command is actually used).
- `runInit(answers)` — validates `{ surfaceType: 'brand'|'product', audience, voice,
  antiReferences?, palette?, typography?, components? }` and renders a `DESIGN.md`.
- `audit(design)` — runs the existing `anti-slop` skill's 41 detectors **plus** 5
  supplemental detectors not covered by anti-slop (nested cards, bounce/elastic
  easing, gray text on a colored background, side-tab border accents, dark glow
  shadows) — composing rather than duplicating, since `anti-slop` already covers
  most of impeccable's documented anti-patterns.
- `critique(design)` — qualitative hierarchy/resonance checklist distinct from the
  detector-based audit (no clear focal point, voice doesn't match brand, etc.).
- `polish(checklist)` — shipping-readiness checklist (contrast, responsive
  breakpoints, interactive states, empty/loading states, reduced-motion support).

## Agent usage

See `.claude/skills/vibe-design/SKILL.md` for the dispatcher that routes
`/vibe-design impeccable <command>` to this module.
