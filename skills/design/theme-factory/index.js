/**
 * Theme Factory Skill
 *
 * Generates custom theme configurations with colors, fonts, and design tokens.
 * Supports dark, light, and custom themes with accessibility compliance.
 */

const { SkillBase } = require('../../../lib/skill-base.js');

class ThemeFactory extends SkillBase {
  constructor() {
    super();
    this.name = 'theme-factory';
    this.description =
      'Generates custom theme configurations with colors, fonts, and design tokens';
    this.version = '1.0.0';
    this.presets = this.initializePresets();
    this.colorManipulation = this.getColorManipulation();
  }

  initializePresets() {
    return {
      // ===== DARK THEMES =====

      midnight: {
        name: 'Midnight',
        type: 'dark',
        colors: {
          background: {
            primary: '#0f0f23',
            secondary: '#1a1a2e',
            tertiary: '#16213e',
            elevated: '#1f1f3a',
          },
          text: {
            primary: '#eeeeee',
            secondary: '#a0a0a0',
            muted: '#6b6b8d',
            inverse: '#0f0f23',
          },
          border: {
            default: '#2d2d44',
            subtle: '#1f1f3a',
            strong: '#3d3d5c',
          },
          accent: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
          },
        },
        typography: {
          fontFamily: {
            heading: '"Plus Jakarta Sans", system-ui, sans-serif',
            body: '"Inter", system-ui, sans-serif',
            mono: '"Fira Code", monospace',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: { base: 16 },
        borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
        shadows: {
          sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
          md: '0 4px 6px rgba(0, 0, 0, 0.4)',
          lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
          glow: '0 0 20px rgba(99, 102, 241, 0.3)',
        },
      },

      noir: {
        name: 'Noir',
        type: 'dark',
        colors: {
          background: {
            primary: '#000000',
            secondary: '#0a0a0a',
            tertiary: '#141414',
            elevated: '#1a1a1a',
          },
          text: {
            primary: '#f5f5f5',
            secondary: '#a3a3a3',
            muted: '#525252',
            inverse: '#000000',
          },
          border: {
            default: '#262626',
            subtle: '#171717',
            strong: '#404040',
          },
          accent: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
            success: '#22c55e',
            warning: '#eab308',
            error: '#dc2626',
            info: '#3b82f6',
          },
        },
        typography: {
          fontFamily: {
            heading: '"Space Grotesk", system-ui, sans-serif',
            body: '"IBM Plex Sans", system-ui, sans-serif',
            mono: '"IBM Plex Mono", monospace',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: { base: 16 },
        borderRadius: { sm: 2, md: 4, lg: 6, xl: 8, full: 9999 },
        shadows: {
          sm: '0 1px 2px rgba(255, 255, 255, 0.05)',
          md: '0 2px 4px rgba(255, 255, 255, 0.08)',
          lg: '0 4px 8px rgba(255, 255, 255, 0.1)',
          glow: '0 0 30px rgba(255, 255, 255, 0.15)',
        },
      },

      ocean: {
        name: 'Ocean Deep',
        type: 'dark',
        colors: {
          background: {
            primary: '#0c1929',
            secondary: '#132337',
            tertiary: '#1a2d42',
            elevated: '#1e3a52',
          },
          text: {
            primary: '#e0f2fe',
            secondary: '#7dd3fc',
            muted: '#38bdf8',
            inverse: '#0c1929',
          },
          border: {
            default: '#1e3a52',
            subtle: '#132337',
            strong: '#2d4a63',
          },
          accent: {
            primary: '#06b6d4',
            secondary: '#22d3ee',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#f43f5e',
            info: '#0ea5e9',
          },
        },
        typography: {
          fontFamily: {
            heading: '"Outfit", system-ui, sans-serif',
            body: '"DM Sans", system-ui, sans-serif',
            mono: '"JetBrains Mono", monospace',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: { base: 16 },
        borderRadius: { sm: 4, md: 8, lg: 16, xl: 24, full: 9999 },
        shadows: {
          sm: '0 2px 4px rgba(6, 182, 212, 0.1)',
          md: '0 4px 8px rgba(6, 182, 212, 0.15)',
          lg: '0 8px 16px rgba(6, 182, 212, 0.2)',
          glow: '0 0 30px rgba(6, 182, 212, 0.4)',
        },
      },

      // ===== LIGHT THEMES =====

      cloud: {
        name: 'Cloud',
        type: 'light',
        colors: {
          background: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9',
            elevated: '#ffffff',
          },
          text: {
            primary: '#0f172a',
            secondary: '#475569',
            muted: '#94a3b8',
            inverse: '#ffffff',
          },
          border: {
            default: '#e2e8f0',
            subtle: '#f1f5f9',
            strong: '#cbd5e1',
          },
          accent: {
            primary: '#3b82f6',
            secondary: '#6366f1',
            success: '#22c55e',
            warning: '#eab308',
            error: '#ef4444',
            info: '#0ea5e9',
          },
        },
        typography: {
          fontFamily: {
            heading: '"Plus Jakarta Sans", system-ui, sans-serif',
            body: '"Inter", system-ui, sans-serif',
            mono: '"Fira Code", monospace',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: { base: 16 },
        borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
        shadows: {
          sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px rgba(0, 0, 0, 0.07)',
          lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
          glow: '0 0 20px rgba(59, 130, 246, 0.15)',
        },
      },

      paper: {
        name: 'Paper',
        type: 'light',
        colors: {
          background: {
            primary: '#fefdfb',
            secondary: '#faf8f5',
            tertiary: '#f5f3ef',
            elevated: '#ffffff',
          },
          text: {
            primary: '#1c1917',
            secondary: '#57534e',
            muted: '#a8a29e',
            inverse: '#fefdfb',
          },
          border: {
            default: '#e7e5e4',
            subtle: '#f5f3ef',
            strong: '#d6d3d1',
          },
          accent: {
            primary: '#b45309',
            secondary: '#d97706',
            success: '#15803d',
            warning: '#ca8a04',
            error: '#dc2626',
            info: '#0284c7',
          },
        },
        typography: {
          fontFamily: {
            heading: '"Fraunces", Georgia, serif',
            body: '"Source Serif 4", Georgia, serif',
            mono: '"Source Code Pro", monospace',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: { base: 16 },
        borderRadius: { sm: 2, md: 4, lg: 6, xl: 8, full: 9999 },
        shadows: {
          sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
          md: '0 2px 6px rgba(0, 0, 0, 0.06)',
          lg: '0 4px 12px rgba(0, 0, 0, 0.08)',
          glow: '0 0 20px rgba(180, 83, 9, 0.1)',
        },
      },

      mint: {
        name: 'Mint',
        type: 'light',
        colors: {
          background: {
            primary: '#f0fdf4',
            secondary: '#dcfce7',
            tertiary: '#bbf7d0',
            elevated: '#ffffff',
          },
          text: {
            primary: '#14532d',
            secondary: '#166534',
            muted: '#22c55e',
            inverse: '#f0fdf4',
          },
          border: {
            default: '#bbf7d0',
            subtle: '#dcfce7',
            strong: '#86efac',
          },
          accent: {
            primary: '#16a34a',
            secondary: '#22c55e',
            success: '#16a34a',
            warning: '#eab308',
            error: '#dc2626',
            info: '#0284c7',
          },
        },
        typography: {
          fontFamily: {
            heading: '"Nunito Sans", system-ui, sans-serif',
            body: '"Nunito Sans", system-ui, sans-serif',
            mono: '"Fira Code", monospace',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: { base: 16 },
        borderRadius: { sm: 6, md: 12, lg: 20, xl: 28, full: 9999 },
        shadows: {
          sm: '0 1px 3px rgba(22, 163, 74, 0.1)',
          md: '0 2px 6px rgba(22, 163, 74, 0.12)',
          lg: '0 4px 12px rgba(22, 163, 74, 0.15)',
          glow: '0 0 30px rgba(22, 163, 74, 0.2)',
        },
      },

      // ===== SPECIAL THEMES =====

      highContrast: {
        name: 'High Contrast',
        type: 'both',
        accessibility: 'WCAG AAA',
        colors: {
          background: {
            primary: '#ffffff',
            secondary: '#ffffff',
            tertiary: '#f0f0f0',
            elevated: '#ffffff',
          },
          text: {
            primary: '#000000',
            secondary: '#000000',
            muted: '#000000',
            inverse: '#000000',
          },
          border: {
            default: '#000000',
            subtle: '#000000',
            strong: '#000000',
          },
          accent: {
            primary: '#0000ee',
            secondary: '#0000ee',
            success: '#006600',
            warning: '#996600',
            error: '#cc0000',
            info: '#0000cc',
          },
        },
        typography: {
          fontFamily: {
            heading: 'system-ui, sans-serif',
            body: 'system-ui, sans-serif',
            mono: '"SF Mono", monospace',
          },
          fontWeight: {
            normal: 400,
            medium: 600,
            semibold: 700,
            bold: 900,
          },
        },
        spacing: { base: 16 },
        borderRadius: { sm: 0, md: 0, lg: 0, xl: 0, full: 9999 },
        shadows: { none: 'none' },
      },

      // ===== BRAND THEMES =====

      corporate: {
        name: 'Corporate',
        type: 'light',
        colors: {
          background: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9',
            elevated: '#ffffff',
          },
          text: {
            primary: '#0f172a',
            secondary: '#334155',
            muted: '#64748b',
            inverse: '#ffffff',
          },
          border: {
            default: '#e2e8f0',
            subtle: '#f1f5f9',
            strong: '#cbd5e1',
          },
          accent: {
            primary: '#0f172a',
            secondary: '#1e40af',
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
            info: '#0284c7',
          },
        },
        typography: {
          fontFamily: {
            heading: '"Libre Franklin", system-ui, sans-serif',
            body: '"Libre Franklin", system-ui, sans-serif',
            mono: '"IBM Plex Mono", monospace',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: { base: 8 },
        borderRadius: { sm: 2, md: 4, lg: 6, xl: 8, full: 9999 },
        shadows: {
          sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
          md: '0 1px 4px rgba(0, 0, 0, 0.08)',
          lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
          glow: 'none',
        },
      },
    };
  }

  getColorManipulation() {
    return {
      /**
       * Adjust hex color brightness
       */
      adjustBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
      },

      /**
       * Convert hex to HSL
       */
      hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
              break;
            case g:
              h = ((b - r) / d + 2) / 6;
              break;
            case b:
              h = ((r - g) / d + 4) / 6;
              break;
          }
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
      },

      /**
       * Convert HSL to hex
       */
      hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
      },

      /**
       * Generate color scale from a base color
       */
      generateScale(baseHex, steps = 10) {
        const hsl = this.hexToHsl(baseHex);
        const scale = {};

        for (let i = 0; i < steps; i++) {
          const lightness = 95 - i * ((95 - 5) / (steps - 1));
          const shade = (i + 1) * 100;
          scale[shade] = this.hslToHex(hsl.h, hsl.s, lightness);
        }

        return scale;
      },

      /**
       * Calculate relative luminance
       */
      getLuminance(hex) {
        const rgb = hex
          .replace('#', '')
          .match(/.{2}/g)
          .map(x => {
            const val = parseInt(x, 16) / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
          });
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      },

      /**
       * Calculate contrast ratio between two colors
       */
      getContrastRatio(hex1, hex2) {
        const l1 = this.getLuminance(hex1);
        const l2 = this.getLuminance(hex2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      },

      /**
       * Get accessible text color for a background
       */
      getAccessibleTextColor(bgHex, lightText = '#ffffff', darkText = '#000000') {
        const ratio = this.getContrastRatio(bgHex, lightText);
        return ratio >= 4.5 ? lightText : darkText;
      },
    };
  }

  /**
   * Get a preset theme
   */
  getPreset(name) {
    return this.presets[name] || null;
  }

  /**
   * Get all available presets
   */
  getAvailablePresets() {
    return Object.entries(this.presets).map(([key, preset]) => ({
      id: key,
      name: preset.name,
      type: preset.type,
      accessibility: preset.accessibility || null,
    }));
  }

  /**
   * Generate a custom theme from configuration
   */
  createTheme(config) {
    return {
      name: config.name || 'Custom Theme',
      type: config.type || 'light',
      colors: {
        background: {
          primary: config.backgroundColor || '#ffffff',
          secondary:
            config.secondaryColor ||
            this.colorManipulation.adjustBrightness(config.backgroundColor || '#ffffff', -5),
          tertiary:
            config.tertiaryColor ||
            this.colorManipulation.adjustBrightness(config.backgroundColor || '#ffffff', -10),
          elevated: config.elevatedColor || config.backgroundColor || '#ffffff',
        },
        text: {
          primary: config.textColor || '#000000',
          secondary:
            config.secondaryTextColor ||
            this.colorManipulation.adjustBrightness(config.textColor || '#000000', 30),
          muted:
            config.mutedTextColor ||
            this.colorManipulation.adjustBrightness(config.textColor || '#000000', 50),
          inverse: config.inverseTextColor || (config.type === 'dark' ? '#ffffff' : '#000000'),
        },
        border: {
          default: config.borderColor || '#e0e0e0',
          subtle: config.subtleBorderColor || '#f0f0f0',
          strong: config.strongBorderColor || '#c0c0c0',
        },
        accent: {
          primary: config.primaryColor || '#3b82f6',
          secondary: config.secondaryAccentColor || '#6366f1',
          success: config.successColor || '#22c55e',
          warning: config.warningColor || '#f59e0b',
          error: config.errorColor || '#ef4444',
          info: config.infoColor || '#0ea5e9',
        },
      },
      typography: {
        fontFamily: config.fontFamily || {
          heading: 'system-ui, sans-serif',
          body: 'system-ui, sans-serif',
          mono: 'monospace',
        },
        fontWeight: config.fontWeight || {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      spacing: { base: config.spacingBase || 16 },
      borderRadius: config.borderRadius || {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
      },
      shadows: config.shadows || {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(59, 130, 246, 0.2)',
      },
    };
  }

  /**
   * Generate CSS variables from theme
   */
  generateCSSVariables(theme) {
    const vars = {};

    // Background colors
    Object.entries(theme.colors.background).forEach(([key, value]) => {
      vars[`--bg-${key}`] = value;
    });

    // Text colors
    Object.entries(theme.colors.text).forEach(([key, value]) => {
      vars[`--text-${key}`] = value;
    });

    // Border colors
    Object.entries(theme.colors.border).forEach(([key, value]) => {
      vars[`--border-${key}`] = value;
    });

    // Accent colors
    Object.entries(theme.colors.accent).forEach(([key, value]) => {
      vars[`--accent-${key}`] = value;
    });

    // Typography
    vars['--font-heading'] = theme.typography.fontFamily.heading;
    vars['--font-body'] = theme.typography.fontFamily.body;
    vars['--font-mono'] = theme.typography.fontFamily.mono;

    // Spacing
    vars['--spacing-base'] = `${theme.spacing.base}px`;

    // Border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      vars[`--radius-${key}`] = `${value}px`;
    });

    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      vars[`--shadow-${key}`] = value;
    });

    return vars;
  }

  /**
   * Export theme as CSS string
   */
  toCSS(theme) {
    const vars = this.generateCSSVariables(theme);
    let css = ':root {\n';

    Object.entries(vars).forEach(([name, value]) => {
      css += `  ${name}: ${value};\n`;
    });

    css += '}\n';

    // Add dark mode support if applicable
    if (theme.type === 'both' || theme.type === 'dark') {
      css += '\n@media (prefers-color-scheme: dark) {\n  :root {\n';
      // Auto-adjust for dark mode
      Object.entries(theme.colors.background).forEach(([key, value]) => {
        const adjusted = this.colorManipulation.adjustBrightness(value, -80);
        css += `    --bg-${key}: ${adjusted};\n`;
      });
      css += '  }\n}\n';
    }

    return css;
  }

  /**
   * Export theme as JSON
   */
  toJSON(theme) {
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Generate a complete theme package
   */
  generatePackage(themeId, config = {}) {
    const baseTheme = this.getPreset(themeId) || this.createTheme(config);

    return {
      theme: baseTheme,
      css: this.toCSS(baseTheme),
      variables: this.generateCSSVariables(baseTheme),
      colorManipulation: this.colorManipulation,
      metadata: {
        id: themeId || 'custom',
        version: this.version,
        type: baseTheme.type,
        accessibility: baseTheme.accessibility || null,
      },
    };
  }

  /**
   * Create a theme from a primary color
   */
  generateFromPrimary(primaryColor) {
    const hsl = this.colorManipulation.hexToHsl(primaryColor);
    const isDark = hsl.l < 50;

    return this.createTheme({
      name: 'Generated Theme',
      type: isDark ? 'dark' : 'light',
      primaryColor: primaryColor,
      secondaryAccentColor: this.colorManipulation.hslToHex(
        hsl.h,
        hsl.s,
        Math.min(100, hsl.l + 20)
      ),
      backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
      textColor: isDark ? '#ffffff' : '#000000',
    });
  }

  /**
   * Create a complete theme package from a primary color
   */
  quickTheme(primaryColor, name = 'Quick Theme') {
    const theme = this.generateFromPrimary(primaryColor);
    theme.name = name;

    return this.generatePackage(name.toLowerCase().replace(/\s+/g, '-'), {
      ...theme,
      primaryColor,
      name,
    });
  }
}

module.exports = ThemeFactory;
