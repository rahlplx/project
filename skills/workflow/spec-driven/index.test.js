const SpecDriven = require('./index');

describe('SpecDriven', () => {
  it('should create instance', () => {
    const s = new SpecDriven();
    expect(s.name).toBe('spec-driven');
  });

  it('should create spec from options', () => {
    const s = new SpecDriven();
    const spec = s.createSpec({ title: 'Test App', features: ['login', 'dashboard'], techStack: ['React'] });
    expect(spec.title).toBe('Test App');
    expect(spec.features).toHaveLength(2);
  });

  it('should parse requirements', () => {
    const s = new SpecDriven();
    const spec = s.createSpec({ requirements: ['User can log in', 'User sees dashboard'] });
    expect(spec.requirements[0].priority).toBe('high');
  });

  it('should check alignment', () => {
    const s = new SpecDriven();
    const spec = s.createSpec({ features: ['login', 'dashboard'] });
    const r = s.checkAlignment('function login() {}', spec);
    expect(r.matchedFeatures).toContain('login');
  });
});
