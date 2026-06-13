const TypographyRules = require('./index');

describe('TypographyRules', () => {
  it('should create instance', () => {
    const s = new TypographyRules();
    expect(s.version).toBe('1.0.0');
  });

  it('should get font pairing by name', () => {
    const s = new TypographyRules();
    const pairing = s.getPairing('plus-jakarta');
    expect(pairing).not.toBeNull();
    expect(pairing).toHaveProperty('heading');
    expect(pairing).toHaveProperty('body');
    expect(pairing).toHaveProperty('display');
  });

  it('should return null for nonexistent pairing', () => {
    const s = new TypographyRules();
    expect(s.getPairing('nonexistent')).toBeNull();
  });

  it('should list all pairings', () => {
    const s = new TypographyRules();
    const pairings = s.getAllPairings();
    expect(Array.isArray(pairings)).toBe(true);
    expect(pairings.length).toBeGreaterThan(0);
    expect(pairings[0]).toHaveProperty('id');
    expect(pairings[0]).toHaveProperty('heading');
  });

  it('should get type scale by name', () => {
    const s = new TypographyRules();
    const scale = s.getTypeScale('majorThird');
    expect(scale).toHaveProperty('ratio', 1.25);
    expect(scale).toHaveProperty('scale');
    expect(Array.isArray(scale.scale)).toBe(true);
    expect(scale.scale[0]).toHaveProperty('size');
  });

  it('should fallback to majorThird for unknown scale', () => {
    const s = new TypographyRules();
    const scale = s.getTypeScale('body');
    expect(scale).toHaveProperty('ratio', 1.25);
  });

  it('should generate typography system', () => {
    const s = new TypographyRules();
    const system = s.generateTypography();
    expect(system).toHaveProperty('fontFamily');
    expect(system).toHaveProperty('size');
    expect(system).toHaveProperty('lineHeight');
    expect(system).toHaveProperty('fontWeight');
    expect(system.fontFamily).toHaveProperty('heading');
    expect(system.fontFamily).toHaveProperty('body');
  });

  it('should suggest pairings by mood', () => {
    const s = new TypographyRules();
    const results = s.suggestPairing('Modern');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('heading');
  });

  it('should return empty array for unmatched mood', () => {
    const s = new TypographyRules();
    const results = s.suggestPairing('XYZZY_UNMATCHED');
    expect(results).toEqual([]);
  });

  it('should calculate scale', () => {
    const s = new TypographyRules();
    const scale = s.calculateScale(16, 1.25, 4);
    expect(Array.isArray(scale)).toBe(true);
    expect(scale.length).toBe(7);
    expect(scale[0]).toHaveProperty('size');
    expect(scale[0]).toHaveProperty('px');
    expect(scale[0]).toHaveProperty('rem');
  });

  it('should generate CSS from typography system', () => {
    const s = new TypographyRules();
    const system = s.generateTypography();
    const css = s.toCSS(system);
    expect(css).toContain(':root');
    expect(css).toContain('--font-');
    expect(css).toContain('--text-');
    expect(css).toContain('--leading-');
  });

  it('should get line height by font size', () => {
    const s = new TypographyRules();
    expect(s.getLineHeight(48)).toBe(1.0);
    expect(s.getLineHeight(16)).toBe(1.5);
    expect(s.getLineHeight(12)).toBe(1.6);
  });

  it('should generate heading styles', () => {
    const s = new TypographyRules();
    const styles = s.generateHeadingStyles();
    expect(styles).toHaveProperty('h1');
    expect(styles).toHaveProperty('h2');
    expect(styles).toHaveProperty('h3');
    expect(styles.h1).toHaveProperty('fontSize');
  });

  it('should check font performance', () => {
    const s = new TypographyRules();
    const result = s.checkFontPerformance('"Inter", system-ui, sans-serif');
    expect(result).toHaveProperty('fontFamily');
    expect(result).toHaveProperty('suggestions');
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('should generate font stack', () => {
    const s = new TypographyRules();
    const stack = s.generateFontStack('Inter', 'sans');
    expect(stack).toContain('Inter');
    expect(stack).toContain('system-ui');
  });
});
