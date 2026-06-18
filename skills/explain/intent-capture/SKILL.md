# intent-capture

Extract structured project specs from natural language descriptions

## When to use
Use this skill when you need to extract structured project specs from natural language descriptions.

## Key method
`constructor(input)` — runs the intent-capture analysis and returns a structured result.

## Example
```js
const IntentCapture = require('./index.js');
const skill = new IntentCapture();
const result = skill.constructor(input);
console.log(result);
```
