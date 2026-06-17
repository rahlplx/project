/**
 * Color Generator Skill
 *
 * Generates WCAG-compliant color palettes with accessibility considerations.
 * Supports brand color expansion, semantic color systems, and contrast checking.
 */

class ColorGenerator {
  constructor() {
    this.name = 'color-gen';
    this.description = 'Generates WCAG-compliant color palettes with accessibility considerations';
    this.version = '1.0.0';
    this.wcagRequirements = {
      normalText: { ratio: 4.5, level: 'AA' },
      largeText: { ratio: 3, level: 'AA' },
      uiComponents: { ratio: 3, level: 'AA' },
      enhanced: { ratio: 7, level: 'AAA' },
    };
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Parse hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(r, g, b) {
    return (
      '#' +
      [r, g, b]
        .map(x => {
          const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  /**
   * Convert RGB to HSL
   */
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

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
  }

  /**
   * Convert HSL to RGB
   */
  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
  }

  /**
   * Calculate relative luminance
   */
  getLuminance(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val /= 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if contrast meets WCAG requirements
   */
  meetsWCAG(color1, color2, level = 'AA') {
    const ratio = this.getContrastRatio(color1, color2);
    const requirements = this.wcagRequirements;

    const thresholds = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 },
    };

    return {
      ratio: Math.round(ratio * 100) / 100,
      passesNormal: ratio >= thresholds[level].normal,
      passesLarge: ratio >= thresholds[level].large,
      level,
    };
  }

  /**
   * Get accessible text color for background
   */
  getAccessibleTextColor(bgColor, preferredColor = null) {
    const lightText = '#ffffff';
    const darkText = '#1a1a2e';

    if (preferredColor) {
      const ratio = this.getContrastRatio(bgColor, preferredColor);
      if (ratio >= 4.5) return { color: preferredColor, ratio };
    }

    const lightRatio = this.getContrastRatio(bgColor, lightText);
    const darkRatio = this.getContrastRatio(bgColor, darkText);

    return lightRatio > darkRatio
      ? { color: lightText, ratio: lightRatio }
      : { color: darkText, ratio: darkRatio };
  }

  // ===== PALETTE GENERATION =====

  /**
   * Generate a complete color scale from a base color
   */
  generateScale(baseColor, options = {}) {
    const {
      steps = 10,
      startLightness = 95,
      endLightness = 10,
      startShade = 50,
      shadeStep = 100,
    } = options;

    const hsl = this.rgbToHsl(...Object.values(this.hexToRgb(baseColor)));
    const scale = {};
    const lightnessStep = (startLightness - endLightness) / (steps - 1);

    for (let i = 0; i < steps; i++) {
      const lightness = startLightness - i * lightnessStep;
      const shade = startShade + i * shadeStep;
      const rgb = this.hslToRgb(hsl.h, hsl.s, lightness);
      scale[shade] = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    return scale;
  }

  /**
   * Generate a complementary color
   */
  getComplementary(color) {
    const hsl = this.rgbToHsl(...Object.values(this.hexToRgb(color)));
    hsl.h = (hsl.h + 180) % 360;
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  /**
   * Generate analogous colors
   */
  getAnalogous(color, angle = 30) {
    const hsl = this.rgbToHsl(...Object.values(this.hexToRgb(color)));
    return [
      this.hslToRgb((hsl.h - angle + 360) % 360, hsl.s, hsl.l),
      this.hslToRgb(hsl.h, hsl.s, hsl.l),
      this.hslToRgb((hsl.h + angle) % 360, hsl.s, hsl.l),
    ].map(rgb => this.rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  /**
   * Generate triadic colors
   */
  getTriadic(color) {
    const hsl = this.rgbToHsl(...Object.values(this.hexToRgb(color)));
    return [
      this.hslToRgb(hsl.h, hsl.s, hsl.l),
      this.hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l),
      this.hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l),
    ].map(rgb => this.rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  /**
   * Generate split-complementary colors
   */
  getSplitComplementary(color, angle = 30) {
    const hsl = this.rgbToHsl(...Object.values(this.hexToRgb(color)));
    return [
      this.hslToRgb(hsl.h, hsl.s, hsl.l),
      this.hslToRgb((hsl.h + 180 - angle + 360) % 360, hsl.s, hsl.l),
      this.hslToRgb((hsl.h + 180 + angle) % 360, hsl.s, hsl.l),
    ].map(rgb => this.rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  /**
   * Generate a complete brand palette
   */
  generateBrandPalette(primaryColor) {
    const scale = this.generateScale(primaryColor);
    const complementary = this.getComplementary(primaryColor);
    const triadic = this.getTriadic(primaryColor);
    const analogous = this.getAnalogous(primaryColor);

    return {
      primary: scale,
      accent: {
        primary: primaryColor,
        complementary,
        triadic,
        analogous,
      },
      neutral: this.generateNeutralPalette(
        this.getLuminance(primaryColor) > 0.5 ? '#1a1a2e' : '#f8fafc'
      ),
    };
  }

  /**
   * Generate neutral palette
   */
  generateNeutralPalette(baseColor = '#64748b') {
    const isLight = this.getLuminance(baseColor) > 0.5;
    const base = this.hexToRgb(baseColor);
    const hsl = this.rgbToHsl(base.r, base.g, base.b);

    const shades = isLight
      ? [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50, 0]
      : [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

    const palette = {};
    const lightnesses = isLight
      ? [4, 8, 13, 18, 25, 33, 45, 60, 75, 88, 95, 98]
      : [98, 95, 90, 82, 70, 55, 42, 30, 22, 15, 10, 5];

    shades.forEach((shade, i) => {
      const rgb = this.hslToRgb(hsl.h, hsl.s, lightnesses[i]);
      palette[shade] = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    });

    return palette;
  }

  /**
   * Generate semantic color system
   */
  generateSemanticPalette(baseColor) {
    const base = this.hexToRgb(baseColor);
    const hsl = this.rgbToHsl(base.r, base.g, base.b);

    const semantic = {
      success: { h: 142, s: 76, l: 45 }, // Green-ish
      warning: { h: 38, s: 92, l: 51 }, // Amber
      error: { h: 0, s: 84, l: 61 }, // Red
      info: { h: 199, s: 89, l: 48 }, // Blue
    };

    const palette = {};

    for (const [name, color] of Object.entries(semantic)) {
      const rgb = this.hslToRgb(color.h, color.s, color.l);
      const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      palette[name] = {
        light: this.generateScale(hex, { steps: 3, startLightness: 90, endLightness: 70 })[90],
        main: hex,
        dark: this.generateScale(hex, { steps: 3, startLightness: 40, endLightness: 25 })[30],
      };
    }

    return palette;
  }

  // ===== ACCESSIBILITY PALETTE GENERATION =====

  /**
   * Generate accessible palette with guaranteed contrast
   */
  generateAccessiblePalette(baseColor, backgroundColor = '#ffffff') {
    const baseLuminance = this.getLuminance(baseColor);
    const bgLuminance = this.getLuminance(backgroundColor);
    const isDark = baseLuminance < bgLuminance;

    // Find a color with sufficient contrast
    let accessibleColor = baseColor;
    const steps = 20;
    const lightnessRange = isDark
      ? { start: baseLuminance * 100, end: 95 }
      : { start: baseLuminance * 100, end: 5 };
    const lightnessStep = (lightnessRange.end - lightnessRange.start) / steps;

    for (let i = 1; i <= steps; i++) {
      const newLuminance = lightnessRange.start + i * lightnessStep;
      const rgb = this.hslToRgb(
        this.rgbToHsl(...Object.values(this.hexToRgb(baseColor))).h,
        this.rgbToHsl(...Object.values(this.hexToRgb(baseColor))).s,
        newLuminance
      );
      const testColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);

      if (this.getContrastRatio(testColor, backgroundColor) >= 4.5) {
        accessibleColor = testColor;
        break;
      }
    }

    return {
      original: baseColor,
      accessible: accessibleColor,
      contrastRatio: this.getContrastRatio(accessibleColor, backgroundColor),
      wcag: this.meetsWCAG(accessibleColor, backgroundColor),
    };
  }

  /**
   * Generate palette with auto dark/light variants
   */
  generateDualPalette(primaryColor) {
    const lightBg = '#ffffff';
    const darkBg = '#0f172a';

    return {
      light: {
        background: lightBg,
        foreground: this.getAccessibleTextColor(lightBg, primaryColor).color,
        primary: primaryColor,
        ...this.generateScale(primaryColor),
      },
      dark: {
        background: darkBg,
        foreground: this.getAccessibleTextColor(darkBg, primaryColor).color,
        primary: this.generateAccessiblePalette(primaryColor, darkBg).accessible,
        ...this.generateScale(this.generateAccessiblePalette(primaryColor, darkBg).accessible, {
          startLightness: 80,
          endLightness: 20,
        }),
      },
    };
  }

  // ===== PREBUILT PALETTES =====

  getPresetPalettes() {
    return {
      ocean: {
        primary: '#0ea5e9',
        palette: this.generateBrandPalette('#0ea5e9'),
      },
      forest: {
        primary: '#22c55e',
        palette: this.generateBrandPalette('#22c55e'),
      },
      sunset: {
        primary: '#f97316',
        palette: this.generateBrandPalette('#f97316'),
      },
      berry: {
        primary: '#ec4899',
        palette: this.generateBrandPalette('#ec4899'),
      },
      violet: {
        primary: '#8b5cf6',
        palette: this.generateBrandPalette('#8b5cf6'),
      },
      emerald: {
        primary: '#10b981',
        palette: this.generateBrandPalette('#10b981'),
      },
      rose: {
        primary: '#f43f5e',
        palette: this.generateBrandPalette('#f43f5e'),
      },
      amber: {
        primary: '#f59e0b',
        palette: this.generateBrandPalette('#f59e0b'),
      },
    };
  }

  // ===== EXPORT FUNCTIONS =====

  /**
   * Export palette as CSS variables
   */
  toCSSVariables(palette, prefix = 'color') {
    const vars = {};

    const flattenPalette = (obj, path = []) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !value.startsWith('#')) {
          flattenPalette(value, [...path, key]);
        } else if (typeof value === 'string' && value.startsWith('#')) {
          const varName = [...path, key].join('-');
          vars[`--${prefix}-${varName}`] = value;
        }
      }
    };

    flattenPalette(palette);
    return vars;
  }

  /**
   * Export palette as CSS string
   */
  toCSS(palette, prefix = 'color') {
    const vars = this.toCSSVariables(palette, prefix);
    let css = ':root {\n';

    for (const [name, value] of Object.entries(vars)) {
      css += `  ${name}: ${value};\n`;
    }

    css += '}\n';
    return css;
  }

  /**
   * Export palette as Tailwind config
   */
  toTailwindConfig(palette, prefix = 'brand') {
    const config = { colors: {} };

    const flattenPalette = (obj, path = []) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !value.startsWith('#')) {
          flattenPalette(value, [...path, key]);
        } else if (typeof value === 'string' && value.startsWith('#')) {
          const colorName = [prefix, ...path, key].join('-');
          config.colors[colorName] = value;
        }
      }
    };

    flattenPalette(palette);
    return config;
  }

  /**
   * Generate contrast matrix for a palette
   */
  generateContrastMatrix(palette, backgroundColor = '#ffffff') {
    const matrix = [];
    const colors = [];

    // Flatten palette to get all colors
    const flatten = obj => {
      for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
          if (value.startsWith && value.startsWith('#')) {
            colors.push(value);
          } else {
            flatten(value);
          }
        }
      }
    };
    flatten(palette);

    // Calculate contrast for each color
    for (const color of colors) {
      const ratio = this.getContrastRatio(color, backgroundColor);
      matrix.push({
        color,
        contrast: Math.round(ratio * 100) / 100,
        passesAA: ratio >= 4.5,
        passesAAA: ratio >= 7,
        textColor: this.getAccessibleTextColor(color).color,
      });
    }

    return matrix;
  }

  /**
   * Create a complete color system
   */
  createColorSystem(primaryColor) {
    const brand = this.generateBrandPalette(primaryColor);
    const semantic = this.generateSemanticPalette(primaryColor);
    const neutral = this.generateNeutralPalette(
      this.getLuminance(primaryColor) > 0.5 ? '#1a1a2e' : '#f8fafc'
    );

    return {
      brand,
      semantic,
      neutral,
      scale: this.generateScale(primaryColor),
      dual: this.generateDualPalette(primaryColor),
      contrastMatrix: this.generateContrastMatrix({
        ...brand,
        ...semantic,
        neutral,
      }),
    };
  }

  /**
   * Generate a complete color system package
   */
  generatePackage(primaryColor, name = 'Custom') {
    const system = this.createColorSystem(primaryColor);

    return {
      name,
      primaryColor,
      system,
      css: this.toCSS(system),
      variables: this.toCSSVariables(system),
      tailwind: this.toTailwindConfig(system, name.toLowerCase().replace(/\s+/g, '-')),
      accessibility: system.contrastMatrix.filter(c => c.passesAA),
    };
  }
}

module.exports = ColorGenerator;
