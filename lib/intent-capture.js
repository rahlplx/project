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
    mvp: 'Auth + Core Feature',
  },
  api: {
    techStack: 'Node.js + PostgreSQL',
    timeline: '1 week',
    mvp: 'CRUD + Auth',
  },
  cli: {
    techStack: 'Node.js + oclif',
    timeline: '3 days',
    mvp: 'Core Command',
  },
  extension: {
    techStack: 'TypeScript + Plasmo',
    timeline: '1 week',
    mvp: 'Content Script + Popup',
  },
  mobile: {
    techStack: 'React Native + Expo',
    timeline: '3 weeks',
    mvp: 'Core Screen + Auth',
  },
  agent: {
    techStack: 'Python + LangChain',
    timeline: '2 weeks',
    mvp: 'Single Tool + Memory',
  },
};

/**
 * Sanitize text input
 * @param {string} text - Raw text
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized text
 */
function sanitizeText(text, maxLength = 2000) {
  if (typeof text !== 'string') return '';
  return (
    text
      .slice(0, maxLength * 2)
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200D\u202A-\u202E\u2066-\u2069]/g, '')
      .trim()
      .slice(0, maxLength)
  );
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
  const safeInput = input || {};
  const errors = [];

  if (!safeInput.projectName || safeInput.projectName.trim() === '') {
    errors.push('Project name is required');
  } else {
    if (safeInput.projectName.length > 100) {
      errors.push('Project name must be 100 characters or less');
    }
    if (/[^a-zA-Z0-9\s-]/.test(safeInput.projectName)) {
      errors.push('Project name can only contain letters, numbers, spaces, and hyphens');
    }
  }

  const textFields = [
    'problem',
    'users',
    'stakes',
    'solution',
    'mvp',
    'outOfScope',
    'successMetrics',
    'techStack',
    'timeline',
  ];
  textFields.forEach(field => {
    if (
      safeInput[field] &&
      typeof safeInput[field] === 'string' &&
      safeInput[field].length > 2000
    ) {
      errors.push(
        `${field.charAt(0).toUpperCase() + field.slice(1)} must be 2000 characters or less`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
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
  const safeInput = input || {};
  const projectName = sanitizeProjectName(
    typeof safeInput.projectName === 'string' ? safeInput.projectName : 'Untitled Project'
  );
  const projectType = detectProjectType(projectName);
  const defaults = SMART_DEFAULTS[projectType];

  const projectData = {
    projectName,
    problem: sanitizeText(safeInput.problem) || 'Not specified',
    users: sanitizeText(safeInput.users) || 'Not specified',
    stakes: sanitizeText(safeInput.stakes) || 'Not specified',
    solution: sanitizeText(safeInput.solution) || 'Not specified',
    mvp: sanitizeText(safeInput.mvp) || defaults.mvp,
    outOfScope: sanitizeText(safeInput.outOfScope) || 'Not specified',
    successMetrics: sanitizeText(safeInput.successMetrics) || 'Not specified',
    techStack: sanitizeText(safeInput.techStack) || defaults.techStack,
    timeline: sanitizeText(safeInput.timeline) || defaults.timeline,
  };

  const prdData = {
    projectName,
    overview: projectData.solution,
    userStories: safeInput.userStories || [],
    acceptanceCriteria: safeInput.acceptanceCriteria || [],
    techStack: projectData.techStack,
    performance: safeInput.performance || 'Not specified',
    security: safeInput.security || 'Not specified',
    outOfScope: projectData.outOfScope,
  };

  return {
    projectMd: generateProjectMd(projectData),
    prdMd: generatePrdMd(prdData),
    projectType,
    defaults,
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
    label: score >= 0.8 ? 'high' : score >= 0.5 ? 'medium' : 'low',
  };
}

module.exports = {
  sanitizeText,
  captureIntent,
  intentConfidence,
  SMART_DEFAULTS,
  detectProjectType,
  validateInput,
  sanitizeProjectName,
};
