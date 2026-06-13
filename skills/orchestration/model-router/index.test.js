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
});
