const SpecDriven = require('./index');

describe('SpecDriven', () => {
  it('should create instance', () => {
    const s = new SpecDriven();
    expect(s.name).toBe('spec-driven');
  });

  it('should create spec from options', () => {
    const s = new SpecDriven();
    const spec = s.createSpec({
      title: 'Test App',
      features: ['login', 'dashboard'],
      techStack: ['React'],
    });
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

  it('should validate a spec', () => {
    const s = new SpecDriven();
    const result = s.validate({ title: 'Test', features: ['login'] });
    expect(result.valid).toBe(true);
  });

  it('should invalidate a spec with no title', () => {
    const s = new SpecDriven();
    const result = s.validate({ features: ['login'] });
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('should export to handoff format', () => {
    const s = new SpecDriven();
    const spec = s.createSpec({ title: 'Test', features: ['login'] });
    const handoff = s.exportToHandoff(spec);
    expect(handoff).toContain('# Handoff');
    expect(handoff).toContain('Test');
    expect(handoff).toContain('login');
  });

  it('should diff two specs', () => {
    const s = new SpecDriven();
    const specA = s.createSpec({ title: 'App A', features: ['login', 'dashboard'] });
    const specB = s.createSpec({ title: 'App B', features: ['login'] });
    const diff = s.compareSpecs(specA, specB);
    expect(diff.changes.length).toBeGreaterThan(0);
    expect(diff.added).toBeDefined();
    expect(diff.removed).toBeDefined();
  });

  it('should merge multiple specs', () => {
    const s = new SpecDriven();
    const specA = s.createSpec({ title: 'App', features: ['login'] });
    const specB = s.createSpec({ title: 'App', features: ['dashboard'] });
    const merged = s.mergeSpecs([specA, specB]);
    expect(merged.features).toHaveLength(2);
  });

  it('should detect drift between identical specs', () => {
    const s = new SpecDriven();
    const spec = s.createSpec({ title: 'App', features: ['login'] });
    const diff = s.compareSpecs(spec, spec);
    expect(diff.changes).toHaveLength(0);
  });

  it('should handle empty spec array for merge', () => {
    const s = new SpecDriven();
    const merged = s.mergeSpecs([]);
    expect(merged.title).toBe('Merged Spec');
    expect(merged.features).toHaveLength(0);
  });
});
