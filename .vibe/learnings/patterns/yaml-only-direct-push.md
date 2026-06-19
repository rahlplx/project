# Pattern: Direct-to-Main for Catalog-Only Changes

## Problem
Creating a PR for every small catalog addition adds overhead (branch naming, PR description, merge commit). For YAML-only changes with zero code impact, the PR provides no safety benefit.

## Solution
Skip the PR branch workflow. Commit directly to main when:
1. The change touches only `catalog/tools.yaml` (or other data-only files)
2. YAML syntax is validated
3. Test suite still passes (confirming no cascading breakage)
4. Diff is reviewed inline before committing

## When to Use
Any commit that modifies only catalog entries, config files, docs, or other non-executable data. NOT for code changes, skill modifications, or anything that runs.

## Files Changed
- `catalog/tools.yaml` — 3 direct-to-main commits across 35 entries

## Tested On
vibenexus-curated-collection, 2026-06-13
