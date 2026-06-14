/**
 * Project Template Generator
 * Generates PROJECT.md from structured input
 */

const DEFAULT_VALUES = {
  projectName: 'Untitled Project',
  problem: 'Not specified',
  users: 'Not specified',
  stakes: 'Not specified',
  solution: 'Not specified',
  mvp: 'Not specified',
  outOfScope: 'Not specified',
  successMetrics: 'Not specified',
  techStack: 'Not specified',
  timeline: 'Not specified'
};

/**
 * Generate PROJECT.md content from input
 * @param {Object} input - Project data
 * @returns {string} PROJECT.md content
 */
function generateProjectMd(input) {
  const data = { ...DEFAULT_VALUES, ...input };

  return `# ${data.projectName}

## Problem
${data.problem}

## Users
${data.users}

## Stakes
${data.stakes}

## Solution
${data.solution}

## MVP
${data.mvp}

## Out of Scope
${data.outOfScope}

## Success Metrics
${data.successMetrics}

## Tech Stack
${data.techStack}

## Timeline
${data.timeline}
`;
}

module.exports = { generateProjectMd };
