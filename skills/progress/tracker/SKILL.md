# tracker

Tracks tasks through a visual kanban board (todo → in-progress → review → done)

## When to use

Use this skill when you need to tracks tasks through a visual kanban board (todo → in-progress → review → done).

## Key method

`constructor(input)` — runs the tracker analysis and returns a structured result.

## Example

```js
const TaskTracker = require('./index.js');
const skill = new TaskTracker();
const result = skill.constructor(input);
console.log(result);
```
