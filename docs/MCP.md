# MCP.md — Platform Integration Guide

Add `vibenexus` as an MCP tool server to **any AI agent** that supports the Model Context Protocol.

## Quick Start (All Platforms)

```json
{
  "mcpServers": {
    "vibenexus": {
      "command": "npx",
      "args": ["vibenexus", "mcp"]
    }
  }
}
```

## Platform-Specific Setup

### OpenCode

Add to `~/.config/opencode/opencode.json` or `.opencode/opencode.json` in your project:

```json
{
  "mcpServers": {
    "vibenexus": {
      "command": "npx",
      "args": ["vibenexus", "mcp"]
    }
  }
}
```

### Claude Code

Add to your project's `.mcp.json` or Claude config:

```json
{
  "mcpServers": {
    "vibenexus": {
      "command": "npx",
      "args": ["vibenexus", "mcp"]
    }
  }
}
```

### Codex (by GitHub)

Add to your Codex agent configuration:

```json
{
  "mcpServers": {
    "vibenexus": {
      "command": "npx",
      "args": ["vibenexus", "mcp"]
    }
  }
}
```

### Antigravity

Use the Antigravity MCP tools configuration:

```json
{
  "tools": {
    "vibenexus": {
      "command": "npx",
      "args": ["vibenexus", "mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "vibenexus": {
      "command": "npx",
      "args": ["vibenexus", "mcp"]
    }
  }
}
```

### Windsurf / Other MCP Agents

Same pattern — add the stdio server config pointing to `npx vibenexus mcp`.

## Available Tools

When connected, the MCP server exposes **45 skills × multiple methods** as tools.
All tools follow the naming pattern: `{category}_{skillname}:{method}`

### Example Tools

| Tool                                         | What it does                          |
| -------------------------------------------- | ------------------------------------- |
| `deploy_one-click-vercel:buildDeployCommand` | Generate Vercel deploy command        |
| `progress_error-translator:translate`        | Translate error to plain English      |
| `quality_vibe-review:review`                 | Review code for issues                |
| `workflow_git-ops:run`                       | Execute git commands                  |
| `explain_intent-capture:capture`             | Extract project spec from description |
| `design_template-gallery:list`               | List starter templates                |

### Full list

Run `npx vibenexus list` to see all 45 skills.

## Manual Usage (Without MCP)

If your agent doesn't support MCP, use the CLI directly:

```bash
# List all skills
npx vibenexus list

# Call a specific skill method
npx vibenexus deploy/one-click-vercel buildDeployCommand .
npx vibenexus progress/error-translator translate "ECONNREFUSED"
npx vibenexus quality/vibe-review review "const x = 1;"
```

## How It Works

1. `npx vibenexus mcp` starts a JSON-RPC server over stdin/stdout
2. The server auto-discovers all 45 skills in `skills/`
3. Each public method becomes a tool the agent can call
4. No dependencies, no build step, no network required after install
