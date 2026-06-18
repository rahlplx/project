---
name: vibe-explain
description: "Explain, translate, or extract intent from any code — at beginner, intermediate,
  or expert level. Use when: onboarding someone new, understanding unfamiliar code, translating
  between languages, or capturing what code was MEANT to do vs what it does. Auto-triggers
  on 'explain this', 'what does this do', 'translate to', 'ELI5', 'what is this code doing'.
  Wraps: code-explainer, code-translator, intent-capture skills."
argument-hint: "[explain|translate|intent|eli5] [--level beginner|intermediate|expert] [--to js|ts|py|php|ruby]"
version: 1.0.0
allowed-tools:
  - Read
  - Bash(node skills/explain/code-explainer/index.js*)
  - Bash(node skills/explain/code-translator/index.js*)
  - Bash(node skills/explain/intent-capture/index.js*)
  - AskUserQuestion
---

# Vibe-Explain — Code Explanation, Translation & Intent Capture

## Dispatcher

- No args or `explain` → explain the provided code (auto-detect level)
- `eli5` → explain like I'm 5 (always beginner, analogies required)
- `translate --to {lang}` → translate code to target language
- `intent` → extract what this code was MEANT to do (spec recovery)
- `--level {beginner|intermediate|expert}` → force explanation depth

---

## Mode 1 — Explain

From `skills/explain/code-explainer/index.js`.

### Level Auto-Detection

Ask (or infer from context):
- **Beginner**: non-developer, student, PM, designer looking at code for the first time
- **Intermediate**: developer unfamiliar with this language or framework
- **Expert**: senior developer doing code review or debugging

### Beginner Explanation

Rules for beginner mode:
- No jargon without immediate plain-English translation in parentheses
- Use real-world analogies for every abstract concept
- Step through what the code does in chronological order (not top-down)
- End with: "In plain English, this code does: {one sentence}"

Template:
```
WHAT THIS CODE DOES (beginner)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Big Picture:
  {One sentence — what is this overall?}
  Think of it like: {real-world analogy}

Step by Step:
  1. First, it {plain English what line/block 1 does}
  2. Then, it {plain English what line/block 2 does}
  ...

Key terms used in this code:
  • {term}: {plain English definition in 1 sentence}

You don't need to understand:
  • {advanced concept 1} — that's for later
```

### Intermediate Explanation

Rules:
- Assume language knowledge, not framework knowledge
- Explain patterns and design decisions ("this is a factory function because...")
- Note complexity: time/space complexity for algorithms
- Flag non-obvious behavior ("this returns a NEW array, not mutating the original")

### Expert Explanation

Rules:
- Focus on non-obvious decisions and tradeoffs
- Surface assumptions ("this assumes input is already sorted")
- Identify potential issues (race conditions, memory leaks, edge cases)
- Compare to alternative implementations

---

## Mode 2 — Translate

From `skills/explain/code-translator/index.js`. Supports: JS ↔ Python ↔ TypeScript ↔ PHP ↔ Ruby.

### Translation Rules (120+ patterns applied automatically)

Key translation mappings applied:

| Concept | JavaScript | Python | TypeScript |
|---------|-----------|--------|------------|
| Variable (mutable) | `let x =` | `x =` | `let x: Type =` |
| Variable (const) | `const x =` | `x =` (by convention) | `const x: Type =` |
| Print | `console.log()` | `print()` | `console.log()` |
| Function | `function f() {}` | `def f():` | `function f(): ReturnType {}` |
| Arrow function | `(x) => x + 1` | `lambda x: x + 1` | `(x: Type) => x + 1` |
| Array map | `.map(fn)` | `[fn(x) for x in arr]` / `map(fn, arr)` | `.map(fn)` |
| Array filter | `.filter(fn)` | `[x for x in arr if fn(x)]` | `.filter(fn)` |
| Null check | `x === null` | `x is None` | `x === null` |
| String template | `` `Hello ${name}` `` | `f"Hello {name}"` | `` `Hello ${name}` `` |
| Class | `class X extends Y` | `class X(Y):` | `class X extends Y` |
| Constructor | `constructor(x)` | `def __init__(self, x):` | `constructor(x: Type)` |
| Async | `async/await` | `async/await` | `async/await` |
| Import | `import { x } from 'y'` | `from y import x` | `import { x } from 'y'` |

After translation: add inline comments on lines where behavior differs between source and target language. Mark with `// ⚠️ DIFFERS:` prefix.

### Translation Output Format

```
TRANSLATION: {source-lang} → {target-lang}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{translated code with comments}

BEHAVIORAL DIFFERENCES:
  • {line N}: {what changed in behavior, not just syntax}
  • ...

CONFIDENCE: {N}% ({what lowered it if not 100%})
UNTRANSLATED: {anything that has no equivalent — flag and explain}
```

---

## Mode 3 — Intent Capture

From `skills/explain/intent-capture/index.js`. Recovers the "spec" from the code.

Extracts:
- **Primary purpose**: What category of problem does this solve? (CRUD / auth / data-transformation / UI / API / validation / etc.)
- **Design patterns used**: singleton, observer, factory, middleware, repository, builder, etc.
- **Implicit assumptions**: What must be true for this code to work correctly?
- **Inputs and outputs**: What goes in, what comes out, what side effects occur?
- **Potential issues**: What will break and when?

Output format:
```
INTENT CAPTURE — {filename or snippet}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PURPOSE: {primary purpose category}
PATTERN: {design pattern(s) detected}

WHAT IT DOES (recovered spec):
  Given: {inputs and preconditions}
  When:  {the code runs}
  Then:  {outputs and side effects}

ASSUMPTIONS (implicit, may break):
  • {assumption 1} — breaks if {when}
  • {assumption 2} — breaks if {when}

POTENTIAL ISSUES:
  ⚠️  {issue}: {description and when it manifests}

SUGGESTED TESTS (from intent):
  1. {test scenario that covers the happy path}
  2. {test scenario that breaks an assumption}
```

---

## ELI5 Mode

Always use:
- Short sentences (max 15 words)
- Real-world analogies (lego bricks, recipe, post office, etc.)
- No code shown — only the concept
- A single memorable sentence at the end that captures the whole thing

Example output:
```
ELI5: {code description}
━━━━━━━━━━━━━━━━━━━━━━━━
Imagine {analogy}.

This code is like {concrete comparison}.

It takes {inputs in plain terms} and gives back {outputs in plain terms}.

If {input is wrong}, it says "{plain English error message meaning}".

One sentence: {The whole thing, simply}.
```
