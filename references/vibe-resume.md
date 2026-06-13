# vibe:resume — Context Recovery

Reconstructs full context from state.json and handoff.md when a session is interrupted.

## When to Run

On session start when `.vibe/state.json` exists and `.vibe/handoff.md` exists (oracle detected prior work).

## Steps

### 1. Load State
Read `.vibe/state.json`:
- Current phase and step
- Mode (guided/auto)
- Completed items
- Stack info
- Skills available

### 2. Load Handoff
Read `.vibe/handoff.md`:
- What was just completed
- What the next layer needs
- Current artifact status
- Any blockers or warnings

### 3. Verify Artifacts
Check that artifacts claimed as completed actually exist:
- Plan files
- Source files
- Tests
- Output files
If missing, mark those steps as incomplete.

### 4. Rebuild Context
Show the user a status dashboard:
```
Current Phase: build (step 3/5)
Last Completed: TDD-GREEN for auth/login
Next: REFACTOR for auth/login
Artifacts: OK (12/12 files verified)
Blocker: None
```

### 5. Resume
- Guided: Ask user to confirm resume point → continue
- Auto: Resume from last incomplete step

## Reference
- v1.1: Session recovery protocol
- State file + handoff file dual verification
