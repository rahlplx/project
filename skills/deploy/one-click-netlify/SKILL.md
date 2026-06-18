# one-click-netlify

Deploy any project to Netlify — wraps the Netlify CLI

## When to use
Use this skill when you need to deploy any project to netlify — wraps the netlify cli.

## Key method
`constructor(input)` — runs the one-click-netlify analysis and returns a structured result.

## Example
```js
const OneClickNetlify = require('./index.js');
const skill = new OneClickNetlify();
const result = skill.constructor(input);
console.log(result);
```
