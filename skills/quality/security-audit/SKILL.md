# security-audit

OWASP Top 10 aligned security audit with code pattern scanning

## When to use
Use this skill when you need to owasp top 10 aligned security audit with code pattern scanning.

## Key method
`constructor(input)` — runs the security-audit analysis and returns a structured result.

## Example
```js
const SecurityAudit = require('./index.js');
const skill = new SecurityAudit();
const result = skill.constructor(input);
console.log(result);
```
