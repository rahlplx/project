# dashboard

Visual project progress dashboard — reads tracker data and renders status

## When to use
Use this skill when you need to visual project progress dashboard — reads tracker data and renders status.

## Key method
`constructor(input)` — runs the dashboard analysis and returns a structured result.

## Example
```js
const Dashboard = require('./index.js');
const skill = new Dashboard();
const result = skill.constructor(input);
console.log(result);
```
