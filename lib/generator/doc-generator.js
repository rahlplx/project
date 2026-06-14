/**
 * Doc Generator Module
 * Generates PROJECT.md, PRD.md, and MARKET_RESEARCH.md from intent and research
 */

const { generateProjectMd } = require('../templates/project-template');
const { generatePrdMd } = require('../templates/prd-template');
const { generateResearchMd } = require('../research/template');

/**
 * Generate all documents
 * @param {Object} intent - User intent
 * @param {Object} research - Research data
 * @returns {Object} Generated documents
 */
function generateDocs(intent, research) {
  const projectData = {
    projectName: intent.projectName || 'Untitled Project',
    problem: intent.problem || 'Not specified',
    users: intent.users || 'Not specified',
    stakes: intent.stakes || 'Not specified',
    solution: intent.solution || 'Not specified',
    mvp: intent.mvp || 'Not specified',
    outOfScope: intent.outOfScope || 'Not specified',
    successMetrics: intent.successMetrics || 'Not specified',
    techStack: intent.techStack || 'Not specified',
    timeline: intent.timeline || 'Not specified'
  };

  const prdData = {
    projectName: intent.projectName || 'Untitled Project',
    overview: intent.solution || 'Not specified',
    userStories: intent.userStories || [],
    acceptanceCriteria: intent.acceptanceCriteria || [],
    techStack: intent.techStack || 'Not specified',
    performance: intent.performance || 'Not specified',
    security: intent.security || 'Not specified',
    outOfScope: intent.outOfScope || 'Not specified'
  };

  const researchData = {
    projectName: intent.projectName || 'Untitled Project',
    researchDate: new Date().toISOString().split('T')[0],
    marketOverview: research.marketOverview || 'Not specified',
    competitors: research.competitors || [],
    openSourceTools: research.openSourceTools || [],
    recommendations: research.recommendations || [],
    risks: research.risks || [],
    nextSteps: research.nextSteps || []
  };

  return {
    projectMd: generateProjectMd(projectData),
    prdMd: generatePrdMd(prdData),
    marketResearchMd: generateResearchMd(researchData)
  };
}

module.exports = { generateDocs };
