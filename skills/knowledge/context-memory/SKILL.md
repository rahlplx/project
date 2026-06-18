# context-memory

Persistent context across sessions — remembers preferences and decisions

## When to use
Use this skill when you need to persistent context across sessions — remembers preferences and decisions.

## Key method
`constructor(input)` — runs the context-memory analysis and returns a structured result.

## Example
```js
const ContextMemory = require('./index.js');
const skill = new ContextMemory();
const result = skill.constructor(input);
console.log(result);
```
