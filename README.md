# Vibe-Stack

[![Quality Gates](https://github.com/rahlplx/project/actions/workflows/quality-gates.yml/badge.svg)](https://github.com/rahlplx/project/actions/workflows/quality-gates.yml)

**The curated collection of AI tools for people who build with vibes.**

> You have an idea. Your AI agent has skills. We have the tools that connect them.

No terminal. No code. Just tell your AI agent what you want and it happens.

## What This Is

A curated collection of **community-verified AI engineering tools** — organized so your
AI agent can find the right one for whatever you're building.

**45+ agent skills** + **curated catalog of best-in-class tools** = everything you need
to go from idea to shipped product without writing code.

## How It Works

```
You say: "Make my site look professional"
Agent  → loads design skills → checks anti-patterns → fixes typography → shows result
        ↓
You see: "Done. Your font is now readable, contrast is WCAG-compliant, and the layout
         uses proper spacing. Here's a preview."
```

1. **Talk to your AI agent** (Claude Code, Codex CLI, Cursor, OpenCode, etc.)
2. **Agent reads the skills** — each skill knows how to do one thing well
3. **Agent checks the catalog** — finds the best community tool for the job
4. **Work happens** — you just see the result

## What You Can Do

| You want to...       | Your agent handles it                        |
| -------------------- | -------------------------------------------- |
| Start a new project  | Scaffolding, config, folder structure        |
| Design something     | Colors, fonts, layouts, anti-slop prevention |
| Test your app        | Unit tests, browser tests, security checks   |
| Deploy to the world  | One-click Vercel/Netlify, custom domains     |
| Understand an error  | Translate to plain English, suggest fixes    |
| Remember context     | Save preferences, search by meaning          |
| Do complex workflows | Plan, build, test, ship — orchestrated       |

## Documentation Audit

Detailed analysis of our documentation strategy can be found in `docs/audit/DOCUMENTATION_STRATEGY.md`.

## Documentation Audit

Detailed analysis of our documentation strategy can be found in `docs/audit/DOCUMENTATION_STRATEGY.md`.

## What's Inside

```
vibe-stack/
├── SKILL.md           ← Instructions for your AI agent (start here)
├── skills/            ← 45 agent skills your AI can use
├── catalog/           ← Curated list of community-verified tools
│   ├── tools.yaml     ← The catalog itself
│   └── verified-by.md ← Who verified each tool and how
├── references/        ← Guides for every phase of building
├── bin/               ← MCP server (lets any agent use the skills)
└── .vibe/             ← State, learnings, handoffs
```

## Getting Started

1. **Clone this repo** — just once
2. **Tell your AI agent about it** — point it at the `SKILL.md`
3. **Start building** — describe what you want in plain language

```bash
git clone https://github.com/rahlplx/project.git my-vibe-stack
```

Then open your AI agent and say:

> _"I just cloned Vibe-Stack. Help me build a landing page for my startup."_

Your agent reads SKILL.md, finds the right skills, and makes it happen.

## The Community Catalog

We curate the best open-source AI tools so you don't have to figure out what's good.
Every tool in the catalog is verified — someone tested it, it works, it's not abandoned.

**Want to add a tool?** Open a PR. See `references/vibe-curation.md`.

## Need Help?

Your AI agent is your guide. Just ask:

- "What can you do with this?"
- "I'm stuck, what should I do next?"
- "Is my project ready to ship?"
- "Make this look better"
- "Put it on the internet"

---

_Built for vibe coders, by vibe coders._
