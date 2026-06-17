## 2025-05-22 - [Lazy-loading Orchestrator for CLI Startup]
**Learning:** Eagerly requiring heavy modules like the orchestrator at the top level of a CLI entry point adds a significant constant boot cost (tax) to every command, even simple ones like 'help'.
**Action:** Use deferred 'require' statements inside the command execution block and skip expensive context injection (QueryEnricher) for non-phase utility commands.
