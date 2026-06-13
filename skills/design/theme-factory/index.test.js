const ThemeFactory = require('./index');

describe('ThemeFactory', () => {
  it('should create instance', () => {
    const s = new ThemeFactory();
    expect(s.version).toBe('1.0.0');
  });

  it('should get preset theme by name', () => {
    const s = new ThemeFactory();
    const theme = s.getPreset('midnight');
    expect(theme).not.toBeNull();
    expect(theme.name).toBe('Midnight');
  });

  it('should return null for nonexistent preset', () => {
    const s = new ThemeFactory();
    expect(s.getPreset('nonexistent')).toBeNull();
  });

  it('should list available presets', () => {
    const s = new ThemeFactory();
    const presets = s.getAvailablePresets();
    expect(Array.isArray(presets)).toBe(true);
    expect(presets.length).toBeGreaterThan(0);
    expect(presets[0]).toHaveProperty('id');
    expect(presets[0]).toHaveProperty('name');
  });

  it('should create theme from config', () => {
    const s = new ThemeFactory();
    const theme = s.createTheme({ name: 'Test', backgroundColor: '#ffffff' });
    expect(theme).toHaveProperty('name', 'Test');
    expect(theme.colors.background.primary).toBe('#ffffff');
  });

  it('should generate CSS variables from theme', () => {
    const s = new ThemeFactory();
    const midnight = s.getPreset('midnight');
    const vars = s.generateCSSVariables(midnight);
    expect(vars).toHaveProperty('--bg-primary');
    expect(vars).toHaveProperty('--text-primary');
    expect(vars).toHaveProperty('--border-default');
    expect(vars).toHaveProperty('--accent-primary');
  });

  it('should generate theme from primary color', () => {
    const s = new ThemeFactory();
    const theme = s.generateFromPrimary('#ff0000');
    expect(theme).toHaveProperty('name', 'Generated Theme');
    expect(theme.colors.accent.primary).toBe('#ff0000');
  });

  it('should create quick theme package', () => {
    const s = new ThemeFactory();
    const pkg = s.quickTheme('#3b82f6');
    expect(pkg).toHaveProperty('theme');
    expect(pkg).toHaveProperty('css');
    expect(pkg).toHaveProperty('variables');
    expect(pkg).toHaveProperty('metadata');
    expect(typeof pkg.css).toBe('string');
    expect(typeof pkg.variables).toBe('object');
  });

  it('should handle empty config in createTheme', () => {
    const s = new ThemeFactory();
    const theme = s.createTheme({});
    expect(theme).toHaveProperty('name', 'Custom Theme');
  });

  it('should export theme as JSON string', () => {
    const s = new ThemeFactory();
    const midnight = s.getPreset('midnight');
    const json = s.toJSON(midnight);
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should export theme as CSS string', () => {
    const s = new ThemeFactory();
    const midnight = s.getPreset('midnight');
    const css = s.toCSS(midnight);
    expect(css).toContain(':root');
    expect(css).toContain('--bg-primary');
    expect(css).toContain('--text-primary');
  });
});
