# one-click-vercel

Deploy any project to Vercel — wraps the Vercel CLI

## When to use
Use this skill when you need to deploy any project to vercel — wraps the vercel cli.

## Key method
`constructor(input)` — runs the one-click-vercel analysis and returns a structured result.

## Example
```js
const OneClickVercel = require('./index.js');
const skill = new OneClickVercel();
const result = skill.constructor(input);
console.log(result);
```
