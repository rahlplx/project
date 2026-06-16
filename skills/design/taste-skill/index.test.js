const TasteSkill = require('./index');

describe('TasteSkill', () => {
  it('should create instance', () => {
    const t = new TasteSkill();
    expect(t.name).toBe('taste-skill');
  });

  it('should expose the three dials', () => {
    const t = new TasteSkill();
    expect(Object.keys(t.getDials())).toEqual(['DESIGN_VARIANCE', 'MOTION_INTENSITY', 'VISUAL_DENSITY']);
  });

  it('should report the 8/6/4 baseline', () => {
    const t = new TasteSkill();
    expect(t.getBaseline()).toEqual({ DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6, VISUAL_DENSITY: 4 });
  });

  it('should band a value into its rubric label', () => {
    const t = new TasteSkill();
    expect(t.bandFor('DESIGN_VARIANCE', 2).label).toBe('Predictable');
    expect(t.bandFor('DESIGN_VARIANCE', 5).label).toBe('Offset');
    expect(t.bandFor('DESIGN_VARIANCE', 9).label).toBe('Asymmetric');
  });

  it('should infer dials from vibe words', () => {
    const t = new TasteSkill();
    const r = t.inferDials({ vibeWords: ['minimalist'] });
    expect(r.dials).toEqual({ DESIGN_VARIANCE: 3, MOTION_INTENSITY: 2, VISUAL_DENSITY: 2 });
    expect(r.usedBaseline).toBe(false);
  });

  it('should fall back to baseline when no signal matches', () => {
    const t = new TasteSkill();
    const r = t.inferDials({ vibeWords: ['something-unrelated'] });
    expect(r.dials).toEqual({ DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6, VISUAL_DENSITY: 4 });
    expect(r.usedBaseline).toBe(true);
  });

  it('should produce a one-line brief read', () => {
    const t = new TasteSkill();
    const read = t.describeBriefRead({ pageKind: 'landing page', audience: 'developers', vibeWords: ['minimalist'] });
    expect(read).toMatch(/^Reading this as: landing page for developers/);
  });

  it('should detect em-dashes', () => {
    const t = new TasteSkill();
    expect(t.checkEmDash('Build faster — ship sooner').violation).toBe(true);
    expect(t.checkEmDash('Build faster, ship sooner').violation).toBe(false);
  });

  it('should detect duplicate CTA intent', () => {
    const t = new TasteSkill();
    const r = t.checkDuplicateCTAIntent(['Get in touch', 'Contact us']);
    expect(r.violation).toBe(true);
    expect(r.violations[0].intent).toBe('get in touch');
  });

  it('should pass distinct CTA intents', () => {
    const t = new TasteSkill();
    const r = t.checkDuplicateCTAIntent(['Get in touch', 'Sign up']);
    expect(r.violation).toBe(false);
  });

  it('should flag hero discipline violations', () => {
    const t = new TasteSkill();
    const r = t.checkHeroDiscipline({ headlineLines: 3, subtextWords: 25, topPaddingRem: 8, stackElements: 5, ctaVisible: false });
    expect(r.passed).toBe(false);
    expect(r.issues.length).toBe(5);
  });

  it('should pass a disciplined hero', () => {
    const t = new TasteSkill();
    const r = t.checkHeroDiscipline({ headlineLines: 2, subtextWords: 15, topPaddingRem: 4, stackElements: 3, ctaVisible: true });
    expect(r.passed).toBe(true);
  });

  it('should enforce eyebrow restraint', () => {
    const t = new TasteSkill();
    expect(t.checkEyebrowRestraint(3, 6).passed).toBe(false);
    expect(t.checkEyebrowRestraint(2, 6).passed).toBe(true);
  });

  it('should ban pure black and pure white', () => {
    const t = new TasteSkill();
    const r = t.checkPureBlackWhite(['#000000', '#111827']);
    expect(r.violation).toBe(true);
    expect(r.violations).toEqual(['#000000']);
  });

  it('should enforce marquee max-one-per-page', () => {
    const t = new TasteSkill();
    expect(t.checkMarqueeCount(2).passed).toBe(false);
    expect(t.checkMarqueeCount(1).passed).toBe(true);
  });

  it('should pass preflightCheck for a clean design', () => {
    const t = new TasteSkill();
    const r = t.preflightCheck({
      copyText: 'Ship faster, with confidence.',
      ctas: ['Get started', 'Learn more'],
      hero: { headlineLines: 2, subtextWords: 12, topPaddingRem: 4, stackElements: 3, ctaVisible: true },
      eyebrowCount: 1,
      sectionCount: 6,
      colors: ['#111827', '#fafafa'],
      marqueeCount: 0
    });
    expect(r.passed).toBe(true);
    expect(r.findings.length).toBe(0);
  });

  it('should fail preflightCheck on em-dash and duplicate CTA violations', () => {
    const t = new TasteSkill();
    const r = t.preflightCheck({
      copyText: 'Build faster — ship sooner.',
      ctas: ['Contact us', 'Get in touch']
    });
    expect(r.passed).toBe(false);
    expect(r.findings.some((f) => f.rule === 'em-dash-ban')).toBe(true);
    expect(r.findings.some((f) => f.rule === 'duplicate-cta-intent')).toBe(true);
  });

  it('should render toJSON', () => {
    const t = new TasteSkill();
    const json = t.toJSON();
    expect(json.dials).toEqual(['DESIGN_VARIANCE', 'MOTION_INTENSITY', 'VISUAL_DENSITY']);
    expect(json.baseline).toEqual({ DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6, VISUAL_DENSITY: 4 });
  });
});
