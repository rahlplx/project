# Rule: Auto-Injection Standards

## Type
Orchestration (QueryEnricher pipeline)

## When to inject
Inject enriched context into every agent query that passes through `lib/orchestrator/query-enricher.js`.
Never inject into raw user-facing output — only into the internal prompt prefix.

## What to inject (priority order)
1. **Goal block** (weight 0.25) — current project goal from ContextManager
2. **Skill route** (weight 0.30) — matched skills from SkillRouter ROUTING_TABLE
3. **Git context** (weight 0.20) — top-changed files + commit type distribution from GitLearnings
4. **Knowledge base** (weight 0.15) — Jaccard-matched entries from session KB
5. **CoT scaffold** (weight 0.10) — ChainOfThought reasoning prefix from DSPy-style Signature

## What NOT to inject
- Raw file contents (token budget violation)
- PII or credentials detected by SecurityAudit
- Context older than 7 days (stale signal, mark as [STALE])
- Duplicate context already in the user message

## Confidence gate
If `enriched.confidence < 0.3`, skip injection entirely — low-signal context adds noise.
Log a `low_confidence` span attribute via OTel tracer.

## Token budget
Keep injected context under 500 tokens. Truncate KB entries at 80 chars.
If `RoleLoader.checkContextBudget()` returns `{ warn: true }`, halve the injection.

## Origin
Pattern: `auto-prompt-injection` — DSPy ChainOfThought + SWE-agent context injection.
Quality score: 4.8/5 (implemented, wired in bin/vibe.js)
