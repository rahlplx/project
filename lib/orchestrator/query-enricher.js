/**
 * QueryEnricher — AutoPrompt context injection pipeline
 *
 * Ports concepts from:
 * - stanfordnlp/dspy (34k⭐): Signature + ChainOfThought pattern
 * - princeton-nlp/swe-agent (19k⭐): repo-navigation context injection
 * - mem0ai/mem0 (53k⭐): persistent memory retrieval
 *
 * Pipeline: route → recall → enrich → CoT scaffold → template select → score
 * All sources degrade gracefully — never throws on missing state.
 * v2: OTel child spans, adaptive template selection, enrichedContext activation.
 */

const path = require('path');
const fs = require('fs');
const { SkillRouter } = require('./skill-router');
const { ContextManager } = require('./context-manager');
const { RoleLoader } = require('./role-loader');
const { ChainOfThought, SIGNATURES } = require('./chain-of-thought');
const { TTLCache } = require('../performance-optimizer');

// ⚡ Bolt: 30s result cache — avoids redundant file I/O + git log on repeated calls
const enrichCache = new TTLCache(30000);

const SOURCES = {
  SKILL_ROUTE: 'skill_route',
  GOAL_BLOCK: 'goal_block',
  KNOWLEDGE_BASE: 'knowledge_base',
  GIT_CONTEXT: 'git_context',
  CHAIN_OF_THOUGHT: 'chain_of_thought',
  TEMPLATE: 'template',
};

// Confidence weights per source — tuned from ReAct+CoT hybrid research
const WEIGHTS = {
  [SOURCES.SKILL_ROUTE]: 0.3,
  [SOURCES.GOAL_BLOCK]: 0.25,
  [SOURCES.GIT_CONTEXT]: 0.2,
  [SOURCES.KNOWLEDGE_BASE]: 0.15,
  [SOURCES.CHAIN_OF_THOUGHT]: 0.1,
  [SOURCES.TEMPLATE]: 0.0, // informational, doesn't affect confidence score
};

// Map (category, confidence-level) → PromptTemplates templateId
// Confidence levels: full (≥0.6), medium (0.35–0.59), minimal (<0.35)
const CATEGORY_TEMPLATE_IDS = {
  testing:   { full: 'unit-tests',         medium: 'e2e-tests',        minimal: 'unit-tests' },
  security:  { full: 'owasp-audit',        medium: 'dependency-scan',  minimal: 'secret-scan' },
  devops:    { full: 'docker',             medium: 'ci-cd',            minimal: 'ci-cd' },
  refactor:  { full: 'clean-code',         medium: 'performance',      minimal: 'typescript' },
  web:       { full: 'landing-page',       medium: 'dashboard',        minimal: 'form' },
  'ai-agent':{ full: 'context-injection',  medium: 'skill-routing',    minimal: 'memory-recall' },
  backend:   { full: 'rest-api',           medium: 'graphql',          minimal: 'webhook' },
};

// Map SkillRouter output names → prompt-template categories (adaptive selection)
// Keys must match what SkillRouter.route() returns (vibe-* namespace).
const SKILL_TO_TEMPLATE = {
  'vibe-tdd': 'testing',
  'vibe-harness': 'testing',
  'vibe-security': 'security',
  'vibe-deploy': 'devops',
  'vibe-review': 'refactor',
  'vibe-design': 'web',
  'vibe-template': 'web',
  'vibe-explain': 'ai-agent',
  'vibe-status': 'ai-agent',
  'vibe-plan': 'ai-agent',
  'vibe-evolve': 'ai-agent',
  'vibe-learnings': 'ai-agent',
  'vibe-retro': 'ai-agent',
};

class QueryEnricher {
  constructor(projectRoot) {
    this.root = projectRoot || process.cwd();
    this.router = new SkillRouter();
    this.ctx = new ContextManager();
    this.cot = new ChainOfThought(SIGNATURES.CONTEXT_ENRICH);
  }

