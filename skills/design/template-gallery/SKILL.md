# template-gallery

Browse and select from starter templates for common project types

## When to use

Use this skill when you need to browse and select from starter templates for common project types.

## Key method

`constructor(input)` — runs the template-gallery analysis and returns a structured result.

## Example

```js
const TemplateGallery = require('./index.js');
const skill = new TemplateGallery();
const result = skill.constructor(input);
console.log(result);
```
