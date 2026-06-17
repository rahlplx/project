# SCOPE: Work Unit Definition

> Fill all 8 required fields before advancing to BUILD.

## Goal

<!-- What's the outcome? One clear sentence. -->

## Deliverables

<!-- Specific files to change or create. Bullet list. -->

- [ ] file/to/path.js — reason for change

## Completion Criteria

<!-- How do we know it's done? Concrete, testable conditions. -->

- [ ] Criterion 1
- [ ] Criterion 2

## Test Convention

<!-- Which test framework to use and how to run tests. -->

- Framework: `jest` or `node:test`
- Run command: `npm test`
- Pattern to follow: [link to exemplar test file]

## Risk Register

<!-- Known risks for this unit. -->

| #   | Risk | Likelihood | Impact | Mitigation |
| --- | ---- | ---------- | ------ | ---------- |
| R1  |      |            |        |            |

## Setup Steps

<!-- Pre-requisites that must be done before BUILD starts. -->

- [ ] Step 1

## Plan Delta

<!-- If scope changes mid-BUILD, write SCOPE-DELTA.md with: What Changed, Why, Impact -->

Referenced: `docs/workflow/SCOPE-DELTA.md`

## Sign-off

- [ ] **User confirmed**: scope is correct, BUILD may proceed
- [ ] **Agent confirmed**: all required fields are filled, no BLOCKED entries

---

## Quick Mode (for small tasks)

Use when the change is <5 files and <100 lines total.
Required fields only: Goal, Deliverables, Completion Criteria, Test Convention, Sign-off.
Risk Register and Setup Steps may be skipped with "quick: true" annotation.
