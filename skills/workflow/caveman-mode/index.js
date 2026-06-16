const fs = require('fs');
const path = require('path');

const LEVELS = {
  lite: {
    name: 'lite',
    description: 'Drop filler and hedging, keep normal sentence structure.',
    instructions: 'Remove filler phrases ("I would be happy to", "let me", "it looks like") and hedging ("I think", "perhaps", "it seems"). Keep full sentences and normal grammar.'
  },
  full: {
    name: 'full',
    description: 'Default caveman mode — terse, no filler, short sentences.',
    instructions: 'Cut all filler, hedging, and scaffolding. Use short, direct sentences. State conclusions first. Preserve every technical fact, number, and code token exactly.'
  },
  ultra: {
    name: 'ultra',
    description: 'Telegraphic style — drop articles and conjunctions where meaning survives.',
    instructions: 'Telegraphic style: drop articles (a/an/the) and conjunctions where meaning survives. Fragments over sentences. No pleasantries. Preserve all technical facts, numbers, and code tokens exactly.'
  },
  wenyan: {
    name: 'wenyan',
    description: 'Classical-Chinese-influenced maximal terseness (requires the agent’s own language ability — not a mechanical transform).',
    instructions: 'Compress to the shortest form that still reads as natural language, in the spirit of classical Chinese terseness. This level cannot be produced by mechanical text-stripping; the agent must rewrite using its own language model.',
    requiresModel: true
  }
};

const FILLER_PHRASES = [
  /\bi(?:'d| would) be happy to\b/gi,
  /\blet me\b/gi,
  /\bit looks like\b/gi,
  /\bit seems(?: that)?\b/gi,
  /\bi think\b/gi,
  /\bperhaps\b/gi,
  /\bjust to (?:confirm|clarify|note)\b/gi,
  /\bas you (?:can see|mentioned)\b/gi,
  /\bi(?:'m| am) going to\b/gi,
  /\bin order to\b/gi,
  /\bplease note that\b/gi,
  /\bbasically\b/gi
];

const ARTICLES_CONJUNCTIONS = [
  /\b(?:the|a|an)\b\s*/gi,
  /\b(?:and|but|so)\b\s*/gi
];

const REVIEW_EMOJI = { critical: '🔴', warning: '🟡', info: '🟢' };

class CavemanMode {
  constructor(options = {}) {
    this.name = 'caveman-mode';
    this.version = '1.0.0';
    this.description = 'Terse-output mode — strips filler/hedging to cut response tokens while preserving technical accuracy.';
    this.statsPath = options.statsPath || path.resolve(process.cwd(), '.vibe', 'telemetry', 'caveman-stats.json');
  }

  getLevel(level) {
    const found = LEVELS[level];
    if (!found) {
      return { type: 'error', message: `Unknown caveman level: ${level}. Valid levels: ${Object.keys(LEVELS).join(', ')}` };
    }
    return found;
  }

  listLevels() {
    return Object.values(LEVELS).map(({ name, description, requiresModel }) => ({ name, description, requiresModel: !!requiresModel }));
  }

  compressText(text, level = 'full') {
    const def = this.getLevel(level);
    if (def.type === 'error') return def;

    if (def.requiresModel) {
      return { level, requiresModel: true, text, note: def.instructions };
    }

    let out = text;
    for (const re of FILLER_PHRASES) out = out.replace(re, '');
    if (level === 'ultra') {
      for (const re of ARTICLES_CONJUNCTIONS) out = out.replace(re, '');
    }
    out = out.replace(/[ \t]+/g, ' ').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    return {
      level,
      requiresModel: false,
      text: out,
      beforeChars: text.length,
      afterChars: out.length,
      reductionPct: text.length === 0 ? 0 : Math.round((1 - out.length / text.length) * 1000) / 10
    };
  }

  formatCommitMessage({ type, scope, subject, body }) {
    if (!type || !subject) {
      return { type: 'error', message: 'formatCommitMessage requires { type, subject }' };
    }
    const header = scope ? `${type}(${scope}): ${subject}` : `${type}: ${subject}`;
    const truncatedHeader = header.length > 50 ? header.slice(0, 50) : header;
    return {
      header: truncatedHeader,
      truncated: header.length > 50,
      body: body ? body.trim() : '',
      full: body ? `${truncatedHeader}\n\n${body.trim()}` : truncatedHeader
    };
  }

  formatReviewComment({ line, severity = 'warning', category, message }) {
    if (!line || !category || !message) {
      return { type: 'error', message: 'formatReviewComment requires { line, category, message }' };
    }
    const emoji = REVIEW_EMOJI[severity] || REVIEW_EMOJI.warning;
    return { comment: `L${line}: ${emoji} ${category}: ${message}` };
  }

  recordSavings({ beforeChars, afterChars, costPerKChars = 0 }) {
    if (typeof beforeChars !== 'number' || typeof afterChars !== 'number') {
      return { type: 'error', message: 'recordSavings requires numeric { beforeChars, afterChars }' };
    }
    const stats = this._readStats();
    stats.records.push({
      beforeChars,
      afterChars,
      savedChars: beforeChars - afterChars,
      timestamp: new Date().toISOString()
    });
    stats.totalBeforeChars += beforeChars;
    stats.totalAfterChars += afterChars;
    stats.totalCostSavedUsd += ((beforeChars - afterChars) / 1000) * costPerKChars;
    this._writeStats(stats);
    return this.getStats();
  }

  getStats() {
    const stats = this._readStats();
    const totalSaved = stats.totalBeforeChars - stats.totalAfterChars;
    return {
      sessions: stats.records.length,
      totalBeforeChars: stats.totalBeforeChars,
      totalAfterChars: stats.totalAfterChars,
      totalSavedChars: totalSaved,
      reductionPct: stats.totalBeforeChars === 0 ? 0 : Math.round((totalSaved / stats.totalBeforeChars) * 1000) / 10,
      totalCostSavedUsd: Math.round(stats.totalCostSavedUsd * 10000) / 10000
    };
  }

  _readStats() {
    try {
      return JSON.parse(fs.readFileSync(this.statsPath, 'utf8'));
    } catch {
      return { records: [], totalBeforeChars: 0, totalAfterChars: 0, totalCostSavedUsd: 0 };
    }
  }

  _writeStats(stats) {
    const dir = path.dirname(this.statsPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.statsPath, JSON.stringify(stats, null, 2) + '\n', 'utf8');
  }

  toMarkdown() {
    let md = '# Caveman Mode\n\n';
    md += `${this.description}\n\n`;
    md += '## Levels\n\n';
    for (const l of this.listLevels()) {
      md += `- **${l.name}**: ${l.description}${l.requiresModel ? ' (requires model rewrite)' : ''}\n`;
    }
    return md;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description, levels: this.listLevels() };
  }
}

module.exports = CavemanMode;
