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
const { Grill, VAGUE_SIGNALS } = require('./grill');
const { SkillRouter, ROUTING_TABLE } = require('./skill-router');
const { QueryEnricher, SOURCES, WEIGHTS } = require('./query-enricher');
const { Signature, ChainOfThought, SIGNATURES } = require('./chain-of-thought');
const { naturalPhrase, announceSkills, PHRASE_MAP } = require('./natural-phrases');

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
  EXCUSE_TABLE,
  Grill,
  VAGUE_SIGNALS,
  SkillRouter,
  ROUTING_TABLE,
  QueryEnricher,
  SOURCES,
  WEIGHTS,
  Signature,
  ChainOfThought,
  SIGNATURES,
  naturalPhrase,
  announceSkills,
  PHRASE_MAP,
};
