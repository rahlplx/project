# Anti-Pattern: Mixed Test Conventions

## Symptom
Subagents created test files in two different styles:
- Jest globals (`describe`, `test`, `expect` without imports)
- node:test (`const { describe, it } = require('node:test'); const assert = require('assert');`)

This caused 5 test suites to fail under Jest with "Your test suite must contain at least one test".

## Root Cause
No upfront convention was declared before parallel subagent dispatch. Each subagent picked a style based on its training data. Track A/B/D used Jest style; Track C/E/F used node:test style.

## How vibenexus Should Catch It
- Declare `test_convention: "node:test"` in the handoff spec before parallel dispatch
- Add harness check: scan all `*.test.js` for missing `require('node:test')` import
- Run both `npx jest` AND `node --test` after merge to catch orphans

## Incident
2026-06-14, 6-track enhancement. 5 suites failed Jest, required retroactive package.json fix.
