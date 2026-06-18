# git-free-deploy

Deploy static sites without git — wraps surge.sh, npx serve, and Netlify Drop

## When to use
Use this skill when you need to deploy static sites without git — wraps surge.sh, npx serve, and netlify drop.

## Key method
`constructor(input)` — runs the git-free-deploy analysis and returns a structured result.

## Example
```js
const GitFreeDeploy = require('./index.js');
const skill = new GitFreeDeploy();
const result = skill.constructor(input);
console.log(result);
```
