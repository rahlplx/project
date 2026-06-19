# vibe:init — Onboarding Wizard

First-time setup for vibenexus in a new project directory.

## When to Run

When `.vibe/state.json` does not exist (first time in this project).

## Steps

### 1. Detect Agent
Determine which AI platform is running:
- OpenCode: `--no-input` flag
- Codex: `--print` flag  
- Cursor: Compose mode
- Codex CLI: `--non-interactive` flag
Set `.vibe/state.json.agent` accordingly.

### 2. Detect Stack
Run `/vibe:detect` equivalent:
- Check package.json, tsconfig.json, requirements.txt, etc.
- Determine test command
- Determine build command
- Determine if UI framework is present
Write to `.vibe/stack.json`.

### 3. Initialize Directory
Create structure:
```
.vibe/
  state.json
  stack.json
  handoff.md (empty)
  learnings/
references/
  vibe-think.md
  vibe-plan.md
  ...
plans/
```

### 4. Create State
Write `.vibe/state.json`:
```json
{
  "project": "<project-name>",
  "version": "2.0.0",
  "phase": "initialized",
  "step": 0,
  "mode": "guided",
  "agent": "<detected-agent>",
  "stack": { ... },
  "completed": []
}
```

### 5. User Confirmation
Show detected stack and settings. Ask user to confirm or correct.

### 6. First Command
Prompt user for first command: typically `/vibe:think` to start strategizing.

## Reference
- Agent detection logic from orchestrator Step 0
- Stack detection from `/vibe:detect`
- Directory structure convention
