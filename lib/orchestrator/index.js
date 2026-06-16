/**
 * Orchestrator Module
 * Unified orchestrator combining gstack, GSD, and Superpowers
 */

const { StateMachine, PHASES, LAYERS } = require('./state-machine');
const { ContextManager } = require('./context-manager');
const { RoleLoader, ROLES, PHASE_ROLES } = require('./role-loader');

module.exports = {
  StateMachine,
  ContextManager,
  RoleLoader,
  PHASES,
  LAYERS,
  ROLES,
  PHASE_ROLES
};
