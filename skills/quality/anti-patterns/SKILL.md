# anti-patterns

Detects common coding anti-patterns and suggests better alternatives

## When to use
Use this skill when you need to detects common coding anti-patterns and suggests better alternatives.

## Key method
`constructor(input)` — runs the anti-patterns analysis and returns a structured result.

## Example
```js
const AntiPatterns = require('./index.js');
const skill = new AntiPatterns();
const result = skill.constructor(input);
console.log(result);
```
