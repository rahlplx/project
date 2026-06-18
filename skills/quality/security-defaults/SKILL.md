# security-defaults

OWASP-aligned security checks for AI-generated code

## When to use

Use this skill when you need to owasp-aligned security checks for ai-generated code.

## Key method

`constructor(input)` — runs the security-defaults analysis and returns a structured result.

## Example

```js
const SecurityDefaults = require('./index.js');
const skill = new SecurityDefaults();
const result = skill.constructor(input);
console.log(result);
```
