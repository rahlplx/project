# Anti-Pattern: Temp File Cleanup Forgotten

## Symptom
Ad-hoc scripts (`regen-index.js`, `rebuild-index.js`) left in working directory after one-off tasks. These files clutter the repo and can be accidentally committed.

## Root Cause
No cleanup step in workflow. Scripts created for immediate use but no process to remove them afterward.

## How vibe-stack Should Catch It
1. **Ship phase cleanup** - Add temp file deletion to `/vibe:ship` checklist
2. **Git ignore** - Add `*.tmp.js` or specific temp patterns to `.gitignore`
3. **Script location** - Put temp scripts in `/tmp` or `.vibe/tmp/` instead of root

## Example
```bash
# BAD - temp files in root
regen-index.js
rebuild-index.js

# GOOD - temp files in .vibe/tmp/
.vibe/tmp/regen-index.js
```

## Incident
vibe-stack, 2026-06-14: Two temp scripts left after MCP SDK integration. Deleted before commit.

## Prevention
- Add cleanup step to `/vibe:ship` reference
- Update `.gitignore` with temp file patterns
- Prefer `.vibe/tmp/` for ad-hoc scripts
