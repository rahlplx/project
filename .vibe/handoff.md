# Sprint 2: Explain Skills

Implement 3 skills that help vibe coders understand code, translate between languages, and capture intent. All wrap existing community conventions — no re-invention.

## Skills to Build

### 1. code-explainer
- Takes code input, returns plain English summary
- Wraps AST parsing to identify functions, classes, control flow
- Returns structured breakdown: what it does, key parts, inputs/outputs

### 2. code-translator
- Converts code between languages (JS ↔ Python, etc.)
- Maps common patterns: loops, conditionals, functions, classes
- Returns side-by-side comparison

### 3. intent-capture
- Takes natural language description
- Extracts: project type, features, tech stack, constraints
- Returns structured spec object for downstream skills

All 3: class-based, zero external deps, standalone, tests.
