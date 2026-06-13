const ModelRouter = require('./index');

describe('ModelRouter', () => {
  it('should create instance', () => {
    const s = new ModelRouter();
    expect(s.name).toBe('model-router');
  });

  it('should recommend model for code task', () => {
    const s = new ModelRouter();
    const r = s.recommend('implement a login system');
    expect(r.recommended).toBeTruthy();
    expect(r.alternatives.length).toBe(2);
  });

  it('should recommend for creative task', () => {
    const s = new ModelRouter();
    const r = s.recommend('design a landing page');
    expect(r.recommended).toBeTruthy();
  });

  it('should handle empty description and return fallback', () => {
    const s = new ModelRouter();
    const r = s.recommend('');
    expect(r.task).toBe('');
    expect(r.recommended).toBeTruthy();
    expect(r.alternatives.length).toBe(2);
  });

  it('should recommend cheapest model for budget task', () => {
    const s = new ModelRouter();
    const r = s.recommend('budget cheap cost');
    const top = r.allModels[0];
    expect(top.cost).toBe('low');
  });

  it('should prefer large-context model for large task', () => {
    const s = new ModelRouter();
    const r = s.recommend('analyze the whole codebase full project');
    const top200k = r.allModels.filter(m => m.context >= 200000);
    const bottom128k = r.allModels.filter(m => m.context < 200000);
    expect(top200k[0].score).toBeGreaterThan(bottom128k[0].score);
  });

  it('should include all model metadata in allModels response', () => {
    const s = new ModelRouter();
    const r = s.recommend('implement feature');
    r.allModels.forEach(m => {
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('cost');
      expect(m).toHaveProperty('speed');
      expect(m).toHaveProperty('reasoning');
      expect(m).toHaveProperty('code');
      expect(m).toHaveProperty('creativity');
      expect(m).toHaveProperty('context');
      expect(m).toHaveProperty('score');
    });
  });
});
