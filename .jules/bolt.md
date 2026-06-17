## 2025-05-22 - [Lazy-loading Orchestrator for CLI Startup]
**Learning:** Eagerly requiring heavy modules like the orchestrator at the top level of a CLI entry point adds a significant constant boot cost (tax) to every command, even simple ones like 'help'.
**Action:** Use deferred 'require' statements inside the command execution block and skip expensive context injection (QueryEnricher) for non-phase utility commands.

## 2026-06-17 - [TTLCache for QueryEnricher]
**Learning:** The QueryEnricher reads .vibe/ state, git log, and skill index on every call. Same query + same goal produces identical output within a session window.
**Action:** Cache enrich() results with TTLCache(30000) keyed on query+goal. Eliminates redundant I/O on repeated invocations within 30s.

## 2026-06-17 - [Consolidated Lifecycle I/O]
**Learning:** Frequent small JSON reads (like lifecycle.json) in the CLI hot-path can add 5-10ms of "stealth tax" per command. Consolidating the telemetry write and maintenance-threshold check into a single file operation is more efficient than sequential read/writes.
**Action:** Update `recordTelemetry` to return the modified state object, allowing subsequent logic to reuse the in-memory state rather than re-reading from disk.
