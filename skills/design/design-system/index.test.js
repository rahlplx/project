const DesignSystem = require('./index');

describe('DesignSystem', () => {
  it('should create instance', () => {
    const s = new DesignSystem();
    expect(s.version).toBe('1.0.0');
  });

  it('should resolve spacing by number', () => {
    const s = new DesignSystem();
    expect(s.spacing(16)).toBe(16);
  });

  it('should resolve spacing by name', () => {
    const s = new DesignSystem();
    expect(s.spacing('md')).toBe(16);
    expect(s.spacing('xs')).toBe(4);
    expect(s.spacing('xl')).toBe(32);
  });

  it('should return default for unknown spacing name', () => {
    const s = new DesignSystem();
    expect(s.spacing('unknown')).toBe(16);
  });

  it('should get color by category and shade', () => {
    const s = new DesignSystem();
    expect(s.color('primary', 500)).toBe('#3b82f6');
    expect(s.color('primary', 700)).toBe('#1d4ed8');
  });

  it('should get semantic object', () => {
    const s = new DesignSystem();
    const sem = s.color('semantic', 'error');
    expect(sem).toHaveProperty('main', '#ef4444');
    expect(sem).toHaveProperty('light');
    expect(sem).toHaveProperty('dark');
  });

  it('should return null for unknown color category', () => {
    const s = new DesignSystem();
    expect(s.color('nonexistent')).toBeNull();
  });

  it('should get typography for h1', () => {
    const s = new DesignSystem();
    const t = s.typography('h1');
    expect(t).toEqual({ fontSize: '36px', lineHeight: 1.2 });
  });

  it('should get typography for body', () => {
    const s = new DesignSystem();
    const t = s.typography('body');
    expect(t).toEqual({ fontSize: '16px', lineHeight: 1.6 });
  });

  it('should return null for unknown typography element', () => {
    const s = new DesignSystem();
    expect(s.typography('unknown')).toBeNull();
  });

  it('should get radius', () => {
    const s = new DesignSystem();
    expect(s.radius('lg')).toBe(12);
    expect(s.radius('sm')).toBe(4);
    expect(s.radius('full')).toBe(9999);
  });

  it('should get default radius', () => {
    const s = new DesignSystem();
    expect(s.radius()).toBe(8);
  });

  it('should get shadow', () => {
    const s = new DesignSystem();
    const sh = s.shadow('lg');
    expect(sh).toContain('rgb');
  });

  it('should get breakpoint', () => {
    const s = new DesignSystem();
    expect(s.breakpoint('md')).toBe(768);
    expect(s.breakpoint('lg')).toBe(1024);
    expect(s.breakpoint('xl')).toBe(1280);
  });

  it('should get z-index', () => {
    const s = new DesignSystem();
    expect(s.zIndex('modal')).toBe(500);
    expect(s.zIndex('dropdown')).toBe(100);
  });

  it('should generate button styles', () => {
    const s = new DesignSystem();
    const btn = s.button('primary');
    expect(btn.backgroundColor).toBe('#2563eb');
    expect(btn.color).toBe('#ffffff');
    expect(btn.borderRadius).toBe('8px');
    expect(btn.display).toBe('inline-flex');
  });

  it('should generate secondary button', () => {
    const s = new DesignSystem();
    const btn = s.button('secondary');
    expect(btn.backgroundColor).toBe('#e2e8f0');
    expect(btn.color).toBe('#0f172a');
  });

  it('should generate button with size', () => {
    const s = new DesignSystem();
    const btn = s.button('primary', 'lg');
    expect(btn.padding).toBe('14px 24px');
  });

  it('should generate card styles', () => {
    const s = new DesignSystem();
    const c = s.card();
    expect(c.borderRadius).toBe('12px');
    expect(c).toHaveProperty('backgroundColor');
    expect(c).toHaveProperty('boxShadow');
  });

  it('should generate card with padding', () => {
    const s = new DesignSystem();
    const c = s.card('elevated', 'lg');
    expect(c.padding).toBe('32px');
  });

  it('should generate all CSS variables', () => {
    const s = new DesignSystem();
    const vars = s.generateAllVariables();
    expect(vars).toHaveProperty('--color-primary-500');
    expect(vars).toHaveProperty('--space-md');
    expect(vars).toHaveProperty('--text-4xl-size');
  });

  it('should export CSS string', () => {
    const s = new DesignSystem();
    const css = s.toCSS();
    expect(css).toContain(':root');
    expect(css).toContain('--color-primary-500');
  });

  it('should export CSS-in-JS', () => {
    const s = new DesignSystem();
    const js = s.toCSSinJS();
    expect(js).toHaveProperty('--color-primary-500');
  });

  it('should export Tailwind config', () => {
    const s = new DesignSystem();
    const config = s.toTailwindConfig();
    expect(config.colors).toBeDefined();
    expect(config.spacing).toBeDefined();
    expect(config.borderRadius).toBeDefined();
  });

  it('should apply design system to component', () => {
    const s = new DesignSystem();
    const merged = s.apply({ custom: 'value' }, 'button');
    expect(merged.backgroundColor).toBe('#2563eb');
    expect(merged.custom).toBe('value');
  });

  it('should pass through unknown component type', () => {
    const s = new DesignSystem();
    const merged = s.apply({ foo: 'bar' }, 'unknown');
    expect(merged).toEqual({ foo: 'bar' });
  });

  it('should create scoped variant', () => {
    const s = new DesignSystem();
    const scoped = s.scope('my-scope');
    expect(scoped.scopeName).toBe('my-scope');
    expect(scoped.color('primary', 500)).toBe('#3b82f6');
    expect(scoped.spacing('md')).toBe(16);
  });

  it('should accept custom config', () => {
    const s = new DesignSystem({
      colors: {
        brand: { 500: '#ff0000' }
      }
    });
    expect(s.color('brand', 500)).toBe('#ff0000');
  });
});
