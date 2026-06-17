/**
 * Orchestrator Module
 * Unified orchestrator combining gstack, GSD, and Superpowers
 */

const { StateMachine, PHASES, LAYERS } = require('./state-machine');
const { ContextManager } = require('./context-manager');
const { RoleLoader, ROLES, PHASE_ROLES } = require('./role-loader');
const { TrustLevel, LEVELS, RISK_TIERS } = require('./trust-level');
const { Grill } = require('./grill');
const { SkillRouter } = require('./skill-router');
const { QueryEnricher, SOURCES, WEIGHTS, SKILL_TO_TEMPLATE, CATEGORY_TEMPLATE_IDS } = require('./query-enricher');
const { ChainOfThought, SIGNATURES } = require('./chain-of-thought');
const { announceSkills } = require('./natural-phrases');

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
  Grill,
  SkillRouter,
  QueryEnricher,
  SOURCES,
  WEIGHTS,
  SKILL_TO_TEMPLATE,
  CATEGORY_TEMPLATE_IDS,
  ChainOfThought,
  SIGNATURES,
  announceSkills,
};
