# vibe:telemetry — Usage Intelligence

Tracks what works and where users get stuck. Local-only by default.

## When to Run

Automatically at phase transitions. Also on explicit invocation to generate diagnostics report.

## Steps

### 1. Data Collection (Local Only)
Track per session:
- Phases completed and durations
- Tasks per phase (planned vs actual)
- Test failure count and categories
- Error types encountered
- Blockers encountered

### 2. Trend Analysis
- Phase duration trends (is build getting faster?)
- Error type frequency (what fails most?)
- Blockers by category (architecture? tooling? knowledge?)
- Stuck detection (tasks that took >2x estimate)

### 3. Diagnostics Report
Generate `.vibe/telemetry/session-YYYY-MM-DD.json`:
```json
{
  "session": "YYYY-MM-DD",
  "phases": {
    "think": { "duration": 0, "outcome": "pass" },
    "build": { "tasks": 5, "failed": 1, "retries": 2, "duration": 0 }
  },
  "errorCategories": { "test": 2, "typecheck": 1, "logic": 1 },
  "blockers": ["inquirer ESM compatibility"],
  "recommendations": ["Add ESM/CJS check to setup skills"]
}
```

### 4. Recommendations
- Based on patterns, suggest 3-5 concrete improvements
- Flag recurring errors for vibe:evolve
- Highlight skills that need updating

## Reference
- v1.1: Usage diagnostics for continuous improvement
- Data stored in `.vibe/telemetry/` (gitignored by default)
