# guardrails

Safety confirmations for destructive actions — prevents accidents

## When to use
Use this skill when you need to safety confirmations for destructive actions — prevents accidents.

## Key method
`constructor(input)` — runs the guardrails analysis and returns a structured result.

## Example
```js
const Guardrails = require('./index.js');
const skill = new Guardrails();
const result = skill.constructor(input);
console.log(result);
```
