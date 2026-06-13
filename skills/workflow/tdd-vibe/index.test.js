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
});
