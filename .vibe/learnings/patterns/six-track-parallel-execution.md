# Pattern: Six-Track Parallel Execution

## Problem
Need to implement multiple independent features simultaneously without conflicts or regressions.

## Solution
1. **Pre-verify file isolation** — ensure no two tracks write to the same file path
2. **Parallel subagent dispatch** — each track gets its own isolated context
3. **One post-merge reconciliation pass** — run full test suite, fix test convention mismatches, reconcile counts
4. **Commit as single atomic change** — all 6 tracks land together

## When to Use
Any large enhancement with 3+ independent features that touch different file trees.

## Files Changed
- 50 files across 6 independent directory trees

## Tested On
Vibe-Stack Curated Collection, 2026-06-14. 765 tests passing post-merge.
