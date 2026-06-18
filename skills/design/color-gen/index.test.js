const ColorGenerator = require('./index');

describe('ColorGenerator', () => {
  it('should create instance', () => {
    const s = new ColorGenerator();
    expect(s.version).toBe('1.0.0');
  });

  it('should convert hex to RGB', () => {
    const s = new ColorGenerator();
    const rgb = s.hexToRgb('#ff0000');
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should convert RGB to hex', () => {
    const s = new ColorGenerator();
    const hex = s.rgbToHex(255, 0, 0);
    expect(hex).toBe('#ff0000');
  });

  it('should return null for invalid hex', () => {
    const s = new ColorGenerator();
    expect(s.hexToRgb('notacolor')).toBeNull();
  });

  it('should calculate luminance', () => {
    const s = new ColorGenerator();
    const lum = s.getLuminance('#ffffff');
    expect(lum).toBeCloseTo(1, 2);
  });

  it('should calculate contrast ratio', () => {
    const s = new ColorGenerator();
    const ratio = s.getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('should check WCAG compliance', () => {
    const s = new ColorGenerator();
    const result = s.meetsWCAG('#000000', '#ffffff');
    expect(result.passesNormal).toBe(true);
    expect(result.passesLarge).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(21);
  });

  it('should fail WCAG for low contrast', () => {
    const s = new ColorGenerator();
    const result = s.meetsWCAG('#cccccc', '#ffffff');
    expect(result.passesNormal).toBe(false);
  });

  it('should generate 10-step scale', () => {
    const s = new ColorGenerator();
    const scale = s.generateScale('#3b82f6');
    expect(Object.keys(scale)).toHaveLength(10);
    expect(scale[50]).toBeDefined();
    expect(scale[950]).toBeDefined();
  });

  it('should get complementary color', () => {
    const s = new ColorGenerator();
    const comp = s.getComplementary('#ff0000');
    expect(comp).toBe('#00ffff');
  });

  it('should generate brand palette', () => {
    const s = new ColorGenerator();
    const palette = s.generateBrandPalette('#3b82f6');
    expect(palette.primary).toBeDefined();
    expect(palette.accent).toBeDefined();
    expect(palette.neutral).toBeDefined();
    expect(Object.keys(palette.primary)).toHaveLength(10);
  });

  it('should generate semantic palette', () => {
    const s = new ColorGenerator();
    const palette = s.generateSemanticPalette('#3b82f6');
    expect(palette).toHaveProperty('success');
    expect(palette).toHaveProperty('warning');
    expect(palette).toHaveProperty('error');
    expect(palette).toHaveProperty('info');
    expect(palette.success).toHaveProperty('main');
  });

  it('should get accessible text color', () => {
    const s = new ColorGenerator();
    const result = s.getAccessibleTextColor('#000000');
    expect(result.color).toBe('#ffffff');
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should generate accessible palette', () => {
    const s = new ColorGenerator();
    const result = s.generateAccessiblePalette('#3b82f6', '#ffffff');
    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('accessible');
    expect(result.contrastRatio).toBeGreaterThanOrEqual(4.5);
  });

  it('should create complete color system', () => {
    const s = new ColorGenerator();
    const system = s.createColorSystem('#3b82f6');
    expect(system).toHaveProperty('brand');
    expect(system).toHaveProperty('semantic');
    expect(system).toHaveProperty('neutral');
    expect(system).toHaveProperty('scale');
    expect(system).toHaveProperty('dual');
    expect(system).toHaveProperty('contrastMatrix');
    expect(system.brand.primary).toBeDefined();
  });

  it('should export CSS variables from scale', () => {
    const s = new ColorGenerator();
    const scale = s.generateScale('#3b82f6');
    const vars = s.toCSSVariables(scale);
    expect(vars['--color-50']).toBeDefined();
  });

  it('should export CSS string from scale', () => {
    const s = new ColorGenerator();
    const scale = s.generateScale('#3b82f6');
    const css = s.toCSS(scale);
    expect(css).toContain(':root');
  });

  it('should export Tailwind config from scale', () => {
    const s = new ColorGenerator();
    const scale = s.generateScale('#3b82f6');
    const config = s.toTailwindConfig(scale);
    expect(config.colors).toBeDefined();
  });
});
