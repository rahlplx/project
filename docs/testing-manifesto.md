# 📜 The Vibe-Stack Testing Manifesto

This manifesto outlines the "Proven Ways" for 100% robustness in a codebase built with vibes, agents, and engineering.

---

## 1. The Hierarchy of Robustness

For 100% confidence, we use a multi-layered approach:

| Level              | Method                           | Tool                    | Frequency    |
| ------------------ | -------------------------------- | ----------------------- | ------------ |
| **L1: Unit**       | Functional parity checks         | Jest / `node:test`      | Every PR     |
| **L2: Coverage**   | Mandatory 75%+ line coverage     | Istanbul/c8             | CI Gate      |
| **L3: Invariants** | State machine validation         | `state-machine.test.js` | Every commit |
| **L4: E2E**        | Think → Ship full pipeline audit | `/vibe:qa` (Playwright) | Pre-release  |
| **L5: Infra**      | Skill index & catalog integrity  | `/vibe:harness`         | Autonomous   |

---

## 2. Mandatory Rules for "Vibe-Proofing"

1.  **RED-GREEN-VIBE**: Never implement a feature without a failing test first. The agent MUST verify the test fails before writing code.
2.  **THE CANARY RULE**: Every skill must have a smoke test in its `index.test.js` that instantiates the class and calls its primary method.
3.  **IO ISOLATION**: Use `__fixtures__` for all file system and network mocks. Tests must not touch actual `.vibe/` state unless explicitly testing the persistence layer.
4.  **RECOVERY TESTING**: Every core handler must have a test case for "Malformed State" (empty object or missing keys) to ensure graceful degradation.

---

## 3. How to Ensure Nothing Breaks

- **Pre-Commit Harness**: Run `node bin/vibe.js harness` before every PR. This runs 16+ production-readiness checks including security scans and originality checks.
- **The "Iron Law" of Context**: Always write a handoff before switching layers. This prevents context-drift which is the #1 cause of "vibe-rot."
- **Audit-First Engineering**: Use `/vibe:review` to trigger a multi-perspective review (CEO, Architect, Security) on any logic change over 50 lines.

---

## 4. End-to-End User Testing (UX & Pipeline)

- **Scenario-Based Testing**: We test for "First-Time User Experience" (FTUE).
- **Goal Persistence**: Verify that `goals.json` survives an agent memory reset.
- **Visual Verification**: Use `screenshot-preview` during the Build phase to catch CSS regressions before they reach the user.

---

_Verified by Bolt ⚡, The Architect, and QA._
