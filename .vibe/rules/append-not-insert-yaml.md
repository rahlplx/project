# Rule: Append New Tools to End of YAML File, Not Mid-File

## Type
Process rule (build phase)

## Trigger
When editing `catalog/tools.yaml` to add a new tool entry.

## Check
Always append new entries to the END of the file. Do NOT insert between
existing entries.

Rationale: Mid-file insertion requires matching exact whitespace, indentation,
and surrounding context. It fails when trailing spaces differ, tabs vs spaces,
or nearby section headers change. Appending avoids all these problems because
it doesn't depend on surrounding context.

YAML object order has no semantic meaning. Alphabetical ordering provides
zero runtime benefit.

## Failure Mode
Edit tool fails: "Found multiple matches for oldString" or "oldString not
found in content" due to whitespace mismatch in surrounding context.

## Origin
anti-pattern: `mid-file-yaml-edits` — 3 edit failures in a single session.

## Quality Score
0.0 (new rule, pending measurement)
