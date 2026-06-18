# git-ops

Git operations without CLI knowledge — wraps git CLI

## When to use
Use this skill when you need to git operations without cli knowledge — wraps git cli.

## Key method
`constructor(input)` — runs the git-ops analysis and returns a structured result.

## Example
```js
const GitOps = require('./index.js');
const skill = new GitOps();
const result = skill.constructor(input);
console.log(result);
```
