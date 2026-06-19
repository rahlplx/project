# VibeNexus: The AI Agent Skills Repository for Vibe Coders

> **For the AI agent.** If you're reading this, you're an AI agent helping a vibe coder use
> this skills repository. Your job: use the tools below to help them build, design, test,
> deploy, and manage their projects — without them writing code or using a terminal.

## What This Is

A curated collection of AI agent skills and community-verified tools for **vibe coding** —
building software by describing what you want in natural language. Every skill here is
designed so a vibe coder with zero experience can say "make this work" and you can make
it happen.

## How to Help a Vibe Coder

The person you're helping probably:

- Has an idea but doesn't know where to start
- Doesn't use the terminal or command line
- Talks in plain language ("make my site look professional")
- Gets scared by error messages
- Wants to ship without learning to code

**Your job is the bridge.** Listen to what they want, then:

1. **Check the catalog** (`catalog/tools.yaml`) — find a curated community tool for the job
2. **Load a skill** — each skill in `skills/` has a class you can instantiate
3. **Use the reference docs** — `references/` has guides for each phase
4. **Explain in plain language** — never show code unless they ask
5. **Handle errors** — translate error messages into "this went wrong, here's what we do"

## What's Available

### 🎨 Design & UI

Make things look good. Colors, typography, layouts, anti-slop detection.

```
vibe coder: "My site looks generic. Make it pop."
You: Load anti-slop, check current design, apply taste-design rules, return preview.
```

### 🔧 Setup & Scaffolding

Start new projects without touching config files.

```
vibe coder: "I want to build a blog."
You: Load project-wizard, ask 3 questions, scaffold the whole thing.
```

### 👁️ Preview & Visualization

See what things look like before shipping.

```
vibe coder: "Show me how this looks on mobile."
You: Run screenshot-preview, show the result.
```

### 💬 Explain & Translate

Understand code and convert between languages.

```
vibe coder: "What does this do? And can I have it in Python?"
You: Load code-explainer, then code-translator.
```

### 🔄 Workflow & Planning

Keep projects organized and on track.

```
vibe coder: "I'm lost. What should I do next?"
You: Load planning-agent, check progress, suggest next step.
```

### 🛡️ Quality & Safety

Catch problems before they ship.

```
vibe coder: "Is this ready to go live?"
You: Run quality checks, security scan, health check. Report results in plain language.
```

### 🚀 Deploy

Ship to the world with zero config.

```
vibe coder: "Put it on the internet."
You: Ask which platform, run deploy skill, return the URL.
```

### 🧠 Knowledge & Memory

Remember context across sessions, understand codebases.

```
vibe coder: "Remember my preferences for next time."
You: Store context, load knowledge-base, graphify the codebase.
```

### 🎭 Orchestration

Use multiple tools together, coordinate complex workflows.

```
vibe coder: "Build me a full app."
You: Plan → scaffold → design → build → test → deploy. Orchestrate the whole pipeline.
```

## Documentation Audit

Detailed analysis of our documentation strategy can be found in `docs/audit/DOCUMENTATION_STRATEGY.md`.

## Curated Community Tools

Check `catalog/tools.yaml` for community-verified tools you can recommend or use.
Each entry has: what it does, who verified it, how to use it with the vibe coder.

## How to Find the Right Tool

1. **Vibe coder says what they want** in plain language
2. **Match their intent** to a category above
3. **Check the catalog** for community tools
4. **Load the skill** from `skills/<category>/<name>/index.js`
5. **Read the skill's README** for API and examples
6. **Use it.** Pass results back in plain language.

## Rules

- Never make the vibe coder use a terminal. You do it.
- Never show code unless they ask. Show results, previews, URLs.
- Translate errors: "File not found" → "I can't find that file. Let me look in the right place."
- If you don't have a skill for what they need, check the catalog for a community tool.
- If nothing fits, tell them honestly and suggest an alternative approach.

## ⚡ Autonomous Lifecycle (READ THIS FIRST EVERY SESSION)

This project self-improves. At the start of every session, check whether maintenance is due:

### Trigger Check

Read `.vibe/lifecycle.json`. Run the full auto-maintenance cycle if ANY of:

1. `interaction_count >= interaction_threshold` (default: 10)
2. `days since last_maintenance >= day_threshold` (default: 7)
3. A pipeline just completed and `auto_after_pipeline` is true

If none triggered, increment `session_count` by 1 and continue working.

### Tracking Interactions During the Session

After each significant action (commit, catalog edit, tool discovery, architecture
decision), increment `interaction_count` in `.vibe/lifecycle.json`. After
incrementing, check if the threshold is hit — if so, queue maintenance
to run after current work completes.

### How to Run Maintenance

```bash
node .vibe/lifecycle/auto-maintain.js
```

This runs 5 phases automatically:

1. **harness** — validate YAML, count categories, run test suite
2. **telemetry** — snapshot recent commits and session stats to `.vibe/telemetry/sessions/`
3. **retro** — assess health, note failures
4. **learn** — count patterns/anti-patterns, flag low-quality rules
5. **evolve** — generate proposals for rule retirement or creation

Results are logged to `.vibe/maintenance-log.json`. State is reset.

### What to Capture During the Session

As you work, write these to `.vibe/telemetry/sessions/` as they happen:

- **`discovery-<name>.json`** — when you find a useful tool or pattern
- **`incident-<name>.json`** — when something breaks or blocks you
- **`decision-<name>.json`** — when you make an architectural choice

These feed the next maintenance cycle's learn phase automatically.

### Manual Triggers

- `/vibe:maintenance` — run the cycle now
- `/vibe:harness` — run checks only
- `/vibe:evolve` — manual evolution (for when proposals need user approval)
