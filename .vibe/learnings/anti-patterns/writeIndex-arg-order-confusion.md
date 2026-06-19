# Anti-Pattern: writeIndex-arg-order-confusion

## Symptom
`writeIndex('.', '.well-known/agent-skills/index.json')` corrupted the index file by writing the path string as the JSON content.

## Root Cause
`writeIndex(projectRoot, index)` has the index object as the second argument. Callers passing a file path string as the second arg (expecting `writeIndex(path, data)` ordering) silently succeed with garbage data.

## How vibenexus Should Catch It
Add parameter validation: `writeIndex` should throw TypeError if `index` is not an object. Add a harness check that validates index.json parses as valid JSON with expected structure.

## Incident
vibenexus, 2026-06-14 — index.json was single string `".well-known/agent-skills/index.json"` for several minutes before detection
