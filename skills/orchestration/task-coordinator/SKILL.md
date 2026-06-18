# task-coordinator

Orchestrate multi-step workflows with dependency management

## When to use
Use this skill when you need to orchestrate multi-step workflows with dependency management.

## Key method
`constructor(input)` — runs the task-coordinator analysis and returns a structured result.

## Example
```js
const TaskCoordinator = require('./index.js');
const skill = new TaskCoordinator();
const result = skill.constructor(input);
console.log(result);
```
