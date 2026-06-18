# verification

Verifies that behavior matches the project spec and requirements

## When to use
Use this skill when you need to verifies that behavior matches the project spec and requirements.

## Key method
`constructor(input)` — runs the verification analysis and returns a structured result.

## Example
```js
const Verification = require('./index.js');
const skill = new Verification();
const result = skill.constructor(input);
console.log(result);
```
