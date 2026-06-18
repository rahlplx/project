# code-translator

Translate code between programming languages — maps common patterns

## When to use

Use this skill when you need to translate code between programming languages — maps common patterns.

## Key method

`constructor(input)` — runs the code-translator analysis and returns a structured result.

## Example

```js
const CodeTranslator = require('./index.js');
const skill = new CodeTranslator();
const result = skill.constructor(input);
console.log(result);
```
