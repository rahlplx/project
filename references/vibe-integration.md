# Integration

Integrate orchestrator with CLI and MCP for agent-agnostic access.

## Integration Protocol

### Step 1: CLI Integration

Add commands to existing CLI:
- `intent` — Capture user intent
- `research` — Research project domain
- `generate` — Generate documentation

### Step 2: MCP Integration

Add tools to MCP server:
- `capture_intent` — Capture user intent
- `research_project` — Research project domain
- `generate_docs` — Generate documentation

### Step 3: State Schema

Update `.vibe/state.json`:
- `orchestrator.phase` — Current orchestrator phase
- `orchestrator.projectName` — Current project name
- `orchestrator.lastRun` — Last run timestamp

## CLI Integration

```bash
# Capture intent
vibenexus intent --name "MyApp" --problem "Solve X"

# Research project
vibenexus research --name "MyApp" --domain saas

# Generate docs
vibenexus generate --name "MyApp" --problem "Solve X" --domain saas
```

## MCP Integration

```json
{
  "name": "capture_intent",
  "description": "Capture user intent and generate PROJECT.md + PRD.md",
  "parameters": {
    "projectName": "string",
    "problem": "string",
    "users": "string",
    "stakes": "string",
    "solution": "string",
    "mvp": "string"
  }
}
```

## Token Budget

- Reference: lazy-loaded on demand
- Size: ~100 lines
- Re-attach: only when integrating
