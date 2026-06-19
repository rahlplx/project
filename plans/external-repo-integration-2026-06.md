# External Repo Integration — June 2026 Batch

**Date:** 2026-06-16
**Status:** Reasoning complete, Phase 1 implemented

Six repos were proposed for integration. Each was fetched and read (README, structure,
license, activity) before any porting decision — no port without first confirming the
source actually contains something we don't have and that fits this repo's CommonJS
skill/lib conventions (`skills/AGENTS.md`, no new runtime deps).

## Per-repo verdict

| Repo                               | Verdict                                 | Reasoning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `profullstack/vibenexus`          | **Skip**                                | Name collision only. It's a PWA app boilerplate (Supabase backend, Android/iOS/desktop/WebXR builds, Puppeteer PDF gen) — an end-user app framework, not an agent-orchestration/skill system. Nothing in it overlaps with what this repo does.                                                                                                                                                                                                                                                                                                                                                                                 |
| `roboco-io/awesome-vibecoding`     | **Skip as code / use as research lead** | CC0 curated link list, not executable. Already functionally covered by the ad-hoc WebSearch research process used for `catalog/tools.yaml` candidates. Nothing to port.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `addyosmani/agent-skills`          | **Port (high value)**                   | MIT, 61k+ stars, actively maintained (v0.6.2, June 2026). Six-phase lifecycle (Define→Plan→Build→Verify→Review→Ship) matches our phase pipeline almost 1:1. Two concrete things we don't have: **anti-rationalization tables** (named excuses for skipping a quality gate, paired with rebuttals) and **specialist reviewer personas** (code reviewer / test engineer / security auditor / web-perf auditor) as a checklist shape. Ported as `lib/orchestrator/anti-rationalization.js`.                                                                                                                                       |
| `withkynam/vibecode-pro-max-kit`   | **Port (selective)**                    | MIT, 899 stars. Its RIPER-5 phase machinery duplicates our own `state-machine.js` — skip that. Two ideas are genuinely new: **feasibility probes** (test a risky assumption before committing implementation effort) and **goal blocks** (durable resumption markers surviving an agent memory reset, which our `.vibe/handoff.md` partially does but without a structured probe-result history). Folded the probe concept into `gap-detector.js`'s `feasibilityProbe()` rather than a separate file — it's the same "did reality match the plan" shape as gap detection, just run pre-implementation instead of post.         |
| `popup-studio-ai/bkit-claude-code` | **Port (selective)**                    | Apache 2.0, 558 stars, actively maintained (v2.1.22, June 2026). Two concrete portable concepts: **Trust Level (L0–L4) autonomy dial** — formalizes the reversibility/blast-radius judgment call this repo's own system prompt already describes in prose, into a queryable level; and **gap-detector** (design-spec vs implementation match-rate, auto-flag repair below a threshold). Ported as `lib/orchestrator/trust-level.js` and `lib/orchestrator/gap-detector.js`.                                                                                                                                                    |
| `affaan-m/ecc`                     | **Skip wholesale, no port this round**  | MIT, very large (67 agents, 271 skills, AgentShield 102-rule security auditor). The bulk of it is the same scope as this entire repo (cross-harness skills+agents+hooks) — merging it wholesale would violate "no abstractions beyond what's needed" and balloon the skill count without a corresponding need. The one narrow useful comparison — whether AgentShield's 102 security rule _categories_ cover anything `skills/quality/security-audit/index.js`'s 10 OWASP categories + 6 code patterns miss — is left as a follow-up diff, not done in this pass (would need the actual rule list, not just the README count). |

## What was implemented (Phase 1)

- `lib/orchestrator/trust-level.js` + test — L0 (Manual) through L4 (Full Auto), each level
  declaring which risk tiers (`local-reversible`, `shared-state`, `destructive`,
  `irreversible-external`) auto-execute vs require confirmation. Mirrors this project's own
  "Executing actions with care" policy, made queryable instead of prose-only.
- `lib/orchestrator/gap-detector.js` + test — `matchRate(designSpec, implementation)` scores
  how many spec requirements are detectably present; `needsRepair(rate, threshold=0.9)`;
  `feasibilityProbe(assumption, evidence)` for pre-implementation risk checks (the
  vibecode-pro-max-kit idea, same shape as gap detection run earlier in the lifecycle).
- `lib/orchestrator/anti-rationalization.js` + test — table of common gate-skipping excuses
  ("it's just a prototype", "I'll add tests later", "the user's in a hurry", etc.) each paired
  with a rebuttal; `checkRationalization(text)` matches free text against the table.
- All three wired into `lib/orchestrator/index.js`'s exports.
- Test files added to `package.json`'s `test` / `test:node` scripts.

## Explicitly not done this round

- AgentShield rule-category diff against `lib/security-scan.js` (needs the actual rule list).
- Any literal file/directory copying from any of the six repos — every port above is a
  re-implementation of a _concept_, written against this repo's existing module shape and
  test conventions, not a vendored copy.
- Wiring `TrustLevel`/`GapDetector`/`AntiRationalization` into CLI commands (`bin/vibe.js`,
  `lib/vibe-commands/*.js`) as hard gates — same caution as the earlier GSD/taste-skill
  wiring: doing so would require fabricating structured state (e.g. a real design spec object)
  that doesn't exist yet in `.vibe/state.json`. Left as a follow-up once a phase produces that
  structured data.
