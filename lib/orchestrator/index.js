/**
 * Orchestrator Module
 * Unified orchestrator combining gstack, GSD, and Superpowers
 */

const { StateMachine, PHASES, LAYERS } = require('./state-machine');
const { ContextManager } = require('./context-manager');
const { RoleLoader, ROLES, PHASE_ROLES } = require('./role-loader');
const { TrustLevel, LEVELS, RISK_TIERS } = require('./trust-level');
const { GapDetector } = require('./gap-detector');
const { AntiRationalization, EXCUSE_TABLE } = require('./anti-rationalization');

module.exports = {
  StateMachine,
  ContextManager,
  RoleLoader,
  PHASES,
  LAYERS,
  ROLES,
  PHASE_ROLES,
  TrustLevel,
  LEVELS,
  RISK_TIERS,
  GapDetector,
  AntiRationalization,
  EXCUSE_TABLE
};
