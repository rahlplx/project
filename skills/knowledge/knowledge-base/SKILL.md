# knowledge-base

Project documentation generator — creates README, API docs, and guides

## When to use

Use this skill when you need to project documentation generator — creates readme, api docs, and guides.

## Key method

`constructor(input)` — runs the knowledge-base analysis and returns a structured result.

## Example

```js
const KnowledgeBase = require('./index.js');
const skill = new KnowledgeBase();
const result = skill.constructor(input);
console.log(result);
```
