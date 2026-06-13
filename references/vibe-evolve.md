# vibe:evolve — Rule Evolution Engine

Automatically evaluates rules, retires underperformers, and proposes new checks based on accumulated data.

## When to Run

After multiple projects/phases complete (typically after 3+ retros). Not a per-project command.

## Steps

### 1. Analyze Patterns
- Read all `.vibe/learnings/patterns.md` entries
- Count frequency of each pattern/anti-pattern
- Identify recurring issues that no rule catches
- Identify rules that never triggered

### 2. Propose Changes
- New rules: For patterns that recur but have no rule
- Retire rules: For rules that never triggered in 3+ projects
- Update rules: For rules that triggered but had false positives
- Remove rules: For rules whose anti-pattern no longer applies

### 3. Evaluate Impact
- For each proposed change:
  - Would it have caught a real bug?
  - Would it have prevented a slowdown?
  - False positive cost?
  - Implementation complexity?

### 4. Apply Changes
- Update the relevant SKILL.md or reference file
- Add new checks to vibe-harness if applicable
- Log changes in `.vibe/learnings/evolutions.md`

## Reference
- v1.1: Data-driven rule evolution
- Pattern frequency analysis
- Quality score trends
