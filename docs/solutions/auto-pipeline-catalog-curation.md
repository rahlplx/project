# Solution: Using the Auto Pipeline for Catalog Curation

## Context
The vibe-stack auto pipeline (think→plan→break→build→harness→review→ship→retro) was
designed for software features with code and tests. We needed to adapt it for YAML-only
catalog work — adding tool entries, updating descriptions, verifying metadata.

## Solution
The pipeline maps cleanly to curation:
- **think**: Research tools by category. Check GitHub stars, license, activity date.
- **plan**: Decide which tools to add. Set target (5 per category).
- **break**: Slice into individual tool additions (one at a time inside build step).
- **build**: Edit `catalog/tools.yaml`, add entries with agent-native descriptions.
- **harness**: Validate YAML syntax, count per category, run test suite (even though
  tests don't cover catalog, ensure app still works).
- **review**: Spot-check descriptions for tone, accuracy, agent-usability.
- **ship**: Commit and push. Direct to main (no PR) for zero-code-risk changes.
- **retro**: Capture learnings.

## Key Insight
The auto pipeline is domain-agnostic. Its value is the structured thinking, not the
specific implementation steps. For curation work, skip the heavy CI/QA and focus on
data quality validation (YAML validity, category counts, description consistency).

## Files Changed
- `.vibe/state.json` — tracks pipeline phase and completed items
- `references/vibe-curation.md` — adapted auto pipeline for curation workflow
- `plans/think-deeper-catalog.md` — plan doc
