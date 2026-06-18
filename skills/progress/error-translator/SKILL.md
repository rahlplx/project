# error-translator

Convert technical error messages to plain English — references MDN and common patterns

## When to use

Use this skill when you need to convert technical error messages to plain english — references mdn and common patterns.

## Key method

`constructor(input)` — runs the error-translator analysis and returns a structured result.

## Example

```js
const ErrorTranslator = require('./index.js');
const skill = new ErrorTranslator();
const result = skill.constructor(input);
console.log(result);
```
