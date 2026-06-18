# parallel-exec

Run tasks simultaneously — parallel execution coordination

## When to use
Use this skill when you need to run tasks simultaneously — parallel execution coordination.

## Key method
`constructor(input)` — runs the parallel-exec analysis and returns a structured result.

## Example
```js
const ParallelExec = require('./index.js');
const skill = new ParallelExec();
const result = skill.constructor(input);
console.log(result);
```
