# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A curated collection of community-verified AI engineering tools for vibe coders.
The primary interface is `SKILL.md` — AI agents read it to learn how to help end users.
The codebase itself (`lib/`, `bin/`, `skills/`) is the orchestrator + skill library that
implements that interface.

## Commands

```bash
npm test                    # Full suite: Jest + node:test files (572 Jest + 432 node:test = 1004 total)
npm run test:jest           # Jest only
npm run test:node           # node:test files only (orchestrator/superpowers/gstack/design)
npx jest path/to/file.test.js                    # Run a single Jest test file
npx jest -t "test name"                          # Run a single Jest test by name
node --test lib/orchestrator/state-machine.test.js  # Run a single node:test file directly
npm run lint                # ESLint (0 errors required)
npm run typecheck           # tsc --noEmit over lib/**/*.js (allowJs/checkJs, no .test.js)
npm run format              # Prettier --write
node bin/vibe.js <command>  # Run the CLI directly, e.g. `node bin/vibe.js status`
node .vibe/lifecycle/auto-maintain.js  # Run the autonomous maintenance cycle
```

Jest config (in `package.json`) excludes `.vibe/`, `.gsd/`, and a long list of files that
are covered by `npm run test:node` instead — check `testPathIgnorePatterns` before assuming
a `*.test.js` file runs under Jest.

## Architecture

### Two audiences, one repo
- **End users ("vibe coders")**: never touch the terminal. They talk to an AI agent, which
  reads `SKILL.md` (repo root, agent entry point) and `CONTRIBUTING.md`-style guidance to
  decide which skill or catalog tool to use, then reports back in plain language.
- **Contributors / Claude Code working on this repo**: write CommonJS modules under `lib/`
  and `skills/`, covered by tests, following the conventions below.

### `bin/` — CLI entry points
- `bin/vibe.js` is the CLI surface (`npm run vibe`, `node bin/vibe.js <cmd>`). It calls
  `lib/vibe-commands/index.js`'s `register()` for each command, passing a handler,
  phase, category, and optional `conditional` flag, then dispatches `process.argv[2]`.
- `bin/mcp-server.js` exposes the same functionality over MCP so non-Claude agents
  (Codex, OpenCode, etc.) can call it.
- `bin/skill-loader.js` / `bin/vibe-stack.js` are supporting entry points.

### `lib/vibe-commands/` — command handlers
Each command maps to `lib/vibe-commands/<name>.js` and a reference doc at
`references/vibe-<name>.md`; if no handler exists the CLI falls back to printing the reference.

**Adding a new command requires two steps:**
1. Create `lib/vibe-commands/<name>.js` exporting `{ handler }` where `handler.handler(args, state)` is the entry point.
2. Register it in `bin/vibe.js` with `register(name, { handler, phase, category, description })`.

Commands have three categories: `phase` (pipeline steps), `utility` (status/telemetry/help),
`orchestration` (auto/quick/resume/maintenance). Commands with `conditional: true` (design, qa)
only run when `state.has_ui` is truthy.

### `lib/orchestrator/` — the 5-phase pipeline state machine
The pipeline follows a fixed sequence defined as `PHASE_ORDER` in `lib/vibe-commands/state-helpers.js`:

```
think → plan → break → build → harness → review → ship → retro → learn → evolve → done
```

- `state-machine.js` defines `PHASES` and `LAYERS` driving this pipeline.
- `context-manager.js` and `role-loader.js` (with `ROLES`/`PHASE_ROLES`) manage per-phase
  context and which "virtual team" role (CTO, QA, Security, etc.) is active.
- `lib/superpowers/` (TDD workflow, subagent dispatch) and `lib/gstack/` (strategy engine)
  are sibling engines combined into the orchestrator — see `lib/orchestrator/index.js`'s header.
- Running a command out of phase order produces a warning; pass `--force` to override.

### `skills/<category>/<name>/` — agent skill modules
Every skill is a pair: `index.js` (CommonJS, exports a `prompt` string the agent injects into
its system prompt, optionally a `config` object) and `SKILL.md` (what/when/how, for the agent
to read). Categories: `deploy/`, `design/`, `explain/`, `knowledge/`, `orchestration/`,
`preview/`, `progress/`, `quality/`, `setup/`, `testing-qa/`, `workflow/`. Full convention
in `skills/AGENTS.md`. The `.claude/skills/` directory (see table below) wraps these same
modules as slash commands with extra anti-slop/OWASP/taste rules layered on top.
The canonical index of all skills lives in `.well-known/agent-skills/index.json`
(SHA-256 digests — keep in sync via `lib/skill-files.js` when adding/removing skills).

### `catalog/tools.yaml` — curated external tool catalog
Categorized list (design-ui, code-generation, testing-qa, deployment, knowledge-memory,
orchestration, agent-frameworks, ...) of community-verified third-party tools the agent can
recommend. `catalog/verified-by.md` tracks who verified each entry; `catalog/quality-scores.json`
is generated/maintained by `lib/quality-score.js`.

### `.vibe/` — persistent state across sessions
- `state.json` — current project phase (`curation` = building the curated collection).
- `lifecycle.json` — autonomous maintenance counters/thresholds.
- `telemetry/`, `learnings/`, `rules/`, `evolution.json`, `handoff.md` — written to by the
  lifecycle/maintenance scripts and read back in to drive self-improvement.
- `docs/handoffs/` — handoff notes written after phase transitions by `state-helpers.js`.

