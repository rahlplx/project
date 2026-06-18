# Vibe-Stack Curation Guide

How we find, verify, and add community tools to the curated catalog.

## Our Goal

Build the best collection of **community-verified AI engineering tools** for vibe coders.
Not 5000 tools. The *right* tools — proven, documented, and ready to use.

## What Makes a Tool "Vibe-Stack Worthy"

1. **Solves a real problem** for a vibe coder (someone who doesn't write code)
2. **Proven in the community** — GitHub stars, active maintenance, real users
3. **Works today** — can be installed and used right now
4. **Well-documented** — README exists, examples work
5. **Compatible license** — MIT, Apache 2.0, BSD, or generous free tier

## How We Find Tools

- Community recommendations (issues, discussions, PRs)
- Trending on GitHub in AI/devtools categories
- Featured at conferences (AI Engineer Summit, etc.)
- Direct submissions via PR
- Systematic sweeps of known-good ecosystem players

## How We Add Tools

1. **Discover** — Find the tool, verify it's real and maintained
2. **Catalog** — Add to `catalog/tools.yaml` with metadata
3. **Verify** — Test it works, check license, document findings in `verified-by.md`
4. **Wrap** (optional) — Create a skill wrapper in `skills/<category>/<name>/` for agent use
5. **Document** — Update SKILL.md if adding a new category

## How to Contribute

Open a PR that:
1. Adds the tool to `catalog/tools.yaml`
2. Proves it works (screenshot, test output, or demo)
3. Notes the license and verification status

## Pre-Flight Checklist (Before Adding a Tool)

1. **Confirm repo_url resolves** — visit and confirm it's the right repo
2. **Confirm license** — must be MIT, Apache 2.0, BSD-3-Clause, MPL-2.0, or generous free tier
3. **Confirm stars ≥ threshold** — typically 1k+ for a new tool, 5k+ for established categories
4. **Confirm last commit ≤ 6 months** — abandoned repos don't go in
5. **THEN write description** — use agent-native format (what_it_does + how_agent_uses)

## Editorial Rules

- **Append new tools to the END of `catalog/tools.yaml`.** YAML order doesn't matter. Inserting mid-file causes whitespace edit conflicts with no benefit.
- **Batch additions when possible.** If adding >5 tools, do it in 1 pipeline run — not 3 incremental runs.
- **Write agent-native descriptions.** Every entry needs `what_it_does` (for vibe coder) + `how_agent_uses` (for agent). Include specific command examples.

## What We DON'T Do

- No CLIs for humans — agents handle the terminal
- No build steps — everything works with `npm install` or less
- No registration — we don't add tools that require accounts just to try them
- No abandoned repos — if it hasn't been updated in a year, it doesn't go in
