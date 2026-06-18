# vibe:detect — Stack Auto-Detection

Detects project tech stack so build, design, and QA phases adapt accordingly.

## When to Run

During init or when entering a new/unknown project directory.

## Detection Checks

### 1. Package Manager
- `package-lock.json` → npm
- `yarn.lock` → yarn
- `pnpm-lock.yaml` → pnpm
- `bun.lockb` → bun

### 2. Language
- `tsconfig.json` → TypeScript
- `*.ts` files exist → TypeScript
- `requirements.txt` → Python
- `Cargo.toml` → Rust
- `go.mod` → Go
- Default → JavaScript (Node.js)

### 3. UI Framework
- `next.config.*` → Next.js
- `astro.config.*` → Astro
- `vite.config.*` → Vite (check for react/vue/svelte in package.json)
- `nuxt.config.*` → Nuxt
- `svelte.config.*` → SvelteKit
- `remix.config.*` → Remix
- `angular.json` → Angular
- Default → None / unknown

### 4. Test Framework
- `vitest.config.*` → vitest
- `jest.config.*` → jest
- `.mocharc.*` → mocha
- `ava.config.*` → ava
- `playwright.config.*` → playwright (E2E)
- `cypress.config.*` → cypress (E2E)
- `*.test.ts` or `*.test.js` → node:test (default)
- Default → unknown

### 5. Build Command
- From package.json scripts: `build`, `compile`, `dist`
- Or framework default

### 6. Output
Write `.vibe/stack.json` with all detected values.
If detection is ambiguous, ask user to clarify.

## Reference
- v1.1: Automatic stack detection
- Used by: build (test command), design (has_ui), qa (has_ui)
