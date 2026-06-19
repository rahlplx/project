# Anti-Pattern: Incremental Catalog Expansion (3 Runs Instead of 1)

## Symptom
Catalog was expanded in 3 separate auto pipeline runs:
1. 11 → 23 tools (initial gap fill)
2. 23 → 25 tools (orchestration + agent-frameworks)
3. 25 → 35 tools (5 per category, deeper catalog)

Each run had the same think→research→add→commit cycle. The research and editing cost was nearly identical per tool regardless of batch size.

## Root Cause
Breaking work into "safe" increments. Each run felt smaller and lower-risk. But catalog-only changes never risked breakage — there was no reason to gate.

## How vibenexus Should Catch It
Before starting a curation run, estimate the total number of new tools needed. If >5, batch into a single pipeline run. The constraint is research time per tool (~3 min), not pipeline safety.

## Incident
vibenexus-curated-collection, 2026-06-13 — 3 commits that could have been 1, each with its own think→plan→break→build cycle.
