#!/usr/bin/env node

class TDDVibe {
  constructor() {
    this.name = 'tdd-vibe';
    this.version = '1.0.0';
    this.description = 'Simplified TDD workflow for vibe coders — test-first without the jargon';
  }

  generateCycle(feature) {
    if (!feature) return { error: 'No feature described.' };

    return {
      cycle: [
        {
          step: 1,
          name: 'RED — Write a test for what you want',
          description: `Write a test that describes what "${feature}" should do. The test will fail because the code doesn't exist yet.`,
          example: `test('${feature}', () => {\n  // Describe expected behavior\n  expect(/* your code */).toBe(/* expected result */);\n});`
        },
        {
          step: 2,
          name: 'GREEN — Write the minimum code to pass',
          description: 'Write just enough code to make the test pass. No extra features, no optimization.',
          example: '// Write the simplest implementation that satisfies the test'
        },
        {
          step: 3,
          name: 'REFACTOR — Clean up without changing behavior',
          description: 'Improve the code while keeping all tests green. Rename variables, extract functions, remove duplication.',
          example: '// Refactor: extract helper, rename vars, simplify logic\n// Run tests again to ensure they still pass'
        }
      ],
      summary: `TDD cycle for "${feature}": Write failing test → make it pass → improve code`,
      timestamp: new Date().toISOString()
    };
  }

  suggestTests(description) {
    const testIdeas = [
      { type: 'happy-path', idea: 'Test the main success scenario works' },
      { type: 'edge-case', idea: 'Test with empty input' },
      { type: 'edge-case', idea: 'Test with maximum values' },
      { type: 'error-case', idea: 'Test with invalid input' },
      { type: 'error-case', idea: 'Test error handling' },
      { type: 'boundary', idea: 'Test boundary conditions' }
    ];
    return { description, testIdeas, count: testIdeas.length };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = TDDVibe;
