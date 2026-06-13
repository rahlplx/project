# Rule: Batch Catalog Additions Into Single Pipeline Runs

## Type
Process rule (think/plan phase)

## Trigger
When planning a curation pipeline run.

## Check
Estimate the total number of new tools needed. If >5, batch into a single
pipeline run. Do not break into 3+ incremental runs.

Rationale: Each pipeline run has overhead (think→plan→break→build→ship→retro).
Research time per tool (~3 min) is the constraint, not pipeline safety.
Running the same pipeline 3x for 12 tools wastes 2x of that overhead.

## Failure Mode
Incremental runs that add 2-4 tools each. Each run re-does the same
think/research/setup phases for diminishing returns.

## Origin
anti-pattern: `incremental-catalog-runs` — 3 runs when 1 would suffice.

## Quality Score
0.0 (new rule, pending measurement)
