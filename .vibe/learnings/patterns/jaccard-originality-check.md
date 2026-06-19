# Pattern: Jaccard Similarity Originality Check

## Problem
How to programmatically detect duplicate or near-duplicate skill implementations across a large collection of agent skills.

## Solution
Use shingle-based Jaccard similarity with entity and boilerplate neutralization:

1. **Normalize**: strip JS keywords (`const`, `require`, `class`, etc.) and tech entity names (`netlify`, `react`, `docker`, etc.)
2. **Tokenize**: split into word tokens
3. **Shingle**: create 8-word sliding windows as a set
4. **Jaccard**: `|intersection| / |union|` between every pair of files

## When to Use
- Verifying collection diversity before adding new skills
- Pre-commit check to prevent accidental duplicates
- Post-curation audit to detect scope creep

## Implementation
- `lib/check-originality.js` — Node.js, no dependencies
- Thresholds: `FAIL >= 40%`, `WARN >= 20%` (env-configurable)
- CLI mode: `node lib/check-originality.js`
- Harness integration: check #6 in auto-maintain.js

## What Worked
- Two separate regex replacements (entity + boilerplate) instead of one combined regex — avoided regex syntax errors
- Configurable thresholds via env vars — flexible for different strictness levels
- `Set`-based shingle deduplication — identical shingles collapse naturally

## What Didn't Work
- Combining two regex patterns by slicing `.source` and concatenating — produces malformed patterns with unterminated groups

## Files Changed
- `lib/check-originality.js` — main implementation
- `lib/check-originality.test.js` — 19 tests
- `.vibe/lifecycle/auto-maintain.js` — harness check #6
- `lib/auto-maintain.test.js` — updated for 6 checks

## Tested On
VibeNexus Curated Collection, 2026-06-14 — 45 skills, worst similarity 13.8%
