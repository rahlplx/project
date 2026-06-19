# Pattern: edit-tool-for-yaml-blocks

## Problem
Inline string construction in Node.js for YAML edits leads to escape-sequence errors (single quotes, `\"`, `$` signs). `js-yaml.dump()` doesn't preserve YAML block style (`>`) reliably.

## Solution
Use the `edit` tool with exact `oldString`/`newString` matching the raw file content. Read the file first to get exact indentation and block style, then replace the full entry block.

## When to Use
Editing YAML files with block-style (`>`) multi-line strings. Never use inline `node -e` string construction for YAML.

## Files Changed
- `catalog/tools.yaml` — all 3 D-grade tool entries updated via edit tool

## Tested On
vibenexus, 2026-06-14
