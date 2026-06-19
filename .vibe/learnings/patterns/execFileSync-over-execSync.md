# Pattern: execFileSync Over execSync

## Problem
Using `execSync(string)` invokes a shell for command execution, creating shell injection risk whenever user input or dynamically-constructed paths are included in the command string.

## Solution
Use `execFileSync(cmd, args)` or `spawnSync(cmd, args)` with array arguments. These bypass the shell entirely and pass arguments directly to the process.

```js
// Before — shell injection risk
execSync(`git clone "${repo}" "${dir}"`, { stdio: 'pipe' });

// After — no shell involved
execFileSync('git', ['clone', repo, dir], { stdio: 'pipe' });
```

## When to Use
- Any `execSync`/`exec` call that includes dynamic values (user input, file paths, CLI args)
- Cross-platform code where shell escaping differs per platform (Windows vs Unix)
- Code where the extra shell process provides no value

## Platform-Specific Considerations
- Windows `start` requires `cmd /c start "" "path"` with spawnSync
- macOS `open` and Linux `xdg-open` work directly with spawnSync
- `npm install` works with `execFileSync('npm', ['install'], { cwd: dir })`

## Files Changed
- `skills/preview/screenshot-preview/index.js` — spawnSync + array args
- `skills/setup/quick-start/index.js` — execFileSync + array args (git clone, npm install)
- `skills/workflow/git-ops/index.js` — execFileSync('git', [...]) with array args

## Tested On
VibeNexus Curated Collection, 2026-06-14
