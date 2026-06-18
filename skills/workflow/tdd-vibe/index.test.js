const TDDVibe = require('./index');

describe('TDDVibe', () => {
  it('should create instance', () => {
    const s = new TDDVibe();
    expect(s.name).toBe('tdd-vibe');
  });

  it('should generate TDD cycle', () => {
    const s = new TDDVibe();
    const r = s.generateCycle('user login');
    expect(r.cycle).toHaveLength(3);
    expect(r.cycle[0].name).toContain('RED');
  });

  it('should suggest tests', () => {
    const s = new TDDVibe();
    const r = s.suggestTests('search feature');
    expect(r.count).toBe(6);
  });

  it('should return error for empty description', () => {
    const s = new TDDVibe();
    const r = s.generateCycle('');
    expect(r.error).toBe('No feature described.');
  });

  it('should handle null feature', () => {
    const s = new TDDVibe();
    const r = s.generateCycle(null);
    expect(r.error).toBe('No feature described.');
  });

  it('should have all required properties in each cycle step', () => {
    const s = new TDDVibe();
    const r = s.generateCycle('user login');
    expect(r.cycle).toHaveLength(3);
    r.cycle.forEach((step, i) => {
      expect(step).toHaveProperty('step');
      expect(step).toHaveProperty('name');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('example');
      expect(step.step).toBe(i + 1);
    });
  });

  it('should suggest tests with empty input', () => {
    const s = new TDDVibe();
    const r = s.suggestTests('');
    expect(r.count).toBe(6);
    expect(r.description).toBe('');
    expect(r.testIdeas).toHaveLength(6);
  });
});
