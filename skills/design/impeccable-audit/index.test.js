const ImpeccableAudit = require('./index');

describe('ImpeccableAudit', () => {
  it('should list all 23 commands', () => {
    const i = new ImpeccableAudit();
    expect(i.getCommands().length).toBe(23);
  });

  it('should look up a command by name', () => {
    const i = new ImpeccableAudit();
    const r = i.getCommand('polish');
    expect(r.description).toMatch(/shipping/i);
  });

  it('should return an error for an unknown command', () => {
    const i = new ImpeccableAudit();
    const r = i.getCommand('nope');
    expect(r.type).toBe('error');
  });

  it('should run init and render a DESIGN.md', () => {
    const i = new ImpeccableAudit();
    const r = i.runInit({ surfaceType: 'product', audience: 'developers', voice: 'direct and technical' });
    expect(r.context.surfaceType).toBe('product');
    expect(r.markdown).toContain('DESIGN.md');
  });

  it('should reject init with missing required fields', () => {
    const i = new ImpeccableAudit();
    const r = i.runInit({ surfaceType: 'product' });
    expect(r.type).toBe('error');
  });

  it('should reject init with an invalid surfaceType', () => {
    const i = new ImpeccableAudit();
    const r = i.runInit({ surfaceType: 'app', audience: 'x', voice: 'y' });
    expect(r.type).toBe('error');
  });

  it('should detect nested cards via the supplemental detector', () => {
    const i = new ImpeccableAudit();
    const r = i.audit({ cards: [{ cards: [{ id: 1 }] }] });
    expect(r.warnings.some((w) => w.name === 'Nested Cards')).toBe(true);
  });

  it('should detect bounce easing via the supplemental detector', () => {
    const i = new ImpeccableAudit();
    const r = i.audit({ style: 'transition: all 0.3s bounce' });
    expect(r.warnings.some((w) => w.name === 'Bounce/Elastic Easing')).toBe(true);
  });

  it('should combine anti-slop detectors with supplemental detectors', () => {
    const i = new ImpeccableAudit();
    const r = i.audit({ style: 'linear-gradient(purple)' });
    expect(r.detectorCount).toBeGreaterThan(41);
    expect(r.violations.length + r.warnings.length).toBeGreaterThan(0);
  });

  it('should pass a well-formed design with no anti-patterns', () => {
    const i = new ImpeccableAudit();
    const r = i.audit({
      textColor: '#1a1a1a',
      backgroundColor: '#ffffff',
      colors: ['#1a1a1a', '#ffffff', '#3366cc'],
      fontSizes: [14, 16, 20, 32]
    });
    expect(r.passed).toBe(true);
  });

  it('should flag missing hierarchy and voice mismatch in critique', () => {
    const i = new ImpeccableAudit();
    const r = i.critique({});
    expect(r.passed).toBe(false);
    expect(r.findings.some((f) => f.axis === 'hierarchy')).toBe(true);
  });

  it('should pass critique when hierarchy and voice are present', () => {
    const i = new ImpeccableAudit();
    const r = i.critique({ hierarchy: { levels: 3 }, voice: { matchesBrand: true }, focalPoint: true });
    expect(r.passed).toBe(true);
  });

  it('should report polish blockers for an incomplete checklist', () => {
    const i = new ImpeccableAudit();
    const r = i.polish({ contrast: true });
    expect(r.readyToShip).toBe(false);
    expect(r.blockers.length).toBeGreaterThan(0);
  });

  it('should be ready to ship when the full polish checklist passes', () => {
    const i = new ImpeccableAudit();
    const r = i.polish({ contrast: true, responsive: true, states: true, emptyStates: true, reducedMotion: true });
    expect(r.readyToShip).toBe(true);
  });

  it('should render a markdown summary listing commands', () => {
    const i = new ImpeccableAudit();
    const md = i.toMarkdown();
    expect(md).toContain('/impeccable init');
    expect(md).toContain('/impeccable polish');
  });
});
