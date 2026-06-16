# GSD Workflow — Define → Build → Ship

Faithful port of GSD's (Get Shit Done, https://github.com/gsd-build/get-shit-done)
Define → Build → Ship lifecycle into this project's milestone → phase → task
structure. Composes with the existing `.gsd/` milestone files and
`lib/vibe-commands/break.js` rather than reimplementing them — this skill
recommends *which* GSD command to run next and validates the atomic-commit
and wave-resume guarantees; it does not replace milestone file generation.

## When to use

- Deciding the next command in a milestone's lifecycle from its current state.
- Verifying a completed task satisfies GSD's atomic-commit guarantee (one
  isolated commit + `*-SUMMARY.md` + `VERIFICATION.md`) before marking it done.
- Auditing a milestone for unshipped requirements before `/gsd-complete-milestone`.
- Resuming a wave-grouped execution after a task failure, without re-running
  already-completed tasks.

## Stages

| Stage | Commands | Description |
|-------|----------|--------------|
| `define` | `gsd-new-project`, `gsd-discuss-phase`, `gsd-ui-phase` | Intake, requirements extraction, roadmap approval; lock implementation preferences before coding. |
| `build` | `gsd-plan-phase`, `gsd-execute-phase`, `gsd-verify-work` | Atomic task plans, wave-grouped execution, structured manual UAT. |
| `ship` | `gsd-ship`, `gsd-audit-milestone`, `gsd-complete-milestone` | PR creation, requirement-coverage audit, archive and tag release. |

Auxiliary commands (any stage): `gsd-quick`, `gsd-progress`, `gsd-spike`, `gsd-sketch`.

## Methods

| Method | Description |
|--------|-------------|
| `nextCommand(stage, phaseState)` | Recommends the next GSD command given stage + phase state flags (`requirementsLocked`, `hasUI`, `designContractApproved`, `plansApproved`, `executed`, `verified`, `shipped`). |
| `validateAtomicCommit(task)` | Checks a completed task has `commitSha`, `summaryPath`, and `verificationPath`. |
| `auditMilestone(requirements, shipped)` | Diffs declared requirements against shipped ones. |
| `resumeAfterFailure(waves)` | Walks wave groups, preserving completed task IDs and isolating the first failed task for re-planning. |
| `getStage(name)` / `getStages()` | Look up stage metadata. |
| `getAuxiliaryCommands()` | List commands usable in any stage. |
| `toJSON()` | Serializable summary. |

## Example

```js
const GSDWorkflow = require('./index');
const gsd = new GSDWorkflow();

gsd.nextCommand('define', {}); // 'gsd-discuss-phase'
gsd.nextCommand('build', { plansApproved: true, executed: true }); // 'gsd-verify-work'

gsd.validateAtomicCommit({ commitSha: 'abc123', summaryPath: 'T01-SUMMARY.md', verificationPath: 'VERIFICATION.md' });
// { atomic: true, missing: [] }
```
