# Redundant Harness Check

## Anti-Pattern

Adding a harness check that duplicates an existing check's logic with no
additional diagnostic value. Noise without safety.

## Example

- `catalog-yaml-valid`: validates `catalog/tools.yaml` is parseable YAML
- `yaml-valid`: validates `catalog/tools.yaml` is parseable YAML (identical)

Two checks, one diagnostic payload. The second check added zero coverage while
inflating the check count from 12 to 14.

## Why It Happens

- Checks are added independently without cross-referencing existing checks
- No requirement that new checks demonstrate unique diagnostic value
- Harness suite grows monotonically without retirement mechanism

## How to Avoid

- Before adding a harness check, confirm no existing check covers the same
  surface
- Each check must answer a question no other check answers
- Retire checks that never fail (they're noise, not safety)
- Prefer merging checks (broaden existing) over stacking checks (duplicate)
