# nit — AI Test Agent

Auto-detects your stack and generates tests. Covers unit, integration, and E2E with self-healing selectors.

## Methods

| Method                | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `detectStack()`       | Analyzes project structure to identify framework and language |
| `generateTests(type)` | Writes tests for detected stack (unit/integration/e2e)        |
| `healSelectors()`     | Self-heals broken CSS/XPath selectors in tests                |
| `runCoverage()`       | Reports untested functions and coverage gaps                  |

## Example

```js
const nit = new Nit();
nit.detectStack(); // "React + Jest detected"
nit.generateTests('unit'); // 12 tests written
```
