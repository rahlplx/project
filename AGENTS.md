CLAUDE.md

## Shell Compatibility

This project runs on **Windows (PowerShell 7+)**. Keep these conventions in mind:

- **Commands**: Always use PowerShell-compatible cmdlets. Avoid Linux-only tools (`head`, `tail`, `grep` — use `Select-String` or `Get-Content` instead).
- **Node scripts**: Run via `node scripts/<name>.js` or `npx <tool>`. Do not assume `npm run <script>` exists — check `package.json` first.
- **File paths**: Use forward slashes in code, but PowerShell resolves both `/` and `\`.
- **Tests**: Run with `npx jest <path> --no-coverage` (faster) or `npm run test:jest` (full suite, slower).
- **vibe-stack CLI**: The `npx vibe-stack <command>` prints prompts; use direct file edits + test runs for automation.
