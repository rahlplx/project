const SpecEngine = require('./index');
const fs = require('fs');
const path = require('path');

describe('SpecEngine', () => {
  it('should create instance', () => {
    const s = new SpecEngine();
    expect(s.name).toBe('spec-engine');
    expect(s.version).toBe('1.0.0');
  });

  it('should generate spec from simple intent', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build a login system with email authentication');
    expect(spec.title).toBeTruthy();
    expect(spec.features.length).toBeGreaterThanOrEqual(1);
    expect(spec.features[0].id).toMatch(/^FEAT-\d{3}$/);
  });

  it('should extract multiple features from intent', () => {
    const s = new SpecEngine();
    const spec = s.generate(
      'Build a login system with email authentication, password recovery, and user profile management'
    );
    expect(spec.features.length).toBeGreaterThanOrEqual(3);
  });

  it('should extract requirements from intent', () => {
    const s = new SpecEngine();
    const spec = s.generate(
      'Build a dashboard. Must have real-time updates. Must support dark mode.'
    );
    expect(spec.requirements.length).toBeGreaterThanOrEqual(1);
  });

  it('should extract constraints from intent', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build an API. Must be offline-only. Must use SQLite.');
    expect(spec.constraints.length).toBeGreaterThanOrEqual(1);
  });

  it('should detect contradictions between constraints', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build a system. Must be offline-only. Must require cloud API.');
    expect(spec.contradictions.length).toBeGreaterThanOrEqual(1);
  });

  it('should detect missing required fields on validate', () => {
    const s = new SpecEngine();
    const result = s.validate({ features: [] });
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThanOrEqual(1);
  });

  it('should validate a valid spec', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build a login system');
    const result = s.validate(spec);
    expect(result.valid).toBe(true);
  });

  it('should auto-assign unique feature IDs', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build A, B, and C features');
    const ids = spec.features.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should auto-assign priorities to features', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build a system with login, dashboard, and admin panel');
    spec.features.forEach(f => {
      expect(['high', 'medium', 'low']).toContain(f.priority);
    });
  });

  it('should handle empty intent', () => {
    const s = new SpecEngine();
    const spec = s.generate('');
    expect(spec.title).toBe('Untitled');
    expect(spec.features).toEqual([]);
  });

  it('should handle null intent', () => {
    const s = new SpecEngine();
    const spec = s.generate(null);
    expect(spec.title).toBe('Untitled');
    expect(spec.features).toEqual([]);
  });

  it('should handle generate with only whitespace', () => {
    const s = new SpecEngine();
    const spec = s.generate('   ');
    expect(spec.title).toBe('Untitled');
  });

  it('should extract actors from intent', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build a system where users can log in and admins can manage settings');
    expect(spec.actors.length).toBeGreaterThanOrEqual(2);
  });

  it('should extract dependencies from intent', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build a system with user auth that depends on database');
    expect(Array.isArray(spec.dependencies)).toBe(true);
  });

  it('should round-trip through spec file', () => {
    const s = new SpecEngine();
    const tmpDir = require('os').tmpdir();
    const tmpFile = path.join(tmpDir, `test-spec-${Date.now()}.json`);
    const original = s.generate('Build a test feature');
    s.toSpecFile(original, tmpFile);
    const loaded = s.fromSpecFile(tmpFile);
    expect(loaded.title).toBe(original.title);
    expect(loaded.features).toEqual(original.features);
    fs.unlinkSync(tmpFile);
  });

  it('should not overwrite without explicit path', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build something');
    expect(() => s.toSpecFile(spec)).toThrow();
  });

  it('should detect duplicate feature IDs on validate', () => {
    const s = new SpecEngine();
    const spec = {
      title: 'Test',
      features: [
        { id: 'FEAT-001', name: 'A', priority: 'high' },
        { id: 'FEAT-001', name: 'B', priority: 'medium' },
      ],
      requirements: [],
      constraints: [],
      actors: [],
      dependencies: [],
    };
    const result = s.validate(spec);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.includes('duplicate'))).toBe(true);
  });

  it('should include timestamp in generated spec', () => {
    const s = new SpecEngine();
    const spec = s.generate('Build a feature');
    expect(spec.timestamp).toBeTruthy();
    expect(() => new Date(spec.timestamp)).not.toThrow();
  });
});
