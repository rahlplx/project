'use strict';

/**
 * Slash-command auto-injection menu.
 *
 * Modes:
 *   on       — always inject skill prompt before response
 *   off      — no injection
 *   adaptive — inject when skill keywords detected in user message
 *
 * caveman: true → auto-trigger /vibe-caveman (full) for token efficiency.
 */

const VALID_MODES = ['on', 'off', 'adaptive'];
const SKILL_KEYWORDS = [
  'deploy',
  'test',
  'plan',
  'review',
  'security',
  'evolve',
  'design',
  'explain',
  'status',
  'tdd',
];

let _mode = 'adaptive';
let _caveman = true;

/** Sets the injection mode. */
function setMode(mode) {
  if (!VALID_MODES.includes(mode)) throw new Error(`Invalid mode: ${mode}. Use on|off|adaptive`);
  _mode = mode;
}

/** Returns current mode. */
function getMode() {
  return _mode;
}

/** Enables or disables caveman auto-trigger. */
function setCaveman(enabled) {
  _caveman = Boolean(enabled);
}

/** Returns whether caveman auto-trigger is active. */
function isCavemanActive() {
  return _caveman;
}

/**
 * Decides whether to inject a skill prompt for the given user message and skill name.
 * Returns true if injection should proceed.
 */
function shouldInject(userMessage, skillName) {
  if (_mode === 'off') return false;
  if (_mode === 'on') return true;

  // adaptive: inject if message contains skill keywords or explicit slash command
  const msg = (userMessage || '').toLowerCase();
  if (msg.includes(`/${skillName}`)) return true;
  const regex = new RegExp('\\b(' + SKILL_KEYWORDS.join('|') + ')\\b', 'i');
  return regex.test(msg);
}

/**
 * Builds the menu status string (shown in session header or on /vibe-status).
 */
function menuStatus() {
  return [
    `Auto-injection: [${_mode}]  Caveman: [${_caveman ? 'on' : 'off'}]`,
    `Modes: ${VALID_MODES.map(m => (m === _mode ? `[${m}]` : m)).join(' | ')}`,
    'Skills: /vibe-plan /vibe /vibe-caveman /vibe-review /vibe-evolve /vibe-security /vibe-tdd',
    _caveman ? 'Token efficiency: caveman full mode auto-triggers on slash commands' : '',
  ]
    .filter(Boolean)
    .join('\n');
}

module.exports = {
  setMode,
  getMode,
  setCaveman,
  isCavemanActive,
  shouldInject,
  menuStatus,
  VALID_MODES,
};
