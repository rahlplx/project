# Pattern: quality-score-two-step-write

## Problem
`computeAllToolScores(path, {qualityScoresPath})` computes scores in memory but does not persist them. Callers expect the `qualityScoresPath` option to also write, but it doesn't.

## Solution
Always call `writeQualityScores(result, outputPath)` after `computeAllToolScores()`. These are separate functions with separate responsibilities: compute vs persist.

## When to Use
Any time quality scores need to be regenerated and saved to disk.

## Files Changed
- `lib/quality-score.js` — computeAllToolScores reads existing scores if path given but never writes

## Tested On
vibe-stack, 2026-06-14
