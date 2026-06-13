# T10: Add JSDoc typecheck script

## Plan
Add basic JSDoc type annotations to key files and run `tsc --noEmit --checkJs`
to catch type errors without migrating to TypeScript.

## Files
- `tsconfig.json` — new, minimal config for JSDoc type checking
- `package.json` — add `npm run typecheck` script
- Key `.js` files — add `// @ts-check` + JSDoc type annotations

## Files to annotate (MVP)
- `lib/tool-registry.js` — full JSDoc types
- `bin/skill-loader.js` — function signatures only
- `bin/vibe-stack.js` — function signatures only

## Config
```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "target": "es2022",
    "module": "esnext",
    "strict": false,
    "moduleResolution": "node"
  },
  "include": ["lib/**/*.js", "bin/**/*.js"],
  "exclude": ["node_modules", ".vibe"]
}
```

## Verify
- `npm run typecheck` exits 0
- `npm test` still passes
- JSDoc annotations are correct (no `any` escape hatches)
