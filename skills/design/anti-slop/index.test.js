const AntiSlopSkill = require('./index');

describe('AntiSlopSkill', () => {
  it('should create instance', () => {
    const s = new AntiSlopSkill();
    expect(s.name).toBe('anti-slop');
  });

  it('should detect rainbow palette', () => {
    const s = new AntiSlopSkill();
    const r = s.analyze({
      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF'],
    });
    expect(r.violations.some(v => v.id === 2)).toBe(true);
    expect(r.passed).toBe(false);
    expect(r.score).toBeLessThan(100);
  });

  it('should handle empty design without crashing', () => {
    const s = new AntiSlopSkill();
    const r = s.analyze({});
    expect(r).toHaveProperty('passed');
    expect(r).toHaveProperty('score');
    expect(r).toHaveProperty('totalIssues');
    expect(r).toHaveProperty('summary');
  });

  it('should return 6 categories', () => {
    const s = new AntiSlopSkill();
    const cats = s.getCategories();
    expect(Object.keys(cats)).toHaveLength(6);
    expect(cats).toHaveProperty('color');
    expect(cats).toHaveProperty('typography');
    expect(cats).toHaveProperty('layout');
    expect(cats).toHaveProperty('component');
    expect(cats).toHaveProperty('interaction');
    expect(cats).toHaveProperty('content');
  });

  it('should get detector info by id', () => {
    const s = new AntiSlopSkill();
    const info = s.getDetectorInfo(2);
    expect(info).not.toBeNull();
    expect(info.name).toBe('Rainbow Palette Overuse');
    expect(info.category).toBe('color');
    expect(info.severity).toBe('high');
  });

  it('should return null for unknown detector id', () => {
    const s = new AntiSlopSkill();
    const info = s.getDetectorInfo(999);
    expect(info).toBeNull();
  });
});
