# Anti-Pattern: Writing Descriptions Before Verifying Tool Metadata

## Symptom
Two tools (OpenPencil at "5.4k+ stars", Refact.ai) had less metadata available than expected at search time. Descriptions were written based on partial information, requiring later correction.

## Root Cause
The workflow was: pick a tool → write description → verify later. Should be: pick tool → verify repo_url/stars/license/activity → confirm it meets criteria → write description once.

## How vibe-stack Should Catch It
Add a pre-flight checklist to the curation workflow in `references/vibe-curation.md`:
1. Confirm repo_url resolves
2. Confirm license is compatible
3. Confirm stars ≥ threshold
4. Confirm last commit ≤ 6 months
5. THEN write description

## Incident
vibe-stack-curated-collection, 2026-06-13 — 2 entries needed post-hoc verification that should have been pre-hoc.
