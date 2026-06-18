# vibe:design — UI Generation & Approval

Generates HTML/CSS previews of UI designs and iterates until approved using Stitch or direct HTML generation.

## When to Run

During `/vibe:break` phase, in parallel with task decomposition, if `stack.has_ui` is true.

## Steps

### 1. Generate UI
- Use prompt-to-design generation (Stitch MCP or direct HTML/CSS)
- Generate mobile-first responsive layouts
- Use project's existing design tokens if available

### 2. Preview
- Create standalone HTML preview file
- Serve locally or provide screenshot
- Show all states: empty, loading, error, populated

### 3. Iterate
- Collect feedback against acceptance criteria
- Make targeted edits (not full regenerations)
- Re-preview after each change

### 4. Approve
- Run through accessibility checklist:
  - Color contrast ≥ 4.5:1
  - Keyboard navigable
  - Focus indicators visible
  - Screen reader friendly (aria labels, semantic HTML)
- Confirm with user
- Extract design tokens to DESIGN.md if not exists

### 5. Output
- `designs/<screen-name>.html` — final approved design
- `DESIGN.md` (if created/updated) — design tokens

## Reference
- gstack `/design-html`
- Stitch generate/edit screen tools
- `skills/design/` — all 6 design skills (typography, color, theme, anti-slop, template-gallery, design-system)
