# Documentation Audit & Evolution Strategy

## 1. Executive Summary
The documentation for `vibe-stack` is high-quality but suffers from significant architectural drift between the core repository and the agent-native skill layers (e.g., Claude Code). Unification and standardization are required to ensure consistent agent performance across different platforms.

## 2. Key Findings

### 2.1 Skill Documentation Inconsistency
- **Finding**: 12 skills use `README.md` while 9 use `SKILL.md`. The root `AGENTS.md` explicitly mandates `SKILL.md`.
- **Impact**: AI agents may fail to discover or correctly parse skills that use the non-standard `README.md` format, leading to decreased reliability.
- **Priority**: High

### 2.2 Architectural Phase Drift
- **Finding**: `.claude/skills/vibe/SKILL.md` describes a 4-phase enterprise workflow, while `references/vibe-auto.md` and `lib/orchestrator/state-machine.js` implement an 8-10 phase pipeline.
- **Impact**: Severe context confusion when an agent (like Claude) transitions from its high-level "vibe" skill to the underlying project state.
- **Priority**: Critical

### 2.3 Competing Quality Gate Definitions
- **Finding**: `vibe:harness` and `docs/workflow/VERIFY.md` both define "7-Step Checks" but with different criteria (Catalog vs. Index Integrity).
- **Impact**: Ambiguity in what "Verified" actually means for a project.
- **Priority**: Medium

### 2.4 Security Documentation Gaps
- **Finding**: `SECURITY.md` is focused on reporting vulnerabilities but doesn't link to the actual security tools (`security-scan.js`) or the 41 anti-slop rules that enforce security.
- **Impact**: Developers may not realize the built-in security capabilities of the stack.
- **Priority**: Medium

## 3. Recommended Actions

### Task 1: Skill Standardization (Standardize the "Skill Standard")
- Rename all `README.md` in `skills/` to `SKILL.md`.
- Validate that each `SKILL.md` contains the required sections: `When to use`, `Methods`, `Output`, and `Example`.

### Task 2: Phase Unification
- Update `.claude/skills/vibe/SKILL.md` to map its 4 high-level phases to the underlying 8-phase pipeline accurately.
- Ensure consistent terminology (e.g., "Harness" vs "Verify").

### Task 3: Security Documentation Linkage
- Update `SECURITY.md` to include a "Security Features" section pointing to `vibe-security` and `lib/security-scan.js`.
- Add documentation for the refined ASI03-005 precision logic to `lib/security-scan.md` (if it exists) or within `vibe-security` reference.

### Task 4: Workflow Map Refinement
- Resolve the overlap between `references/vibe-harness.md` and `docs/workflow/VERIFY.md` by unifying them into a single "Production Readiness Gate" definition.

## 4. Documentation Quality Score
- **Human Clarity**: 8/10
- **Agent Discoverability**: 6/10
- **Term Consistency**: 5/10
- **Overall**: 6.3/10