  enrich(query, options = {}) {
    if (!query || typeof query !== 'string') { return this._empty(query); }

    const { parentSpan = null } = options;

    // ⚡ Bolt: cache hit — same query + goal produces identical enrichment within 30s
    const cacheKey = `${query}:${this.ctx.readGoalBlock()?.goal || ''}`;
    if (enrichCache.has(cacheKey)) { return enrichCache.get(cacheKey); }

    // Budget gate — skip injection when context is near limit
    try {
      const budget = new RoleLoader().checkContextBudget();
      if (budget && budget.estimated > budget.budget * 0.85) {
        return this._empty(query);
      }
    } catch {
      /* degrade */
    }

    // OTel: child span inherits traceId from root command span
    let pipelineSpan = null;
    try {
      const { getTracer } = require('../telemetry/otel-tracer');
      pipelineSpan = getTracer('enricher', this.root)
        .startSpan('enricher.pipeline', { query: query.slice(0, 80) }, parentSpan);
    } catch {
      /* tracer optional */
    }

    const sources = [];

    // 1. Route to skill bundle (SkillRouter)
    const route = this.router.route(query);
    const skills = route.skills[0] !== 'vibe' ? route.skills : [];
    if (skills.length) {
      sources.push({ type: SOURCES.SKILL_ROUTE, data: { skills, reason: route.reason } });
    }

    // 2. Session goal block (ContextManager — SWE-agent: persistent state across turns)
    try {
      const goal = this.ctx.readGoalBlock();
      if (goal && goal.goal) {
        sources.push({ type: SOURCES.GOAL_BLOCK, data: goal });
      }
    } catch {
      /* degrade */
    }

    // 3. Knowledge base recall (mem0-style)
    // OWASP LLM01: sanitize KB keys at load time — KB entries are untrusted external data
    try {
      const kbPath = path.join(this.root, '.vibe', 'knowledge-base.json');
      if (fs.existsSync(kbPath)) {
        const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
        const hits = this._recall(query, kb).map(e => ({
          key: this._sanitize(e.key),
          value: typeof e.value === 'string' ? this._sanitize(e.value) : e.value,
        })).filter(e => e.key);
        if (hits.length) { sources.push({ type: SOURCES.KNOWLEDGE_BASE, data: hits }); }
      }
    } catch {
      /* degrade */
    }

    // 4. Git context (SWE-agent: recent commits inform current work)
    // OWASP LLM01: validate structure + sanitize paths before injection
    try {
      const logPath = path.join(this.root, '.vibe', 'telemetry', 'sessions');
      if (fs.existsSync(logPath)) {
        const latest = fs.readdirSync(logPath).sort().slice(-1)[0];
        if (latest) {
          const raw = fs.readFileSync(path.join(logPath, latest), 'utf8');
          const session = JSON.parse(raw);
          if (session && typeof session === 'object' && (session.recentCommits || session.topFiles)) {
            if (Array.isArray(session.topFiles)) {
              session.topFiles = session.topFiles.map(f => this._sanitize(String(f))).filter(Boolean);
            }
            sources.push({ type: SOURCES.GIT_CONTEXT, data: session });
          }
        }
      }
    } catch {
      /* degrade */
    }

    // 5. Chain-of-Thought scaffold (DSPy ChainOfThought)
    const goalData = sources.find(s => s.type === SOURCES.GOAL_BLOCK);
    const cotResult = this.cot.forward({
      query,
      goal: goalData ? goalData.data.goal : '',
      recentCommits: '',
    });
    sources.push({ type: SOURCES.CHAIN_OF_THOUGHT, data: cotResult });

    const confidence = this._score(sources);

    // 6. Adaptive template selection — picks template based on skills + confidence
    const selectedTemplate = this._selectTemplate(skills, confidence);
    if (selectedTemplate) {
      sources.push({ type: SOURCES.TEMPLATE, data: selectedTemplate });
    }

    // Record enrichment span attributes before ending
    if (pipelineSpan) {
      try {
        pipelineSpan
          .setAttribute('enricher.sources', sources.map(s => s.type).join(','))
          .setAttribute('enricher.confidence', confidence)
          .setAttribute('template', selectedTemplate ? `${selectedTemplate.category}/${selectedTemplate.id}` : 'none')
          .end();
      } catch {
        /* degrade */
      }
    }

    const result = {
      original: query,
      skills,
      sources,
      enrichedContext: this._render(sources, query),
      confidence,
      label: confidence >= 0.6 ? 'high' : confidence >= 0.35 ? 'medium' : 'low',
      selectedTemplate,
    };
    enrichCache.set(cacheKey, result);
    return result;
  }

