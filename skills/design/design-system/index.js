/**
 * Design System Skill
 * 
 * Industry-grade design rules for spacing, colors, typography, and components.
 * Provides a comprehensive foundation for consistent, professional design.
 */

class DesignSystem {
  constructor(config = {}) {
    this.name = 'design-system';
    this.description = 'Industry-grade design rules for spacing, colors, typography, and components';
    this.version = '1.0.0';
    this.config = this.mergeConfig(config);
    this.tokens = {};
  }

  mergeConfig(config) {
    return {
      spacing: config.spacing || this.getDefaultSpacing(),
      colors: config.colors || this.getDefaultColors(),
      typography: config.typography || this.getDefaultTypography(),
      borderRadius: config.borderRadius || this.getDefaultBorderRadius(),
      shadows: config.shadows || this.getDefaultShadows(),
      breakpoints: config.breakpoints || this.getDefaultBreakpoints(),
      zIndex: config.zIndex || this.getDefaultZIndex(),
      ...config
    };
  }

  // ===== SPACING SYSTEM =====

  getDefaultSpacing() {
    return {
      scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
      naming: {
        0: 'none',
        4: 'xs',
        8: 'sm',
        16: 'md',
        24: 'lg',
        32: 'xl',
        40: '2xl',
        48: '3xl',
        64: '4xl',
        80: '5xl',
        96: '6xl',
        128: '7xl'
      },
      semantic: {
        componentPadding: 16,
        sectionGap: 64,
        containerPadding: 24,
        gridGap: 24
      }
    };
  }

  /**
   * Get spacing value by name or value
   */
  spacing(nameOrValue) {
    const naming = this.config.spacing.naming;
    if (typeof nameOrValue === 'number') {
      return nameOrValue;
    }
    const value = Object.entries(naming).find(([v, n]) => n === nameOrValue);
    return value ? parseInt(value[0]) : 16;
  }

  /**
   * Generate spacing CSS variables
   */
  generateSpacingVariables() {
    const vars = {};
    const naming = this.config.spacing.naming;
    const scale = this.config.spacing.scale;
    
    scale.forEach((value, index) => {
      const name = naming[value] || `space-${value}`;
      vars[`--space-${name}`] = `${value}px`;
    });
    
    return vars;
  }

  // ===== COLOR SYSTEM =====

