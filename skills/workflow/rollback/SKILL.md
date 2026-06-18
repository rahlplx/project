# rollback

One-click rollback — undo changes safely

## When to use

Use this skill when you need to one-click rollback — undo changes safely.

## Key method

`constructor(input)` — runs the rollback analysis and returns a structured result.

## Example

```js
const Rollback = require('./index.js');
const skill = new Rollback();
const result = skill.constructor(input);
console.log(result);
```
