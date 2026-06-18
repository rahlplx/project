# health-check

Check if your project dependencies and environment are healthy

## When to use
Use this skill when you need to check if your project dependencies and environment are healthy.

## Key method
`constructor(input)` — runs the health-check analysis and returns a structured result.

## Example
```js
const HealthCheck = require('./index.js');
const skill = new HealthCheck();
const result = skill.constructor(input);
console.log(result);
```
