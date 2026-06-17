/**
 * TDD Workflow Engine
 * Implements RED-GREEN-REFACTOR loop with subagent dispatch
 * From obra/superpowers
 */

const fs = require('fs');
const path = require('path');

class TDDWorkflow {
  constructor() {
    this.phases = ['red', 'green', 'refactor'];
    this.currentPhase = null;
    this.taskHistory = [];
  }

  /**
   * Build TDD prompt for subagent
   */
  buildPrompt(task, phase) {
    const prompts = {
      red: `## TDD Phase: RED - Write Failing Test

**Task:** ${task.description}

**Requirements:**
- Write a failing test that defines expected behavior
- Test must be runnable in isolation
- Verify test fails (RED confirmed)
- Do NOT implement any solution code

**Output:**
- Test file at: ${task.testPath}
- Test must fail when run
- Document the expected behavior in the test description

**Constraints:**
- One test file per task
- No implementation code allowed
- Must use project's test framework
- Must include clear assertions`,

      green: `## TDD Phase: GREEN - Implement Minimal Solution

**Task:** ${task.description}

**Test Location:** ${task.testPath}

**Requirements:**
- Minimal implementation to pass the test
- No optimization, no refactoring
- Verify test passes (GREEN confirmed)
- Do NOT change the test

**Output:**
- Implementation file at: ${task.implementationPath}
- Test must pass when run
- Code must be minimal (no extra features)

**Constraints:**
- Only implement what the test requires
- No premature optimization
- No refactoring yet
- Keep code simple and readable`,

      refactor: `## TDD Phase: REFACTOR - Clean Up

**Task:** ${task.description}

**Test Location:** ${task.testPath}
**Implementation Location:** ${task.implementationPath}

**Requirements:**
- Improve code quality without changing behavior
- Tests must still pass after each change
- Apply design patterns where appropriate
- Remove any code smells

**Output:**
- Refactored implementation at: ${task.implementationPath}
- All tests must still pass
- Code quality improved

**Constraints:**
- Do NOT change test behavior
- Do NOT add new features
- Do NOT break existing tests
- Apply SOLID principles where applicable`,
    };

    return prompts[phase];
  }

  /**
   * Execute TDD phase
   */
  async executePhase(task, phase) {
    if (!this.phases.includes(phase)) {
      throw new Error(`Invalid TDD phase: ${phase}`);
    }

    this.currentPhase = phase;
    const prompt = this.buildPrompt(task, phase);

    // Record in history
    this.taskHistory.push({
      task: task.id,
      phase: phase,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });

    return {
      prompt: prompt,
      phase: phase,
      task: task,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verify phase completion
   */
  async verifyPhase(task, phase) {
    const verifications = {
      red: async () => {
        // Verify test fails
        try {
          const testResult = await this.runTest(task.testPath);
          return {
            passed: !testResult.passed,
            message: testResult.passed
              ? 'Test should fail but passed'
              : 'Test fails as expected (RED confirmed)',
            details: testResult,
          };
        } catch (error) {
          return {
            passed: true,
            message: 'Test fails as expected (RED confirmed)',
            details: { error: error.message },
          };
        }
      },

      green: async () => {
        // Verify test passes
        const testResult = await this.runTest(task.testPath);
        return {
          passed: testResult.passed,
          message: testResult.passed ? 'Test passes (GREEN confirmed)' : 'Test still fails',
          details: testResult,
        };
      },

      refactor: async () => {
        // Verify tests still pass
        const testResult = await this.runTest(task.testPath);
        return {
          passed: testResult.passed,
          message: testResult.passed
            ? 'Tests still pass after refactor'
            : 'Tests failed after refactor',
          details: testResult,
        };
      },
    };

    return await verifications[phase]();
  }

  /**
   * Run test (simplified implementation)
   */
  async runTest(testPath) {
    // In a real implementation, this would execute the test
    // For now, return a mock result
    return {
      passed: true,
      duration: 0,
      output: 'Test execution simulated',
    };
  }

  /**
   * Execute full TDD cycle for a task
   */
  async executeCycle(task) {
    const results = [];

    for (const phase of this.phases) {
      const result = await this.executePhase(task, phase);
      const verification = await this.verifyPhase(task, phase);

      results.push({
        phase: phase,
        result: result,
        verification: verification,
        timestamp: new Date().toISOString(),
      });

      // Stop if verification fails
      if (!verification.passed) {
        break;
      }
    }

    this.currentPhase = null;
    return results;
  }

  /**
   * Get task history
   */
  getTaskHistory() {
    return this.taskHistory;
  }

  /**
   * Get current phase
   */
  getCurrentPhase() {
    return this.currentPhase;
  }

  /**
   * Reset workflow
   */
  reset() {
    this.currentPhase = null;
    this.taskHistory = [];
  }
}

module.exports = { TDDWorkflow };
