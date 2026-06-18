/**
 * PRD Template Generator
 * Generates PRD.md from structured input
 */

const DEFAULT_VALUES = {
  projectName: 'Untitled Project',
  overview: 'Not specified',
  userStories: [],
  acceptanceCriteria: [],
  techStack: 'Not specified',
  performance: 'Not specified',
  security: 'Not specified',
  outOfScope: 'Not specified',
};

/**
 * Generate PRD.md content from input
 * @param {Object} input - PRD data
 * @returns {string} PRD.md content
 */
function generatePrdMd(input) {
  const data = { ...DEFAULT_VALUES, ...input };

  const userStories = data.userStories
    .map(s => `- As a ${s.user}, I want ${s.feature} so that ${s.benefit}`)
    .join('\n');

  const acceptanceCriteria = data.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n');

  return `# Product Requirements Document: ${data.projectName}

## Overview
${data.overview}

## User Stories
${userStories || 'No user stories defined'}

## Acceptance Criteria
${acceptanceCriteria || 'No acceptance criteria defined'}

## Technical Requirements
- Stack: ${data.techStack}
- Performance: ${data.performance}
- Security: ${data.security}

## Out of Scope
${data.outOfScope}
`;
}

module.exports = { generatePrdMd };
