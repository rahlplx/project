# code-review

Detailed code review with line-level feedback and suggestions

## When to use

Use this skill when you need to detailed code review with line-level feedback and suggestions.

## Key method

`constructor(input)` — runs the code-review analysis and returns a structured result.

## Example

```js
const CodeReview = require('./index.js');
const skill = new CodeReview();
const result = skill.constructor(input);
console.log(result);
```
