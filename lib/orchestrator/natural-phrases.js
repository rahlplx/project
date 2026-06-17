/**
 * Natural Phrases — human-like skill activation announcements
 *
 * Rule: never expose raw "activating skill X" to users.
 * Map each skill to conversational phrases a senior engineer would say.
 * Inspired by continuedev/continue (22k⭐) UX pattern for context-aware suggestions.
 */

const PHRASE_MAP = {
  'vibe-security': [
    'let me check for security gaps before we go further',
    'I see auth/payment code — running a quick OWASP check',
    'checking security before we ship',
  ],
  'vibe-tdd': [
    "I'll write the failing test first, then the code",
    'test before code — let me set that up',
    'setting up the RED-GREEN cycle',
  ],
  'vibe-deploy': [
    'running pre-flight checks before we ship',
    'let me verify the 14-point deploy checklist',
    'checking deploy readiness',
  ],
  'vibe-design': [
    'let me run the anti-slop audit on this',
    'checking typography, contrast, and layout against the design system',
    'auditing this against the 41 design rules',
  ],
  'vibe-review': [
    'taking a second look before we merge',
    'running a 3-perspective code review',
    'virtual team check — code, security, architecture',
  ],
  'vibe-plan': [
    'mapping out the work before we build',
    'breaking this into tasks first',
    'let me create the task breakdown',
  ],
  'vibe-explain': [
    'let me break this down clearly',
    'walking through what this code actually does',
    'translating this into plain language',
  ],
  'grill-gate': [
    'a few quick questions before we start — want to make sure I build the right thing',
    'let me clarify scope before diving in',
    "one question at a time to make sure we're aligned",
  ],
  'vibe-status': [
    'checking where we left off',
    'pulling up the current project state',
    "let me see what's in flight",
  ],
  'vibe-learnings': [
    'mining the git history for patterns',
    "extracting what we've learned so far",
    'building institutional memory from this session',
  ],
};

/**
 * Get a natural phrase for a skill.
 * @param {string} skill - skill name
 * @param {number} [index=0] - rotate through phrases for variety
 * @returns {string|null}
 */
function naturalPhrase(skill, index = 0) {
  const phrases = PHRASE_MAP[skill];
  if (!phrases || !phrases.length) return null;
  return phrases[index % phrases.length];
}

/**
 * Build a single human-like announcement for a set of activated skills.
 * @param {string[]} skills
 * @param {number} [seed=0] - rotation seed for variety
 * @returns {string|null}
 */
function announceSkills(skills, seed = 0) {
  if (!Array.isArray(skills) || !skills.length) return null;
  const phrases = skills.map((s, i) => naturalPhrase(s, seed + i)).filter(Boolean);
  if (!phrases.length) return null;
  if (phrases.length === 1) return phrases[0];
  return phrases[0] + ' — then ' + phrases.slice(1).join(', and ');
}

module.exports = { naturalPhrase, announceSkills, PHRASE_MAP };
