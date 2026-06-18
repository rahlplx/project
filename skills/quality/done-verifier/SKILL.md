# done-verifier

14-point checklist verifying a feature is truly production-ready before shipping

## When to use
Use this skill when you need to 14-point checklist verifying a feature is truly production-ready before shipping.

## Key method
`constructor(input)` — runs the done-verifier analysis and returns a structured result.

## Example
```js
const DoneVerifier = require('./index.js');
const skill = new DoneVerifier();
const result = skill.constructor(input);
console.log(result);
```
