# model-router

Route tasks to optimal AI models based on capability and cost

## When to use

Use this skill when you need to route tasks to optimal ai models based on capability and cost.

## Key method

`constructor(input)` — runs the model-router analysis and returns a structured result.

## Example

```js
const ModelRouter = require('./index.js');
const skill = new ModelRouter();
const result = skill.constructor(input);
console.log(result);
```
