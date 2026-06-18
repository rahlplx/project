/**
 * Intent Capture Module
 * Captures user intent and generates PROJECT.md + PRD.md
 */

const { generateProjectMd } = require('./templates/project-template');
const { generatePrdMd } = require('./templates/prd-template');

/**
 * Smart defaults by project type
 */
const SMART_DEFAULTS = {
  saas: {
    techStack: 'Next.js + Supabase',
    timeline: '2 weeks',
    mvp: 'Auth + Core Feature'
  },
  api: {
    techStack: 'Node.js + PostgreSQL',
    timeline: '1 week',
    mvp: 'CRUD + Auth'
  },
  cli: {
    techStack: 'Node.js + oclif',
    timeline: '3 days',
    mvp: 'Core Command'
  },
  extension: {
    techStack: 'TypeScript + Plasmo',
    timeline: '1 week',
    mvp: 'Content Script + Popup'
  },
  mobile: {
    techStack: 'React Native + Expo',
    timeline: '3 weeks',
    mvp: 'Core Screen + Auth'
  },
  agent: {
    techStack: 'Python + LangChain',
    timeline: '2 weeks',
    mvp: 'Single Tool + Memory'
  }
};

/**
 * Sanitize text input
 * @param {string} text - Raw text
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized text
 */
function sanitizeText(text, maxLength = 2000) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Strip control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize project name
 * @param {string} name - Raw project name
 * @returns {string} Sanitized name
 */
function sanitizeProjectName(name) {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .slice(0, 100);
}

/**
 * Validate user input
 * @param {Object} input - User input
 * @returns {Object} Validation result
 */
function validateInput(input) {
  const errors = [];

  if (!input.projectName || input.projectName.trim() === '') {
    errors.push('Project name is required');
  } else {
    if (input.projectName.length > 100) {
      errors.push('Project name must be 100 characters or less');
    }
    if (/[^a-zA-Z0-9\s-]/.test(input.projectName)) {
      errors.push('Project name can only contain letters, numbers, spaces, and hyphens');
    }
  }

  const textFields = ['problem', 'users', 'stakes', 'solution', 'mvp', 'outOfScope', 'successMetrics', 'techStack', 'timeline'];
  textFields.forEach(field => {
    if (input[field] && typeof input[field] === 'string' && input[field].length > 2000) {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} must be 2000 characters or less`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Detect project type from name
 * @param {string} projectName - Project name
 * @returns {string} Project type
 */
function detectProjectType(projectName) {
  const name = projectName.toLowerCase();
  if (name.includes('saas') || name.includes('app')) return 'saas';
  if (name.includes('api') || name.includes('service')) return 'api';
  if (name.includes('cli') || name.includes('tool')) return 'cli';
  if (name.includes('extension') || name.includes('addon')) return 'extension';
  if (name.includes('mobile') || name.includes('ios') || name.includes('android')) return 'mobile';
  if (name.includes('agent') || name.includes('bot')) return 'agent';
  return 'saas'; // default
}

/**
 * Capture intent and generate documents
 * @param {Object} input - User input
 * @returns {Object} Generated documents and metadata
 */
function captureIntent(input) {
  const projectName = sanitizeProjectName(input.projectName || 'Untitled Project');
  const projectType = detectProjectType(projectName);
  const defaults = SMART_DEFAULTS[projectType];

  const projectData = {
    projectName,
    problem: sanitizeText(input.problem) || 'Not specified',
    users: sanitizeText(input.users) || 'Not specified',
    stakes: sanitizeText(input.stakes) || 'Not specified',
    solution: sanitizeText(input.solution) || 'Not specified',
    mvp: sanitizeText(input.mvp) || defaults.mvp,
    outOfScope: sanitizeText(input.outOfScope) || 'Not specified',
    successMetrics: sanitizeText(input.successMetrics) || 'Not specified',
    techStack: sanitizeText(input.techStack) || defaults.techStack,
    timeline: sanitizeText(input.timeline) || defaults.timeline
  };

  const prdData = {
    projectName,
    overview: input.solution || 'Not specified',
    userStories: input.userStories || [],
    acceptanceCriteria: input.acceptanceCriteria || [],
    techStack: projectData.techStack,
    performance: input.performance || 'Not specified',
    security: input.security || 'Not specified',
    outOfScope: projectData.outOfScope
  };

  return {
    projectMd: generateProjectMd(projectData),
    prdMd: generatePrdMd(prdData),
    projectType,
    defaults
  };
}

/**
 * Score how complete a captured intent is (0–1).
 * Each specified, non-default field adds to confidence.
 */
function intentConfidence(input) {
  const fields = ['problem', 'users', 'solution', 'mvp', 'successMetrics', 'techStack'];
  const specified = fields.filter(f => input[f] && input[f] !== 'Not specified');
  const score = specified.length / fields.length;
  return {
    score: Math.round(score * 100) / 100,
    specified,
    missing: fields.filter(f => !specified.includes(f)),
    label: score >= 0.8 ? 'high' : score >= 0.5 ? 'medium' : 'low'
  };
}

module.exports = {
  sanitizeText,
  captureIntent,
  intentConfidence,
  SMART_DEFAULTS,
  detectProjectType,
  validateInput,
  sanitizeProjectName
};