  // Adaptive template selection based on skill routing + confidence threshold
  _selectTemplate(skills, confidence) {
    // Low confidence → generic template hint only
    const level = confidence >= 0.6 ? 'full' : confidence >= 0.35 ? 'medium' : 'minimal';
    for (const skill of skills) {
      const category = SKILL_TO_TEMPLATE[skill];
      if (category) {
        return { category, id: level, skill };
      }
    }
    return null;
  }

  // Jaccard-inspired relevance recall from knowledge base
  _recall(query, kb) {
    const words = new Set(
      query
        .toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 3)
    );
    const entries = kb.entries || kb;
    if (typeof entries !== 'object') { return []; }
    return Object.entries(entries)
      .filter(([k]) => [...words].some(w => k.toLowerCase().includes(w)))
      .slice(0, 3)
      .map(([key, value]) => ({ key, value }));
  }

  _score(sources) {
    return Math.min(
      1,
      sources.reduce((s, src) => s + (WEIGHTS[src.type] || 0), 0)
    );
  }

  // OWASP LLM01: sanitize strings before injecting into enrichedContext
  _sanitize(str) {
    if (typeof str !== 'string') { return ''; }
    const INJECTION_SIGNALS = /ignore previous|you are now|disregard|new task:|<\||\|>|\[\[|\]\]/i;
    if (INJECTION_SIGNALS.test(str)) {
      // Emit OTel security event for observability
      try {
        const { getTracer } = require('../telemetry/otel-tracer');
        getTracer('vibe-security', this.root)
          .startSpan('owasp.lm01.injection', { source: str.slice(0, 40) })
          .addEvent('prompt_injection_attempt', { source: str.slice(0, 40) })
          .end();
      } catch {
        /* tracer unavailable */
      }
      return '';
    }
    return str
      .split('')
      .filter(c => {
        const cp = c.charCodeAt(0);
        if (c === '\t') return true;
        if (cp < 32) return false;
        // Strip Unicode BiDi overrides + zero-width chars (visual deception vectors)
        if (cp >= 0x200B && cp <= 0x200F) return false;
        if (cp >= 0x202A && cp <= 0x202E) return false;
        if (cp === 0xFEFF) return false;
        return true;
      })
      .join('')
      .slice(0, 200);
  }

  _render(sources, _query) {
    const lines = [];
    for (const s of sources) {
      if (s.type === SOURCES.SKILL_ROUTE) {
        lines.push(
          `[SKILL] ${this._sanitize(s.data.skills.join(', '))} — ${this._sanitize(s.data.reason)}`
        );
      } else if (s.type === SOURCES.GOAL_BLOCK) {
        lines.push(
          `[GOAL] ${this._sanitize(s.data.goal)} (resume: ${this._sanitize(s.data.resumeWith || 'continue')})`
        );
      } else if (s.type === SOURCES.KNOWLEDGE_BASE) {
        lines.push(
          `[KB] ${s.data
            .map(e => this._sanitize(e.key))
            .filter(Boolean)
            .join(', ')}`
        );
      } else if (s.type === SOURCES.GIT_CONTEXT && s.data.topFiles) {
        lines.push(
          `[GIT] ${(s.data.topFiles || [])
            .slice(0, 3)
            .map(f => this._sanitize(f))
            .filter(Boolean)
            .join(', ')}`
        );
      } else if (s.type === SOURCES.CHAIN_OF_THOUGHT && s.data.reasoning_chain) {
        lines.push(
          s.data.reasoning_chain
            .map(r => this._sanitize(r))
            .filter(Boolean)
            .join(' → ')
        );
      } else if (s.type === SOURCES.TEMPLATE && s.data) {
        lines.push(`[TEMPLATE] ${s.data.category} (${s.data.id})`);
      }
    }
    return lines.join('\n');
  }

  _empty(query) {
    return {
      original: query,
      skills: [],
      sources: [],
      enrichedContext: '',
      confidence: 0,
      label: 'low',
      selectedTemplate: null,
    };
  }
}

module.exports = { QueryEnricher, SOURCES, WEIGHTS, SKILL_TO_TEMPLATE, CATEGORY_TEMPLATE_IDS };
