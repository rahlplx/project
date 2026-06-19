# Anti-Pattern: Inserting Tools Mid-File in YAML

## Symptom
Editing `catalog/tools.yaml` required reading 50+ surrounding lines to find exact whitespace for edit operations. Each insertion risked failing because of trailing space, tab-vs-space indentation, or nearby section headers.

## Root Cause
Tools were organized alphabetically within categories. A new tool required finding the exact insertion point between existing entries and matching indentation precisely.

## How vibenexus Should Catch It
Prefer appending to the end of the file when adding new entries. YAML order doesn't matter — alphabetical organization provides no benefit over chronologically-added entries at the end.

## Incident
vibenexus-curated-collection, 2026-06-13 — 3 edit operations failed on first attempt due to whitespace mismatch in surrounding context.
