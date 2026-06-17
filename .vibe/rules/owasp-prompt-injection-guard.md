# Rule: OWASP LLM01 Prompt Injection Guard

## Type
Security (OWASP Top 10 for LLMs — LLM01)

## Trigger
Any code path where external data (git commit messages, file contents, catalog
descriptions, KB entries) is interpolated into a prompt or span attribute.

## Required checks before injection
1. **Strip control sequences** — remove `\x1b[`, `\r`, null bytes from any string
   going into enrichedContext
2. **Reject injection keywords** — if the string contains
   `ignore previous instructions`, `you are now`, `disregard`, `new task:`,
   `[[`, `]]`, `<|`, `|>` — drop that entry and log a `prompt_injection_attempt`
   OTel event
3. **Length cap** — truncate any single injected string at 200 chars
4. **Source tagging** — prefix every injected block with its source
   (`[GIT]`, `[KB]`, `[GOAL]`) so downstream models can attribute provenance

## Code pattern (QueryEnricher._render)
```js
const INJECTION_SIGNALS = /ignore previous|you are now|disregard|new task:|<\||\|>|\[\[|\]\]/i;
function sanitize(str) {
  if (INJECTION_SIGNALS.test(str)) { /* log + return '' */ }
  return str.replace(/[\x00\x1b\r]/g, '').slice(0, 200);
}
```

## What NOT to sanitize
Regex patterns and code snippets stored in KB intentionally contain special chars.
Only sanitize strings that will be embedded as natural-language context.

## Origin
OWASP Top 10 for LLMs — LLM01:2025 Prompt Injection.
Anti-pattern: `unsanitized-external-context` — KB and git messages are untrusted input.
Quality score: 0.0 (rule created, sanitize() not yet wired into QueryEnricher)