  getDefaultColors() {
    return {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      },
      neutral: {
        0: '#ffffff',
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617'
      },
      semantic: {
        success: { light: '#dcfce7', main: '#22c55e', dark: '#166534' },
        warning: { light: '#fef9c3', main: '#eab308', dark: '#854d0e' },
        error: { light: '#fee2e2', main: '#ef4444', dark: '#991b1b' },
        info: { light: '#e0f2fe', main: '#0ea5e9', dark: '#075985' }
      }
    };
  }

  /**
   * Get color value
   */
  color(category, shade = 500) {
    const colors = this.config.colors;
    if (colors[category]) {
      return colors[category][shade] || colors[category].main || colors[category];
    }
    return null;
  }

  /**
   * Generate color CSS variables
   */
  generateColorVariables() {
    const vars = {};
    const colors = this.config.colors;
    
    Object.entries(colors).forEach(([category, shades]) => {
      if (typeof shades === 'object' && !shades.main) {
        Object.entries(shades).forEach(([shade, value]) => {
          vars[`--color-${category}-${shade}`] = value;
        });
      } else if (shades.main) {
        Object.entries(shades).forEach(([key, value]) => {
          vars[`--color-${category}-${key}`] = value;
        });
      } else {
        vars[`--color-${category}`] = shades;
      }
    });
    
    return vars;
  }

  /**
   * Calculate contrast color (black or white)
   */
  getContrastColor(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    const toLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    return luminance > 0.179 ? '#000000' : '#ffffff';
  }

  // ===== TYPOGRAPHY SYSTEM =====

  getDefaultTypography() {
    return {
      fonts: {
        sans: {
          family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          weights: [400, 500, 600, 700],
          weightsName: { 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold' }
        },
        serif: {
          family: 'Georgia, "Times New Roman", serif',
          weights: [400, 500, 600, 700],
          weightsName: { 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold' }
        },
        mono: {
          family: '"Fira Code", "SF Mono", Monaco, monospace',
          weights: [400, 500],
          weightsName: { 400: 'Regular', 500: 'Medium' }
        }
      },
      scale: {
        xs: { size: 12, lineHeight: 1.5 },
        sm: { size: 14, lineHeight: 1.5 },
        base: { size: 16, lineHeight: 1.6 },
        lg: { size: 18, lineHeight: 1.5 },
        xl: { size: 20, lineHeight: 1.4 },
        '2xl': { size: 24, lineHeight: 1.3 },
        '3xl': { size: 30, lineHeight: 1.2 },
        '4xl': { size: 36, lineHeight: 1.2 },
        '5xl': { size: 48, lineHeight: 1.1 },
        '6xl': { size: 60, lineHeight: 1 },
        '7xl': { size: 72, lineHeight: 1 }
      },
      semantic: {
        body: 'base',
        small: 'sm',
        h1: '4xl',
        h2: '3xl',
        h3: '2xl',
        h4: 'xl',
        h5: 'lg',
        h6: 'base'
      }
    };
  }

  /**
   * Get typography style
   */
  typography(element) {
    const typo = this.config.typography;
    const scaleName = typo.semantic[element] || element;
    const scale = typo.scale[scaleName];
    
    if (!scale) return null;
    
    return {
      fontSize: `${scale.size}px`,
      lineHeight: scale.lineHeight
    };
  }

  /**
   * Generate typography CSS variables
   */
  generateTypographyVariables() {
    const vars = {};
    const typo = this.config.typography;
    
    // Font families
    Object.entries(typo.fonts).forEach(([name, font]) => {
      vars[`--font-${name}`] = font.family;
    });
    
    // Type scale
    Object.entries(typo.scale).forEach(([name, scale]) => {
      vars[`--text-${name}-size`] = `${scale.size}px`;
      vars[`--text-${name}-line-height`] = scale.lineHeight;
    });
    
    return vars;
  }

  // ===== BORDER RADIUS SYSTEM =====

  getDefaultBorderRadius() {
    return {
      scale: {
        none: 0,
        sm: 4,
        DEFAULT: 8,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 24,
        full: 9999
      },
      semantic: {
        button: 8,
        input: 8,
        card: 12,
        modal: 16,
        badge: 4
      }
    };
  }

  /**
   * Get border radius value
   */
  radius(name = 'DEFAULT') {
    return this.config.borderRadius.scale[name] ?? 8;
  }

  /**
   * Generate border radius CSS variables
   */
  generateRadiusVariables() {
    const vars = {};
    const radius = this.config.borderRadius.scale;
    
    Object.entries(radius).forEach(([name, value]) => {
      const varName = name === 'DEFAULT' ? 'radius' : `radius-${name}`;
      vars[`--${varName}`] = `${value}px`;
    });
    
    return vars;
  }

  // ===== SHADOW SYSTEM =====

  getDefaultShadows() {
    return {
      scale: {
        none: 'none',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
      },
      semantic: {
        card: 'md',
        dropdown: 'lg',
        modal: 'xl',
        focus: '0 0 0 3px rgba(59, 130, 246, 0.5)'
      }
    };
  }

  /**
   * Get shadow value
   */
  shadow(name = 'DEFAULT') {
    return this.config.shadows.scale[name] || this.config.shadows.scale.DEFAULT;
  }

  /**
   * Generate shadow CSS variables
   */
  generateShadowVariables() {
    const vars = {};
    const shadows = this.config.shadows.scale;
    
    Object.entries(shadows).forEach(([name, value]) => {
      const varName = name === 'DEFAULT' ? 'shadow' : `shadow-${name}`;
      vars[`--${varName}`] = value;
    });
    
    return vars;
  }

  // ===== BREAKPOINTS =====

  getDefaultBreakpoints() {
    return {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
      names: {
        sm: 'mobile',
        md: 'tablet',
        lg: 'laptop',
        xl: 'desktop',
        '2xl': 'wide'
      }
    };
  }

  /**
   * Get breakpoint value
   */
  breakpoint(name) {
    return this.config.breakpoints[name] || 768;
  }

  /**
   * Generate breakpoint media queries
   */
  mediaQuery(breakpoint, content) {
    const value = this.breakpoint(breakpoint);
    return `@media (min-width: ${value}px) { ${content} }`;
  }

  // ===== Z-INDEX SYSTEM =====

  getDefaultZIndex() {
    return {
      scale: {
        0: 0,
        10: 10,
        20: 20,
        30: 30,
        40: 40,
        50: 50,
        auto: 'auto',
        full: 9999
      },
      semantic: {
        base: 0,
        dropdown: 100,
        sticky: 200,
        fixed: 300,
        modalBackdrop: 400,
        modal: 500,
        popover: 600,
        tooltip: 700,
        toast: 800
      }
    };
  }

  /**
   * Get z-index value
   */
  zIndex(name) {
    const semantic = this.config.zIndex.semantic;
    if (semantic[name] !== undefined) {
      return semantic[name];
    }
    return this.config.zIndex.scale[name] || 0;
  }

  // ===== COMPONENT STYLES =====

  /**
   * Generate button styles
   */
  button(variant = 'primary', size = 'md') {
    const colors = this.config.colors;
    const radius = this.config.borderRadius.semantic.button;
    
    const variants = {
      primary: {
        bg: colors.primary[600],
        color: '#ffffff',
        hoverBg: colors.primary[700],
        activeBg: colors.primary[800]
      },
      secondary: {
        bg: colors.neutral[200],
        color: colors.neutral[900],
        hoverBg: colors.neutral[300],
        activeBg: colors.neutral[400]
      },
      outline: {
        bg: 'transparent',
        color: colors.primary[600],
        border: colors.primary[600],
        hoverBg: colors.primary[50],
        activeBg: colors.primary[100]
      },
      ghost: {
        bg: 'transparent',
        color: colors.neutral[700],
        hoverBg: colors.neutral[100],
        activeBg: colors.neutral[200]
      },
      danger: {
        bg: colors.semantic.error.main,
        color: '#ffffff',
        hoverBg: colors.semantic.error.dark,
        activeBg: '#7f1d1d'
      }
    };

    const sizes = {
      sm: { padding: '6px 12px', fontSize: '14px', gap: '6px' },
      md: { padding: '10px 16px', fontSize: '16px', gap: '8px' },
      lg: { padding: '14px 24px', fontSize: '18px', gap: '10px' }
    };

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizes[size].gap,
      padding: sizes[size].padding,
      fontSize: sizes[size].fontSize,
      fontWeight: 600,
      borderRadius: `${radius}px`,
      border: variants[variant].border ? `1px solid ${variants[variant].border}` : 'none',
      backgroundColor: variants[variant].bg,
      color: variants[variant].color,
      cursor: 'pointer',
      transition: 'all 150ms ease',
      '&:hover': {
        backgroundColor: variants[variant].hoverBg
      },
      '&:active': {
        backgroundColor: variants[variant].activeBg
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    };
  }

  /**
   * Generate input styles
   */
  input(size = 'md', state = 'default') {
    const colors = this.config.colors;
    const radius = this.config.borderRadius.semantic.input;
    
    const states = {
      default: {
        border: colors.neutral[300],
        bg: '#ffffff',
        color: colors.neutral[900],
        placeholder: colors.neutral[400]
      },
      focus: {
        border: colors.primary[500],
        ring: '0 0 0 3px rgba(59, 130, 246, 0.3)'
      },
      error: {
        border: colors.semantic.error.main,
        ring: '0 0 0 3px rgba(239, 68, 68, 0.2)'
      },
      disabled: {
        bg: colors.neutral[100],
        color: colors.neutral[400],
        cursor: 'not-allowed'
      }
    };

    const sizes = {
      sm: { padding: '6px 10px', fontSize: '14px' },
      md: { padding: '10px 14px', fontSize: '16px' },
      lg: { padding: '14px 18px', fontSize: '18px' }
    };

    return {
      width: '100%',
      padding: sizes[size].padding,
      fontSize: sizes[size].fontSize,
      fontFamily: 'inherit',
      borderRadius: `${radius}px`,
      border: `1px solid ${states[state].border || states.default.border}`,
      backgroundColor: states[state].bg || states.default.bg,
      color: states[state].color || states.default.color,
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
      outline: 'none',
      boxSizing: 'border-box',
      '&::placeholder': {
        color: states.default.placeholder
      },
      '&:focus': {
        borderColor: states.focus.border,
        boxShadow: states.focus.ring
      },
      '&:disabled': {
        backgroundColor: states.disabled.bg,
        color: states.disabled.color,
        cursor: states.disabled.cursor
      }
    };
  }

  /**
   * Generate card styles
   */
  card(variant = 'default', padding = 'md') {
    const colors = this.config.colors;
    const radius = this.config.borderRadius.semantic.card;
    
    const variants = {
      default: {
        bg: '#ffffff',
        border: colors.neutral[200],
        shadow: 'DEFAULT'
      },
      elevated: {
        bg: '#ffffff',
        border: 'transparent',
        shadow: 'lg'
      },
      outlined: {
        bg: 'transparent',
        border: colors.neutral[300],
        shadow: 'none'
      },
      ghost: {
        bg: colors.neutral[50],
        border: 'transparent',
        shadow: 'none'
      }
    };

    const paddings = {
      none: 0,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 40
    };

    return {
      backgroundColor: variants[variant].bg,
      border: `1px solid ${variants[variant].border}`,
      borderRadius: `${radius}px`,
      boxShadow: this.shadow(variants[variant].shadow),
      padding: `${paddings[padding]}px`
    };
  }

  // ===== UTILITY METHODS =====

  /**
   * Generate all CSS variables
   */
  generateAllVariables() {
    return {
      ...this.generateSpacingVariables(),
      ...this.generateColorVariables(),
      ...this.generateTypographyVariables(),
      ...this.generateRadiusVariables(),
      ...this.generateShadowVariables()
    };
  }

  /**
   * Export as CSS custom properties
   */
  toCSS() {
    const vars = this.generateAllVariables();
    let css = ':root {\n';
    
    Object.entries(vars).forEach(([name, value]) => {
      css += `  ${name}: ${value};\n`;
    });
    
    css += '}\n';
    return css;
  }

  /**
   * Export as CSS-in-JS object
   */
  toCSSinJS() {
    return this.generateAllVariables();
  }

  /**
   * Export as Tailwind config
   */
  toTailwindConfig() {
    const vars = this.generateAllVariables();
    
    const tailwind = {
      colors: {},
      spacing: {},
      borderRadius: {},
      fontFamily: {},
      fontSize: {},
      boxShadow: {}
    };

    Object.entries(vars).forEach(([name, value]) => {
      if (name.startsWith('--color-')) {
        const key = name.replace('--color-', '').replace(/-(\d+)/g, '$1');
        const parts = key.split('-');
        if (parts.length > 1 && /\d+/.test(parts[parts.length - 1])) {
          const color = parts.slice(0, -1).join('-');
          const shade = parts[parts.length - 1];
          if (!tailwind.colors[color]) tailwind.colors[color] = {};
          tailwind.colors[color][shade] = value;
        } else {
          tailwind.colors[key] = value;
        }
      } else if (name.startsWith('--space-')) {
        const key = name.replace('--space-', '');
        tailwind.spacing[key] = value;
      } else if (name.startsWith('--radius')) {
        const key = name.replace('--radius', '').replace(/-/, '');
        tailwind.borderRadius[key || 'DEFAULT'] = value;
      } else if (name.startsWith('--font-')) {
        const key = name.replace('--font-', '');
        tailwind.fontFamily[key] = value;
      } else if (name.startsWith('--text-')) {
        const key = name.replace('--text-', '').replace(/-size/, '');
        if (!tailwind.fontSize[key]) tailwind.fontSize[key] = [];
        tailwind.fontSize[key][0] = value;
      } else if (name.startsWith('--shadow')) {
        const key = name.replace('--shadow', '').replace(/-/, '') || 'DEFAULT';
        tailwind.boxShadow[key] = value;
      }
    });

    return tailwind;
  }

  /**
   * Apply design system to a component
   */
  apply(component, componentType) {
    const baseStyles = {
      button: () => this.button(),
      input: () => this.input(),
      card: () => this.card()
    };

    if (baseStyles[componentType]) {
      return {
        ...baseStyles[componentType](),
        ...component
      };
    }

    return component;
  }

  /**
   * Create a scoped variant
   */
  scope(scopeName) {
    const self = this;
    return {
      scopeName,
      config: this.config,
      tokens: this.tokens,
      spacing: (n) => self.spacing(n),
      color: (c, s) => self.color(c, s),
      typography: (e) => self.typography(e),
      radius: (n) => self.radius(n),
      shadow: (n) => self.shadow(n),
      zIndex: (n) => self.zIndex(n),
      button: (v, sz) => self.button(v, sz),
      input: (sz, st) => self.input(sz, st),
      card: (v, p) => self.card(v, p)
    };
  }
}

module.exports = DesignSystem;