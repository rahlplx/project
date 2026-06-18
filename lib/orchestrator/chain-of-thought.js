/**
 * Chain-of-Thought reasoning scaffold
 *
 * Ports concepts from stanfordnlp/dspy (34k⭐, Python):
 * - Signature: declarative I/O spec for a reasoning task
 * - ChainOfThought: wraps a Signature with step-by-step reasoning injection
 * - ReAct pattern: Thought → Action → Observation loop
 *
 * No runtime deps. CommonJS. Pure reasoning scaffolding.
 */

class Signature {
  constructor(description, inputFields, outputFields) {
    this.description = description;
    this.inputFields = Array.isArray(inputFields) ? inputFields : [];
    this.outputFields = Array.isArray(outputFields) ? outputFields : [];
  }

  validate(input) {
    const missing = this.inputFields.filter(f => !(f in (input || {})));
    return { valid: missing.length === 0, missing };
  }

  scaffold(input) {
    const { valid, missing } = this.validate(input);
    if (!valid) return { error: `Missing fields: ${missing.join(', ')}` };
    return { ...input, _signature: this.description, _outputFields: this.outputFields };
  }
}

// ChainOfThought wraps any Signature with ReAct reasoning steps
class ChainOfThought {
  constructor(signature) {
    if (!(signature instanceof Signature)) throw new TypeError('Expected a Signature');
    this.signature = signature;
  }

  forward(input) {
    const scaffolded = this.signature.scaffold(input);
    if (scaffolded.error) return { error: scaffolded.error, reasoning_chain: [] };

    const query = input.query || input.milestone || input.spec || '';
    const goal = input.goal || '';

    // ReAct: Thought → Action → Observation
    const reasoning_chain = [
      `[THINK] Task: ${this.signature.description}`,
      `[INPUT] ${query.slice(0, 120)}${query.length > 120 ? '...' : ''}`,
      goal ? `[CONTEXT] Prior goal: ${goal.slice(0, 80)}` : '[CONTEXT] No prior session',
      `[PLAN] Producing: ${this.signature.outputFields.join(', ')}`,
    ].filter(Boolean);

    return {
      ...scaffolded,
      reasoning_chain,
      prompt_prefix: reasoning_chain.join('\n') + '\n',
    };
  }
}

// Pre-built signatures for vibe-stack reasoning tasks
const SIGNATURES = {
  INTENT_CLASSIFY: new Signature(
    'Classify user intent and route to the correct skill bundle',
    ['query'],
    ['intent', 'skills', 'confidence', 'clarifying_questions']
  ),
  CONTEXT_ENRICH: new Signature(
    'Enrich a user query with project context for better agent response',
    ['query', 'goal', 'recentCommits'],
    ['enriched_query', 'injected_context', 'reasoning']
  ),
  GAP_DETECT: new Signature(
    'Detect gaps between design spec and implementation',
    ['spec', 'implementation'],
    ['gaps', 'matchRate', 'priority_fixes']
  ),
  TASK_DECOMPOSE: new Signature(
    'Break a milestone into atomic independently-buildable tasks',
    ['milestone', 'constraints'],
    ['tasks', 'dependencies', 'riskOrder', 'sizes']
  ),
  SECURITY_AUDIT: new Signature(
    'Identify OWASP Top 10 risks in the described feature',
    ['feature', 'techStack'],
    ['risks', 'severity', 'mitigations']
  ),
};

module.exports = { Signature, ChainOfThought, SIGNATURES };
