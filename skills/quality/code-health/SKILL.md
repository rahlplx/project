# code-health

Static code health checks: no eval, no innerHTML, no empty catch, line length

## When to use

Use this skill when you need to static code health checks: no eval, no innerhtml, no empty catch, line length.

## Key method

`constructor(input)` — runs the code-health analysis and returns a structured result.

## Example

```js
const CodeHealth = require('./index.js');
const skill = new CodeHealth();
const result = skill.constructor(input);
console.log(result);
```
