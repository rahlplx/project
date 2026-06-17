/**
 * QueryEnricher — AutoPrompt context injection pipeline
 *
 * Ports concepts from:
 * - stanfordnlp/dspy (34k⭐): Signature + ChainOfThought pattern
 * - princeton-nlp/swe-agent (19k⭐): repo-navigation context injection
 * - mem0ai/mem0 (53k⭐): persistent memory retrieval
 *
 * Pipeline: route → recall → enrich → CoT scaffold → score
 * All sources degrade gracefully — never throws on missing state.
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
};

// Confidence weights per source — tuned from ReAct+CoT hybrid research
const WEIGHTS = {
  [SOURCES.SKILL_ROUTE]: 0.30,
  [SOURCES.GOAL_BLOCK]: 0.25,
  [SOURCES.GIT_CONTEXT]: 0.20,
  [SOURCES.KNOWLEDGE_BASE]: 0.15,
  [SOURCES.CHAIN_OF_THOUGHT]: 0.10,
};

class QueryEnricher {
  constructor(projectRoot) {
    this.root = projectRoot || process.cwd();
    this.router = new SkillRouter();
    this.ctx = new ContextManager();
    this.cot = new ChainOfThought(SIGNATURES.CONTEXT_ENRICH);
  }

  enrich(query, options = {}) {
    if (!query || typeof query !== 'string') return this._empty(query);

    // ⚡ Bolt: cache hit — same query + goal produces identical enrichment within 30s
    const cacheKey = `${query}:${this.ctx.readGoalBlock()?.goal || ''}`;
    if (enrichCache.has(cacheKey)) return enrichCache.get(cacheKey);

    // Budget gate — skip injection when context is near limit
    try {
      const budget = new RoleLoader().checkContextBudget();
      if (budget && budget.estimated > budget.budget * 0.85) {
        return this._empty(query);
      }
    } catch { /* degrade */ }

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
    } catch { /* degrade */ }

    // 3. Knowledge base recall (mem0-style: retrieve relevant stored knowledge)
    try {
      const kbPath = path.join(this.root, '.vibe', 'knowledge-base.json');
      if (fs.existsSync(kbPath)) {
        const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
        const hits = this._recall(query, kb);
        if (hits.length) sources.push({ type: SOURCES.KNOWLEDGE_BASE, data: hits });
      }
    } catch { /* degrade */ }

    // 4. Git context (SWE-agent: recent commits inform current work)
    try {
      const logPath = path.join(this.root, '.vibe', 'telemetry', 'sessions');
      if (fs.existsSync(logPath)) {
        const latest = fs.readdirSync(logPath).sort().slice(-1)[0];
        if (latest) {
          const raw = fs.readFileSync(path.join(logPath, latest), 'utf8');
          const session = JSON.parse(raw);
          if (session.recentCommits || session.topFiles) {
            sources.push({ type: SOURCES.GIT_CONTEXT, data: session });
          }
        }
      }
    } catch { /* degrade */ }

    // 5. Chain-of-Thought scaffold (DSPy ChainOfThought)
    const goalData = sources.find(s => s.type === SOURCES.GOAL_BLOCK);
    const cotResult = this.cot.forward({
      query,
      goal: goalData ? goalData.data.goal : '',
      recentCommits: '',
    });
    sources.push({ type: SOURCES.CHAIN_OF_THOUGHT, data: cotResult });

    const confidence = this._score(sources);
    const result = {
      original: query,
      skills,
      sources,
      enrichedContext: this._render(sources, query),
      confidence,
      label: confidence >= 0.6 ? 'high' : confidence >= 0.35 ? 'medium' : 'low',
    };
    enrichCache.set(cacheKey, result);
    return result;
  }

  // Jaccard-inspired relevance recall from knowledge base
  _recall(query, kb) {
    const words = new Set(
      query.toLowerCase().split(/\W+/).filter(w => w.length > 3)
    );
    const entries = kb.entries || kb;
    if (typeof entries !== 'object') return [];
    return Object.entries(entries)
      .filter(([k]) => [...words].some(w => k.toLowerCase().includes(w)))
      .slice(0, 3)
      .map(([key, value]) => ({ key, value }));
  }

  _score(sources) {
    return Math.min(1, sources.reduce((s, src) => s + (WEIGHTS[src.type] || 0), 0));
  }

  // OWASP LLM01: sanitize strings before injecting into enrichedContext
  _sanitize(str) {
    if (typeof str !== 'string') return '';
    const INJECTION_SIGNALS = /ignore previous|you are now|disregard|new task:|<\||\|>|\[\[|\]\]/i;
    if (INJECTION_SIGNALS.test(str)) return '';
    return str.split('').filter(c => c.charCodeAt(0) >= 32 || c === '\t').join('').slice(0, 200);
  }

  _render(sources, _query) {
    const lines = [];
    for (const s of sources) {
      if (s.type === SOURCES.SKILL_ROUTE) {
        lines.push(`[SKILL] ${this._sanitize(s.data.skills.join(', '))} — ${this._sanitize(s.data.reason)}`);
      } else if (s.type === SOURCES.GOAL_BLOCK) {
        lines.push(`[GOAL] ${this._sanitize(s.data.goal)} (resume: ${this._sanitize(s.data.resumeWith || 'continue')})`);
      } else if (s.type === SOURCES.KNOWLEDGE_BASE) {
        lines.push(`[KB] ${s.data.map(e => this._sanitize(e.key)).filter(Boolean).join(', ')}`);
      } else if (s.type === SOURCES.GIT_CONTEXT && s.data.topFiles) {
        lines.push(`[GIT] ${(s.data.topFiles || []).slice(0, 3).map(f => this._sanitize(f)).filter(Boolean).join(', ')}`);
      } else if (s.type === SOURCES.CHAIN_OF_THOUGHT && s.data.reasoning_chain) {
        lines.push(s.data.reasoning_chain.map(r => this._sanitize(r)).filter(Boolean).join(' → '));
      }
    }
    return lines.join('\n');
  }

  _empty(query) {
    return { original: query, skills: [], sources: [], enrichedContext: '', confidence: 0, label: 'low' };
  }
}

module.exports = { QueryEnricher, SOURCES, WEIGHTS };