### Cross-cutting `lib/` utilities worth knowing about
- `lib/discovery-index.js`, `lib/check-index-integrity.js` — keep `.well-known/agent-skills/index.json` consistent with `skills/`.
- `lib/check-originality.js` — Jaccard similarity check to prevent near-duplicate skills.
- `lib/lint-skills.js`, `lib/skill-frontmatter.js`, `lib/skill-files.js` — structural validation of skill directories.
- `lib/security-scan.js` (+ `.report.js`) — security scanning used by the security/quality gates.
- `lib/telemetry-tracker.js`, `lib/telemetry-aggregate.js`, `lib/telemetry-status.js` — session telemetry feeding the lifecycle.
- `lib/mcp/`, `lib/mcp-adapter.js` — MCP protocol glue for `bin/mcp-server.js`.

## Autonomous Lifecycle

This project self-improves via `.vibe/lifecycle/`. At the start of every session, read
`.vibe/lifecycle.json` and run the full maintenance cycle if ANY of:
1. `interaction_count >= interaction_threshold` (default 10)
2. days since `last_maintenance` >= `day_threshold` (default 7)
3. a pipeline just completed and `auto_after_pipeline` is true

```bash
node .vibe/lifecycle/auto-maintain.js
```

During a session, write `discovery-<name>.json` / `incident-<name>.json` / `decision-<name>.json`
to `.vibe/telemetry/sessions/` as significant events happen; these feed the next cycle's learn phase.

## How to Help the Vibe Coder (when acting as the in-repo agent)

- They talk in plain language ("make this look good", "ship my app") — never make them
  use a terminal, never show code unless asked; show results, previews, URLs instead.
- Check `catalog/tools.yaml` for a community tool, or load a skill from `skills/`, before
  building something new.
- Translate errors into plain English ("File not found" → "I can't find that file...").

## Curation Guidelines

- Tools in `catalog/tools.yaml` must be community-verified (stars, active, documented).
- Add new tools via PR with proof it works; every entry needs what it does, who verified
  it, and how an agent uses it.
- No abandoned repos (>1 year inactive). No CLIs meant for humans — agents handle the terminal.

## Slash Command Suite (`.claude/skills/`)

The vibe-stack orchestrator is decomposed into invokable skills for Claude Code. Each wraps
the same underlying `skills/` JS modules with consistent anti-slop/OWASP/taste-skill rules.

| Command | Wraps | Use when |
|---------|-------|----------|
| `/vibe` | Full pipeline | New project, "I want to build X" |
| `/vibe-design` | anti-slop, color-gen, design-system, typography-rules, impeccable-audit | Reviewing/generating UI, design tokens, palettes |
| `/vibe-review` | virtual-team, code-health, done-verifier | Pre-merge review, second opinion, "is this ready" |
| `/vibe-security` | security-audit, security-defaults, guardrails | Before release, auth/payment/API code |
| `/vibe-tdd` | tdd-vibe, verification-agent, checkpoints | New feature or bug fix — write the test first |
| `/vibe-deploy` | one-click-vercel/netlify, git-free-deploy, done-verifier | Shipping to staging/production |
| `/vibe-explain` | code-explainer, code-translator, intent-capture | Understanding, translating, or reverse-speccing code |
| `/vibe-status` | tracker, dashboard, context-memory | Start of session, "where did we leave off" |
| `/vibe-learnings` | context-memory, knowledge-base, git log | Retro, post-mortem, building institutional memory |
| `/vibe-template` | template-gallery, prompt-templates, quick-start | Starting a component/page/endpoint/scaffold from scratch |
| `/vibe-plan` | planning-agent, task-coordinator, tracker, parallel-exec | Breaking down a feature or sprint into tasks |
| `/vibe-caveman` | caveman-mode | Terse-output mode, compressed commit messages/PR comments, token-savings stats |
| `/vibe-harness` | bin/vibe.js harness | Production readiness gate — 15 checks, fix table, pre-ship gate |
| `/vibe-evolve` | bin/vibe.js evolve + lifecycle | Rule promotion/demotion/creation from telemetry + learnings |
| `/vibe-retro` | bin/vibe.js retro + vibe-learnings | Sprint retrospective — what worked/didn't, action items, save to context-memory |

## Cross-Agent Plugin Packaging

This project installs into 4 agent ecosystems without forking the skill library:

| Agent | Entry point | Mechanism |
|-------|-------------|-----------|
| Claude Code | `plugin/.claude-plugin/plugin.json` | Plugin manifest; `plugin/skills` is a symlink to `.claude/skills/` (avoids colliding with the root `skills/` JS module library, which is a different thing); `plugin/.mcp.json` points at `bin/mcp-server.js` via `${CLAUDE_PLUGIN_ROOT}` |
| Cursor | `.cursor/mcp.json` | MCP server config calling `node bin/mcp-server.js`; `node bin/vibe.js install --cursor` additionally generates `.cursor/rules/*.mdc` from `CLAUDE.md` |
| OpenCode | `opencode.json` | `mcp` key, local stdio transport to `bin/mcp-server.js` |
| Codex CLI | `.codex/config.toml` | `[mcp_servers.vibe-stack]` block (project-local auto-load varies by Codex CLI version — copy into `~/.codex/config.toml` if it isn't picked up) |

`node bin/vibe.js install [--cursor|--windsurf|--claude-code|--all]` wraps `lib/install-ide.js`
(`detectIDE`/`installForIDE`/`syncToIDE`) to generate IDE-native rule files and, for Claude
Code, sync `skills/` JS modules into `.claude/skills/<category>/<name>.md` reference docs.
With no flag it auto-detects the current IDE from env vars and existing config dirs.

## Code Conventions

- CommonJS only (`require`/`module.exports`) — no ESM, per ESLint `sourceType: 'commonjs'`.
- No new runtime dependencies; prefer built-in Node.js APIs (see `CONTRIBUTING.md`).
- New skills need `index.js` + `SKILL.md` + a test file (`node:test` or Jest) — see
  `skills/AGENTS.md` for the exact required shape before adding one.
