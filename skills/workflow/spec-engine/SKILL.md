# Spec Engine

A skill for parsing natural language intent into structured specification documents.

## Methods

- `generate(intentPrompt)` — Parse a natural language description into a structured spec.json
- `validate(spec)` — Check spec for completeness and internal consistency
- `toSpecFile(spec, filePath)` — Write a spec to a JSON file
- `fromSpecFile(filePath)` — Read a spec from a JSON file

## Output

The `generate` method produces a spec object with:

- `title` — project name extracted from intent
- `features[]` — parsed features with auto-assigned IDs (FEAT-001, etc.) and priorities
- `requirements[]` — extracted from "must/should/need" statements
- `constraints[]` — extracted from "must be/must not" statements
- `contradictions[]` — detected conflicts between constraints
- `actors[]` — user roles mentioned in the intent
- `dependencies[]` — external dependencies mentioned
