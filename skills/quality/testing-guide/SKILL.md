# testing-guide

Generates test case suggestions for your code

## When to use
Use this skill when you need to generates test case suggestions for your code.

## Key method
`constructor(input)` — runs the testing-guide analysis and returns a structured result.

## Example
```js
const TestingGuide = require('./index.js');
const skill = new TestingGuide();
const result = skill.constructor(input);
console.log(result);
```
