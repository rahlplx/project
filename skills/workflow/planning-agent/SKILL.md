# planning-agent

Breaks project descriptions into actionable task plans

## When to use

Use this skill when you need to breaks project descriptions into actionable task plans.

## Key method

`constructor(input)` — runs the planning-agent analysis and returns a structured result.

## Example

```js
const PlanningAgent = require('./index.js');
const skill = new PlanningAgent();
const result = skill.constructor(input);
console.log(result);
```
