# Rule: Telemetry Instrumentation Standards

## Type
Implementation (OTel tracer conventions)

## Span naming
Format: `<component>.<operation>` — e.g. `cmd.build`, `skill.security-audit`, `enricher.recall`.
Never use dynamic user input in span names (injection risk + cardinality explosion).

## Required attributes on every span
| Attribute | Type | Source |
|-----------|------|--------|
| `phase` | string | cmd.phase \|\| 'utility' |
| `skills` | comma-separated string | enriched.skills.join(',') |
| `confidence` | float 0-1 | enriched.confidence |
| `status` | 'ok' \| 'error' \| 'skipped' | result.status |

## Optional but recommended
- `fail_reason` — human-readable string when status='error'
- `token_estimate` — from RoleLoader.estimateTokens()
- `git_velocity` — from GitLearnings.velocity.commitsLast7Days
- `trust_level` — from TrustLevel result

## Export
All spans write to `.vibe/telemetry/otel/spans.jsonl` (one JSON object per line).
File is append-only. Never truncate mid-session — compress at session start if >1MB.

## Error handling
`Span.end()` must always be called (use try/finally). A span that never ends
is worse than no telemetry — it silently drops the export.

## Anti-patterns
- DO NOT call `getTracer()` inside a hot loop — cache the tracer instance
- DO NOT log PII (email, token, file path with username) as span attributes
- DO NOT create child spans for operations < 5ms — overhead exceeds signal

## Origin
Pattern: `otel-tracing` — wired in bin/vibe.js via lib/telemetry/otel-tracer.js.
Quality score: 4.5/5 (implemented, missing child-span support)
