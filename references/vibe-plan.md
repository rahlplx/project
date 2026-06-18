# vibe:plan — Multi-Perspective Review & Planning

Pressure-tests the design doc with CEO, Engineering, and Design perspectives.

## When to Run

After `/vibe:think` produces a think document. This is the gate before `/vibe:break`.

## Steps

### 1. Engineering Review
- Architecture feasibility
- Technical debt implications
- Scaling considerations
- Dependency audit
- Security surface area

### 2. Design Review
- UX consistency with existing patterns
- Accessibility (WCAG 2.1 AA minimum)
- Responsive considerations
- Visual hierarchy

### 3. Risk Assessment
- Technical risks (with mitigation)
- Timeline risks
- Dependency risks
- Unknown unknowns

### 4. Resource Plan
- Skills needed
- Estimated effort per milestone
- Dependencies between milestones

### 5. Output
Append engineering and design review sections to `plans/think-<topic>.md`.
Create `plans/plan-<topic>.md` with:
- Approved approach
- Risk register
- Milestone breakdown
- Resource allocation

## Roles Active
- Engineering Lead (feasibility, architecture)
- Design Lead (UX, accessibility)

## Reference
- gstack `/plan-eng-review`, `/plan-design-review`, `/plan-ceo-review` — implemented in
  `lib/gstack/strategy-engine.js` (`StrategyEngine.engineerReview`/`designReview`/`ceoReview`),
  wired into `lib/vibe-commands/plan.js`
