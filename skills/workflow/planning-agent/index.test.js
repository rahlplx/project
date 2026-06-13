const PlanningAgent = require('./index');

describe('PlanningAgent', () => {
  it('should create instance', () => {
    const s = new PlanningAgent();
    expect(s.name).toBe('planning-agent');
  });

  it('should generate plan from description', () => {
    const s = new PlanningAgent();
    const r = s.plan('Build a website for freelancers');
    expect(r.success).toBe(true);
    expect(r.tasks.length).toBeGreaterThan(0);
  });

  it('should detect project type', () => {
    const s = new PlanningAgent();
    const r = s.plan('A REST API for inventory management');
    expect(r.projectType).toBe('api');
  });

  it('should detect auth requirement', () => {
    const s = new PlanningAgent();
    const r = s.plan('App with user login and signup');
    expect(r.tasks.some(t => t.title.includes('auth'))).toBe(true);
  });

  it('should detect payment requirement', () => {
    const s = new PlanningAgent();
    const r = s.plan('Store with Stripe payments');
    expect(r.tasks.some(t => t.title.includes('payment'))).toBe(true);
  });

  it('should have phases', () => {
    const s = new PlanningAgent();
    const r = s.plan('A website');
    expect(r.phases.length).toBeGreaterThan(0);
  });

  it('should estimate effort', () => {
    const s = new PlanningAgent();
    const r = s.plan('A dashboard');
    expect(r.estimatedEffort).toContain('story points');
  });
});
