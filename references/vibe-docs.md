# Doc Generation

Generate PROJECT.md, PRD.md, and MARKET_RESEARCH.md from intent and research.

## Doc Generation Protocol

### Step 1: Gather Input

1. **Intent**: From intent capture (PROJECT.md data)
2. **Research**: From market research (competitors, tools, recommendations)
3. **Templates**: From templates directory

### Step 2: Generate Documents

1. **PROJECT.md**: Problem, users, stakes, solution, MVP, out of scope, success metrics
2. **PRD.md**: Overview, user stories, acceptance criteria, tech stack, performance, security
3. **MARKET_RESEARCH.md**: Market overview, competitors, tools, recommendations, risks, next steps

### Step 3: Write Files

1. Create output directory if needed
2. Write each document
3. Verify files were created

## PROJECT.md Template

```markdown
# {{projectName}}

## Problem
{{problem}}

## Users
{{users}}

## Stakes
{{stakes}}

## Solution
{{solution}}

## MVP
{{mvp}}

## Out of Scope
{{outOfScope}}

## Success Metrics
{{successMetrics}}

## Tech Stack
{{techStack}}

## Timeline
{{timeline}}
```

## PRD.md Template

```markdown
# PRD: {{projectName}}

## Overview
{{overview}}

## User Stories
{{userStories}}

## Acceptance Criteria
{{acceptanceCriteria}}

## Tech Stack
{{techStack}}

## Performance
{{performance}}

## Security
{{security}}

## Out of Scope
{{outOfScope}}
```

## MARKET_RESEARCH.md Template

```markdown
# Market Research: {{projectName}}

## Market Overview
{{marketOverview}}

## Competitor Analysis
{{competitors}}

## Open Source Tools
{{openSourceTools}}

## Recommendations
{{recommendations}}

## Risks
{{risks}}

## Next Steps
{{nextSteps}}
```

## Token Budget

- Reference: lazy-loaded on demand
- Size: ~180 lines
- Re-attach: only when generating docs
