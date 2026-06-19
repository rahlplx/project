# Plan: Branch Cleanup + Async/Sync Parity Fix

## Scope

Fix all 6 issues found during branch/PR analysis. TDD workflow. Prove the auto pipeline works end-to-end.

## Acceptance Criteria

- PR #23 merged (critical vulns fixed)
- PR #24 merged (state/telemetry updated)
- PR #25 closed (superseded by #26)
- 6 stale branches deleted from remote
- 3 deploy skills migrated to SkillBase (DONE - 24 tests pass)
- Harness 19/19 pass
- Shell compat documented for future agents

## Implementation Order

1. **GitHub operations**: merge PR #23, PR #24; close PR #25; delete stale branches
2. **Async/sync parity**: deploy skills DONE, migrate quality skills next (7 skills)
3. **Harness**: fix tools-discovered-count failure
4. **Shell compat**: add AGENTS.md note about PowerShell vs Linux

## Review Feedback

### CEO Review (Product)

- **10-star version**: Fix ALL issues autonomously in one pipeline run
- **Narrowest wedge**: GitHub PR operations (zero code, immediate value)
- **OUT of scope**: 42 remaining skill migrations, pipeline rewrite

### Eng Review (Architecture)

- **Dependency order**: PR merges first (unblocks everything), then async/sync, then harness
- **Test matrix**: jest + lint + harness as TDD gates
- **Failure modes**: GitHub auth, merge conflicts, broken tests

### Design Review

**N/A** — CLI-only repo, no UI surfaces.
