#!/usr/bin/env node

const { SkillBase } = require('../../../lib/skill-base.js');
const fs = require('fs');

class SpecEngine extends SkillBase {
  constructor() {
    super();
    this.name = 'spec-engine';
    this.version = '1.0.0';
    this.description =
      'Parse natural language intent into structured specs for spec-driven development';
  }

  generate(intentPrompt) {
    if (!intentPrompt || !intentPrompt.trim()) {
      return this._emptySpec();
    }

    const text = intentPrompt.trim();
    const title = this._extractTitle(text);
    const features = this._extractFeatures(text);
    const requirements = this._extractRequirements(text);
    const constraints = this._extractConstraints(text);
    const contradictions = this._detectContradictions(constraints);
    const actors = this._extractActors(text);
    const dependencies = this._extractDependencies(text);

    return {
      title,
      version: '1.0.0',
      features,
      requirements,
      constraints,
      contradictions,
      actors,
      dependencies,
      timestamp: new Date().toISOString(),
    };
  }

  validate(spec) {
    const issues = [];

    if (!spec.title || spec.title === 'Untitled') {
      issues.push('Missing required field: title');
    }

    if (!spec.features || spec.features.length === 0) {
      issues.push('Missing required field: features (must have at least 1)');
    } else {
      const ids = spec.features.map(f => f.id);
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (duplicates.length > 0) {
        issues.push(`duplicate feature IDs found: ${[...new Set(duplicates)].join(', ')}`);
      }
      spec.features.forEach((f, i) => {
        if (!f.id) issues.push(`Feature at index ${i} missing id`);
        if (!f.name) issues.push(`Feature at index ${i} missing name`);
        if (!f.priority) issues.push(`Feature at index ${i} missing priority`);
      });
    }

    if (spec.contradictions && spec.contradictions.length > 0) {
      issues.push(`constraint contradictions detected: ${spec.contradictions.length} issue(s)`);
    }

    return {
      valid: issues.length === 0,
      issues,
      timestamp: new Date().toISOString(),
    };
  }

  toSpecFile(spec, filePath) {
    if (!filePath) {
      throw new Error('filePath is required');
    }
    fs.writeFileSync(filePath, JSON.stringify(spec, null, 2), 'utf-8');
    return { success: true, path: filePath };
  }

  fromSpecFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  }

  _emptySpec() {
    return {
      title: 'Untitled',
      version: '1.0.0',
      features: [],
      requirements: [],
      constraints: [],
      contradictions: [],
      actors: [],
      dependencies: [],
      timestamp: new Date().toISOString(),
    };
  }

  _extractTitle(text) {
    const patterns = [
      /(?:build|create|develop|make)\s+(?:a|an|the)\s+([^,.]+)/i,
      /^(?:build|create|develop|make)\s+([^,.]+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1);
    }
    const words = text.split(/\s+/).slice(0, 5).join(' ');
    return words.length > 0 ? words.charAt(0).toUpperCase() + words.slice(1) : 'Untitled';
  }

  _extractFeatures(text) {
    let cleaned = text
      .replace(/^(?:build|create|develop|make)\s+(?:a|an|the)\s+/i, '')
      .replace(/^(?:build|create|develop|make)\s+/i, '');
    cleaned = cleaned.replace(/\./g, ',').replace(/\s*,\s*/g, ',');

    const segments = cleaned
      .split(/,|\band\b|\bwith\b|\bincluding\b/)
      .map(s => s.trim())
      .filter(s => s.length > 2);

    const featureNames = [];
    const skipWords = [
      'must',
      'should',
      'need',
      'can',
      'will',
      'not',
      'be',
      'is',
      'are',
      'the',
      'a',
      'an',
      'this',
      'that',
      'for',
      'and',
      'but',
      'or',
      'have',
      'has',
      'do',
      'does',
      'was',
      'were',
      'been',
      'being',
      'having',
      'doing',
    ];

    for (const segment of segments) {
      const words = segment.split(/\s+/).filter(w => !skipWords.includes(w.toLowerCase()));
      if (words.length > 0 && words.length < 10) {
        const name = words.join(' ');
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
        if (!featureNames.includes(capitalized)) {
          featureNames.push(capitalized);
        }
      }
    }

    return featureNames.map((name, i) => ({
      id: `FEAT-${String(i + 1).padStart(3, '0')}`,
      name,
      priority: i === 0 ? 'high' : i < 3 ? 'medium' : 'low',
      status: 'planned',
      acceptanceCriteria: [],
    }));
  }

  _extractRequirements(text) {
    const reqs = [];
    const patterns = [
      /must\s+(?:have|support|include|use|provide|require|be\s+able\s+to)\s+([^,.]+)/gi,
      /should\s+(?:have|support|include|use|provide|require|be\s+able\s+to)\s+([^,.]+)/gi,
      /need(?:s)?\s+to\s+(?:have|support|include|use|provide)\s+([^,.]+)/gi,
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        reqs.push(match[1].trim());
      }
    }
    return reqs.map((r, i) => ({
      id: `REQ-${String(i + 1).padStart(3, '0')}`,
      description: r.charAt(0).toUpperCase() + r.slice(1),
      priority: i < 2 ? 'high' : 'medium',
      status: 'open',
    }));
  }

  _extractConstraints(text) {
    const constraints = [];
    const patterns = [
      /must\s+be\s+([^,.]+)/gi,
      /must\s+require\s+([^,.]+)/gi,
      /must\s+not\s+([^,.]+)/gi,
      /should\s+not\s+([^,.]+)/gi,
      /cannot\s+([^,.]+)/gi,
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        constraints.push(match[1].trim().toLowerCase());
      }
    }
    return [...new Set(constraints)];
  }

  _detectContradictions(constraints) {
    const contradictions = [];
    const pairs = [
      ['offline', 'cloud'],
      ['offline', 'api'],
      ['offline', 'online'],
      ['sqlite', 'postgresql'],
      ['sqlite', 'mysql'],
      ['no auth', 'authentication'],
      ['no auth', 'login'],
      ['mobile only', 'desktop'],
      ['desktop only', 'mobile'],
    ];
    for (let i = 0; i < constraints.length; i++) {
      for (let j = i + 1; j < constraints.length; j++) {
        const a = constraints[i].toLowerCase();
        const b = constraints[j].toLowerCase();
        for (const [x, y] of pairs) {
          if ((a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x))) {
            contradictions.push(`"${constraints[i]}" conflicts with "${constraints[j]}"`);
          }
        }
      }
    }
    return [...new Set(contradictions)];
  }

  _extractActors(text) {
    const actors = [];
    const patterns = [
      /(?:users?|admins?|managers?|developers?|customers?|clients?)\s+can\s+([^,.]+)/gi,
      /(?:users?|admins?|managers?|developers?|customers?|clients?)\b/gi,
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const actor = match[0].toLowerCase();
        const normalized = actor.replace(/\s+can.*/, '').trim();
        if (normalized && !actors.includes(normalized)) {
          actors.push(normalized);
        }
      }
    }
    return [...new Set(actors)];
  }

  _extractDependencies(text) {
    const deps = [];
    const patterns = [
      /depends?\s+(?:on|upon)\s+([^,.]+)/gi,
      /requires?\s+([^,.]+)/gi,
      /uses?\s+([^,.]+)/gi,
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        deps.push(match[1].trim().toLowerCase());
      }
    }
    return [...new Set(deps)];
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = SpecEngine;
