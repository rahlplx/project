#!/usr/bin/env node

class ModelRouter {
  constructor() {
    this.name = 'model-router';
    this.version = '1.0.0';
    this.description = 'Route tasks to optimal AI models based on capability and cost';
  }

  recommend(task) {
    const lower = task.toLowerCase();
    const models = this._getModels();
    const scored = models
      .map(m => ({
        ...m,
        score: this._score(m, lower),
      }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    return {
      task,
      recommended: best.name,
      reason: best.reason,
      alternatives: scored.slice(1, 3).map(m => ({ name: m.name, reason: m.reason })),
      allModels: scored,
      timestamp: new Date().toISOString(),
    };
  }

  _getModels() {
    return [
      {
        name: 'Claude Opus',
        cost: 'high',
        speed: 'slow',
        reasoning: 'excellent',
        code: 'excellent',
        creativity: 'high',
        context: 200000,
        reason: 'Best for complex reasoning, architecture, and strategy tasks.',
      },
      {
        name: 'Claude Sonnet',
        cost: 'medium',
        speed: 'fast',
        reasoning: 'good',
        code: 'excellent',
        creativity: 'medium',
        context: 200000,
        reason: 'Balanced quality and speed; excellent for code tasks.',
      },
      {
        name: 'Claude Haiku',
        cost: 'low',
        speed: 'fastest',
        reasoning: 'good',
        code: 'good',
        creativity: 'medium',
        context: 200000,
        reason: 'Fastest and cheapest; ideal for simple or high-volume tasks.',
      },
      {
        name: 'GPT-4o',
        cost: 'high',
        speed: 'fast',
        reasoning: 'excellent',
        code: 'excellent',
        creativity: 'high',
        context: 128000,
        reason: 'Strong reasoning and creativity; good OpenAI alternative for complex tasks.',
      },
      {
        name: 'GPT-4o Mini',
        cost: 'low',
        speed: 'fastest',
        reasoning: 'good',
        code: 'good',
        creativity: 'medium',
        context: 128000,
        reason: 'Budget OpenAI option for simple classification or drafting tasks.',
      },
    ];
  }

  _score(model, task) {
    let score = 0;
    if (/complex|architecture|strategy|design/.test(task) && model.reasoning === 'excellent') {
      score += 3;
    }
    if (/code|implement|build|function/.test(task) && model.code === 'excellent') score += 3;
    if (/quick|simple|draft|summarize/.test(task) && model.speed === 'fastest') score += 2;
    if (/creative|write|content|design/.test(task) && model.creativity === 'high') score += 2;
    if (/large|whole|full/.test(task) && model.context >= 200000) score += 2;
    if (/budget|cheap|cost/.test(task) && model.cost === 'low') score += 2;
    if (model.cost === 'low') score += 1; // default lean: cheaper wins ties (pass constraints.quality=true to suppress)
    return score;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = ModelRouter;
