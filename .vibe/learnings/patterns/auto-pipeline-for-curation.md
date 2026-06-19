# Pattern: Auto Pipeline Maps to Catalog Curation

## Problem
The vibenexus auto pipeline (think→plan→break→build→harness→review→ship→retro) was designed for software features with tests and code. Curation work (adding tool entries to a YAML catalog) doesn't have tests or build steps.

## Solution
The pipeline phases still map cleanly:
- **think**: Research tools by category (GitHub stars, license, activity date)
- **plan**: Set targets (e.g., "5 tools per category")
- **break**: Slice into individual tool additions
- **build**: Edit `catalog/tools.yaml`
- **harness**: Validate YAML syntax + count per category + run test suite
- **review**: Spot-check descriptions for tone and accuracy
- **ship**: Commit and push (direct to main for zero-code-risk)
- **retro**: Capture learnings

## When to Use
Any curation or data-entry pipeline. The structured thinking is the value — adapt the execution steps to match the work type.

## Files Changed
- `references/vibe-curation.md` — adapted pipeline for curation

## Tested On
vibenexus-curated-collection, 2026-06-13
