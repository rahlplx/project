# Anti-Pattern: Combining Regex by Slicing `.source`

## Symptom
Regex `SyntaxError: Unterminated group` when combining two separate regex patterns by slicing their `.source` property and concatenating:

```js
const combined = new RegExp(
  '(' + PATTERN_A.source.slice(1, -1) + '|' + PATTERN_B.source.slice(1, -1) + ')', 'gi'
);
```

## Root Cause
Each regex's `.source` includes its own internal groups and boundaries (like `\b(word1|word2)\b`). Slicing off the first and last characters removes the outer `\b` boundary but leaves internal group boundaries misaligned — a closing `)` or `|` at the boundary creates an unterminated group when concatenated.

## How vibenexus Should Catch It
- Prefer two separate `.replace()` calls instead of combining regexes
- When combining is unavoidable, wrap each in a non-capturing group `(?:...)` and avoid stripping boundaries

## Incident
VibeNexus Curated Collection, 2026-06-14 — Phase 2 build. Tests failed with `SyntaxError: Invalid regular expression: /(b(...|...)b(...|...))/gi: Unterminated group`. Fixed by using two separate `.replace(ENTITY_PATTERN, ' ').replace(JS_BOILERPLATE, ' ')` calls.

## Prevention
If you must combine regexes:
```js
const combined = new RegExp(
  '(?:' + PATTERN_A.source + ')|(?:' + PATTERN_B.source + ')', 'gi'
);
```
