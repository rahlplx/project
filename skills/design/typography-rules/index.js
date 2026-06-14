/**
 * Typography Rules Skill
 * 
 * Typography best practices including font pairing rules, hierarchy guidelines,
 * and systematic approaches to type selection for professional design.
 */

class TypographyRules {
  constructor() {
    this.version = '1.0.0';
    this.fontPairings = this.initializeFontPairings();
    this.typeScale = this.initializeTypeScale();
    this.lineHeightGuidelines = this.initializeLineHeightGuidelines();
  }

  // ===== FONT PAIRINGS =====

  initializeFontPairings() {
    return {
      // Modern & Clean Pairings
      'plus-jakarta': {
        heading: '"Plus Jakarta Sans", system-ui, sans-serif',
        body: '"Inter", system-ui, sans-serif',
        display: '"Plus Jakarta Sans", system-ui, sans-serif',
        mood: 'Modern, professional, tech-forward',
        useCase: ['SaaS', 'Apps', 'Portfolios']
      },
      'dm-sans': {
        heading: '"DM Sans", system-ui, sans-serif',
        body: '"IBM Plex Sans", system-ui, sans-serif',
        display: '"DM Sans", system-ui, sans-serif',
        mood: 'Friendly, approachable, clean',
        useCase: ['Startups', 'Creative', 'Agency']
      },
      'outfit': {
        heading: '"Outfit", system-ui, sans-serif',
        body: '"Source Sans 3", system-ui, sans-serif',
        display: '"Outfit", system-ui, sans-serif',
        mood: 'Bold, contemporary, geometric',
        useCase: ['Modern apps', 'Dashboards', 'Landing pages']
      },
      'sora': {
        heading: '"Sora", system-ui, sans-serif',
        body: '"Work Sans", system-ui, sans-serif',
        display: '"Sora", system-ui, sans-serif',
        mood: 'Futuristic, minimal, premium',
        useCase: ['Tech', 'Finance', 'Premium brands']
      },
      'manrope': {
        heading: '"Manrope", system-ui, sans-serif',
        body: '"Manrope", system-ui, sans-serif',
        display: '"Manrope", system-ui, sans-serif',
        mood: 'Versatile, geometric, modern',
        useCase: ['Universal', 'Product', 'Enterprise']
      },
      'space-grotesk': {
        heading: '"Space Grotesk", system-ui, sans-serif',
        body: '"IBM Plex Sans", system-ui, sans-serif',
        display: '"Space Grotesk", system-ui, sans-serif',
        mood: 'Techy, distinctive, bold',
        useCase: ['Developer tools', 'Gaming', 'Innovation']
      },
      'figtree': {
        heading: '"Figtree", system-ui, sans-serif',
        body: '"Figtree", system-ui, sans-serif',
        display: '"Figtree", system-ui, sans-serif',
        mood: 'Friendly, rounded, warm',
        useCase: ['Consumer apps', 'Social', 'Lifestyle']
      },
      'general-sans': {
        heading: '"General Sans", system-ui, sans-serif',
        body: '"General Sans", system-ui, sans-serif',
        display: '"General Sans", system-ui, sans-serif',
        mood: 'Swiss-inspired, balanced',
        useCase: ['Editorial', 'Branding', 'Design agencies']
      },

      // Serif & Editorial Pairings
      'fraunces': {
        heading: '"Fraunces", Georgia, serif',
        body: '"Source Serif 4", Georgia, serif',
        display: '"Fraunces", Georgia, serif',
        mood: 'Warm, distinctive, editorial',
        useCase: ['Magazines', 'Blogs', 'Luxury brands']
      },
      'playfair': {
        heading: '"Playfair Display", Georgia, serif',
        body: '"Source Sans 3", system-ui, sans-serif',
        display: '"Playfair Display", Georgia, serif',
        mood: 'Elegant, classic, high-end',
        useCase: ['Fashion', 'Luxury', 'Editorial']
      },
      'libre-baskerville': {
        heading: '"Libre Baskerville", Georgia, serif',
        body: '"Libre Franklin", system-ui, sans-serif',
        display: '"Libre Baskerville", Georgia, serif',
        mood: 'Traditional, authoritative, readable',
        useCase: ['News', 'Academic', 'Legal']
      },
      'cormorant': {
        heading: '"Cormorant", Georgia, serif',
        body: '"Jost", system-ui, sans-serif',
        display: '"Cormorant", Georgia, serif',
        mood: 'Delicate, refined, sophisticated',
        useCase: ['Art', 'Culture', 'Boutique']
      },
      'cabinet-grotesk': {
        heading: '"Cabinet Grotesk", system-ui, sans-serif',
        body: '"Instrument Sans", system-ui, sans-serif',
        display: '"Cabinet Grotesk", system-ui, sans-serif',
        mood: 'Friendly grotesque, contemporary',
        useCase: ['Startups', 'Product', 'Marketing']
      },
      'clash-display': {
        heading: '"Clash Display", system-ui, sans-serif',
        body: '"Satoshi", system-ui, sans-serif',
        display: '"Clash Display", system-ui, sans-serif',
        mood: 'Bold, expressive, trendy',
        useCase: ['Creative', 'Fashion', 'Art']
      },

      // Mono & Technical Pairings
      'jetbrains': {
        heading: '"JetBrains Mono", monospace',
        body: '"Inter", system-ui, sans-serif',
        display: '"JetBrains Mono", monospace',
        mood: 'Technical, precise, developer-focused',
        useCase: ['Documentation', 'Code', 'Dev tools']
      },
      'fira-code': {
        heading: '"Fira Code", monospace',
        body: '"Fira Sans", system-ui, sans-serif',
        display: '"Fira Code", monospace',
        mood: 'Clean, readable, systematic',
        useCase: ['Developer', 'Technical docs', 'API']
      },

      // Display & Impact Pairings
      'bebas': {
        heading: '"Bebas Neue", Impact, sans-serif',
        body: '"Barlow", system-ui, sans-serif',
        display: '"Bebas Neue", Impact, sans-serif',
        mood: 'Bold, impactful, poster-like',
        useCase: ['Sports', 'Events', 'Promotional']
      },
      'anton': {
        heading: '"Anton", Impact, sans-serif',
        body: '"Work Sans", system-ui, sans-serif',
        display: '"Anton", Impact, sans-serif',
        mood: 'Heavy, commanding, attention-grabbing',
        useCase: ['Headlines', 'Hero sections', 'Advertising']
      },
      'big-shoulders': {
        heading: '"Big Shoulders Display", system-ui, sans-serif',
        body: '"Big Shoulders Text", system-ui, sans-serif',
        display: '"Big Shoulders Display", system-ui, sans-serif',
        mood: 'Industrial, urban, bold',
        useCase: ['Sports', 'City', 'Bold branding']
      },

      // Unique & Distinctive Pairings
      'switzer': {
        heading: '"Switzer", system-ui, sans-serif',
        body: '"Switzer", system-ui, sans-serif',
        display: '"Switzer", system-ui, sans-serif',
        mood: 'Swiss precision, modern grotesque',
        useCase: ['Corporate', 'Finance', 'Professional']
      },
      'newsreader': {
        heading: '"Newsreader", Georgia, serif',
        body: '"Newsreader", Georgia, serif',
        display: '"Newsreader", Georgia, serif',
        mood: 'Editorial, newspaper-inspired',
        useCase: ['Publications', 'Long-form content', 'Magazines']
      }
    };
  }

  // ===== TYPE SCALE =====

  initializeTypeScale() {
    return {
      // Minor Third (1.2)
      minorThird: {
        ratio: 1.2,
        base: 16,
        scale: [
          { name: 'xs', size: 12, px: '12px', rem: '0.75rem' },
          { name: 'sm', size: 14, px: '14px', rem: '0.875rem' },
          { name: 'base', size: 16, px: '16px', rem: '1rem' },
          { name: 'lg', size: 19, px: '19px', rem: '1.1875rem' },
          { name: 'xl', size: 23, px: '23px', rem: '1.4375rem' },
          { name: '2xl', size: 28, px: '28px', rem: '1.75rem' },
          { name: '3xl', size: 33, px: '33px', rem: '2.0625rem' },
          { name: '4xl', size: 40, px: '40px', rem: '2.5rem' },
          { name: '5xl', size: 48, px: '48px', rem: '3rem' },
          { name: '6xl', size: 57, px: '57px', rem: '3.5625rem' },
          { name: '7xl', size: 69, px: '69px', rem: '4.3125rem' }
        ]
      },
      // Major Third (1.25)
      majorThird: {
        ratio: 1.25,
        base: 16,
        scale: [
          { name: 'xs', size: 12, px: '12px', rem: '0.75rem' },
          { name: 'sm', size: 14, px: '14px', rem: '0.875rem' },
          { name: 'base', size: 16, px: '16px', rem: '1rem' },
          { name: 'lg', size: 20, px: '20px', rem: '1.25rem' },
          { name: 'xl', size: 25, px: '25px', rem: '1.5625rem' },
          { name: '2xl', size: 31, px: '31px', rem: '1.9375rem' },
          { name: '3xl', size: 39, px: '39px', rem: '2.4375rem' },
          { name: '4xl', size: 49, px: '49px', rem: '3.0625rem' },
          { name: '5xl', size: 61, px: '61px', rem: '3.8125rem' },
          { name: '6xl', size: 76, px: '76px', rem: '4.75rem' },
          { name: '7xl', size: 95, px: '95px', rem: '5.9375rem' }
        ]
      },
      // Perfect Fourth (1.333)
      perfectFourth: {
        ratio: 1.333,
        base: 16,
        scale: [
          { name: 'xs', size: 12, px: '12px', rem: '0.75rem' },
          { name: 'sm', size: 14, px: '14px', rem: '0.875rem' },
          { name: 'base', size: 16, px: '16px', rem: '1rem' },
          { name: 'lg', size: 21, px: '21px', rem: '1.3125rem' },
          { name: 'xl', size: 28, px: '28px', rem: '1.75rem' },
          { name: '2xl', size: 38, px: '38px', rem: '2.375rem' },
          { name: '3xl', size: 50, px: '50px', rem: '3.125rem' },
          { name: '4xl', size: 67, px: '67px', rem: '4.1875rem' },
          { name: '5xl', size: 90, px: '90px', rem: '5.625rem' },
          { name: '6xl', size: 120, px: '120px', rem: '7.5rem' },
          { name: '7xl', size: 160, px: '160px', rem: '10rem' }
        ]
      },
      // Golden Ratio (1.618)
      goldenRatio: {
        ratio: 1.618,
        base: 16,
        scale: [
          { name: 'xs', size: 10, px: '10px', rem: '0.625rem' },
          { name: 'sm', size: 12, px: '12px', rem: '0.75rem' },
          { name: 'base', size: 16, px: '16px', rem: '1rem' },
          { name: 'lg', size: 21, px: '21px', rem: '1.3125rem' },
          { name: 'xl', size: 26, px: '26px', rem: '1.625rem' },
          { name: '2xl', size: 42, px: '42px', rem: '2.625rem' },
          { name: '3xl', size: 68, px: '68px', rem: '4.25rem' },
          { name: '4xl', size: 110, px: '110px', rem: '6.875rem' },
          { name: '5xl', size: 178, px: '178px', rem: '11.125rem' },
          { name: '6xl', size: 288, px: '288px', rem: '18rem' },
          { name: '7xl', size: 466, px: '466px', rem: '29.125rem' }
        ]
      }
    };
  }

  // ===== LINE HEIGHT GUIDELINES =====

  initializeLineHeightGuidelines() {
    return {
      tight: { min: 1.0, max: 1.2, use: ['Display text', 'Large headings', 'Short headlines'] },
      snug: { min: 1.25, max: 1.375, use: ['Small headings', 'Subheadings', 'UI labels'] },
      normal: { min: 1.4, max: 1.5, use: ['Body text', 'Large text (18px+)'] },
      relaxed: { min: 1.5, max: 1.625, use: ['Long-form reading', 'Article body', 'Blog posts'] },
      loose: { min: 1.625, max: 2.0, use: ['Accessibility text', 'Large print', 'Learning materials'] }
    };
  }

  // ===== PUBLIC METHODS =====

  /**
   * Get a font pairing by name
   */
  getPairing(name) {
    return this.fontPairings[name] || null;
  }

  /**
   * Get all available font pairings
   */
  getAllPairings() {
    return Object.entries(this.fontPairings).map(([name, pairing]) => ({
      id: name,
      ...pairing
    }));
  }

  /**
   * Suggest pairings based on mood/use case
   */
  suggestPairing(mood) {
    return Object.entries(this.fontPairings)
      .filter(([_, p]) => 
        p.mood.toLowerCase().includes(mood.toLowerCase()) ||
        p.useCase.some(u => u.toLowerCase().includes(mood.toLowerCase()))
      )
      .map(([name, pairing]) => ({ id: name, ...pairing }));
  }

  /**
   * Get a type scale by name
   */
  getTypeScale(name) {
    return this.typeScale[name] || this.typeScale.majorThird;
  }

  /**
   * Calculate font size from scale
   */
  calculateScale(baseSize = 16, ratio = 1.25, steps = 6) {
    const scale = [];
    for (let i = -2; i <= steps; i++) {
      const size = baseSize * Math.pow(ratio, i);
      scale.push({
        step: i,
        size: Math.round(size * 100) / 100,
        px: `${Math.round(size)}px`,
        rem: `${Math.round(size * 100) / 100 / 16}rem`
      });
    }
    return scale;
  }

  /**
   * Generate font stack from primary font
   */
  generateFontStack(primaryFont, type = 'sans') {
    const stacks = {
      sans: {
        'Plus Jakarta Sans': '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Inter': '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'DM Sans': '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Outfit': '"Outfit", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Manrope': '"Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Space Grotesk': '"Space Grotesk", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Work Sans': '"Work Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'IBM Plex Sans': '"IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Source Sans 3': '"Source Sans 3", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Jost': '"Jost", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Barlow': '"Barlow", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Sora': '"Sora", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Figtree': '"Figtree", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'General Sans': '"General Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Switzer': '"Switzer", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Libre Franklin': '"Libre Franklin", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Instrument Sans': '"Instrument Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'Satoshi': '"Satoshi", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      },
      serif: {
        'Playfair Display': '"Playfair Display", Georgia, "Times New Roman", serif',
        'Fraunces': '"Fraunces", Georgia, "Times New Roman", serif',
        'Libre Baskerville': '"Libre Baskerville", Georgia, "Times New Roman", serif',
        'Cormorant': '"Cormorant", Georgia, "Times New Roman", serif',
        'Newsreader': '"Newsreader", Georgia, "Times New Roman", serif',
        'Source Serif 4': '"Source Serif 4", Georgia, "Times New Roman", serif',
        'Lora': '"Lora", Georgia, "Times New Roman", serif',
        'Merriweather': '"Merriweather", Georgia, "Times New Roman", serif'
      },
      display: {
        'Bebas Neue': '"Bebas Neue", Impact, sans-serif',
        'Anton': '"Anton", Impact, sans-serif',
        'Big Shoulders Display': '"Big Shoulders Display", Impact, sans-serif',
        'Oswald': '"Oswald", Impact, sans-serif',
        'Teko': '"Teko", Impact, sans-serif'
      },
      mono: {
        'JetBrains Mono': '"JetBrains Mono", "SF Mono", Monaco, "Fira Code", monospace',
        'Fira Code': '"Fira Code", "SF Mono", Monaco, "Consolas", monospace',
        'Fira Mono': '"Fira Mono", "SF Mono", Monaco, "Consolas", monospace',
        'IBM Plex Mono': '"IBM Plex Mono", "SF Mono", Monaco, "Consolas", monospace',
        'Source Code Pro': '"Source Code Pro", "SF Mono", Monaco, "Consolas", monospace',
        'Space Mono': '"Space Mono", "SF Mono", Monaco, "Consolas", monospace'
      }
    };

    return stacks[type]?.[primaryFont] || `"${primaryFont}", system-ui, sans-serif`;
  }

  /**
   * Generate line-height based on font size
   */
  getLineHeight(fontSize) {
    if (fontSize >= 48) return 1.0;
    if (fontSize >= 32) return 1.1;
    if (fontSize >= 24) return 1.2;
    if (fontSize >= 20) return 1.3;
    if (fontSize >= 18) return 1.4;
    if (fontSize >= 16) return 1.5;
    if (fontSize >= 14) return 1.6;
    return 1.6;
  }

  /**
   * Generate letter-spacing based on font size
   */
  getLetterSpacing(fontSize, fontWeight = 400, textTransform = 'none') {
    // Tight tracking for large display text
    if (fontSize >= 64) return '-0.03em';
    if (fontSize >= 48) return '-0.02em';
    if (fontSize >= 32) return '-0.01em';
    
    // Normal for body text
    if (fontSize >= 14) return '0';
    
    // Slight tracking for small caps/labels
    if (textTransform === 'uppercase') {
      return fontWeight >= 600 ? '0.05em' : '0.1em';
    }
    
    return '0.01em';
  }

  /**
   * Generate complete typography styles
   */
  generateTypography(config = {}) {
    const {
      fontFamily = this.fontPairings['plus-jakarta'],
      typeScale = 'majorThird',
      baseSize = 16
    } = config;

    const scale = this.calculateScale(baseSize, this.typeScale[typeScale].ratio, 6);
    
    return {
      fontFamily: {
        heading: this.generateFontStack(fontFamily.heading.match(/"([^"]+)"/)?.[1] || 'Plus Jakarta Sans', 'sans'),
        body: this.generateFontStack(fontFamily.body.match(/"([^"]+)"/)?.[1] || 'Inter', 'sans'),
        display: this.generateFontStack(fontFamily.heading.match(/"([^"]+)"/)?.[1] || 'Plus Jakarta Sans', 'sans'),
        mono: '"JetBrains Mono", "SF Mono", Monaco, monospace'
      },
      size: {
        xs: scale[0].px,
        sm: scale[1].px,
        base: scale[2].px,
        lg: scale[3].px,
        xl: scale[4].px,
        '2xl': scale[5].px,
        '3xl': scale[6].px,
        '4xl': scale[7].px
      },
      lineHeight: {
        tight: 1.1,
        snug: 1.3,
        normal: 1.5,
        relaxed: 1.625
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    };
  }

  /**
   * Export typography as CSS variables
   */
  toCSS(typography) {
    let css = ':root {\n';
    
    Object.entries(typography.fontFamily).forEach(([name, value]) => {
      css += `  --font-${name}: ${value};\n`;
    });
    
    Object.entries(typography.size).forEach(([name, value]) => {
      css += `  --text-${name}: ${value};\n`;
    });
    
    Object.entries(typography.lineHeight).forEach(([name, value]) => {
      css += `  --leading-${name}: ${value};\n`;
    });
    
    Object.entries(typography.fontWeight).forEach(([name, value]) => {
      css += `  --font-${name}: ${value};\n`;
    });
    
    css += '}\n';
    return css;
  }

  /**
   * Generate heading styles
   */
  generateHeadingStyles() {
    return {
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        marginBottom: '0.5em'
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
        marginBottom: '0.5em'
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        marginBottom: '0.5em'
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0',
        marginBottom: '0.5em'
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: '0',
        marginBottom: '0.5em'
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0',
        marginBottom: '0.5em'
      }
    };
  }

  /**
   * Generate body text styles
   */
  generateBodyStyles() {
    return {
      bodyLarge: {
        fontSize: '1.125rem',
        lineHeight: 1.625,
        marginBottom: '1em'
      },
      body: {
        fontSize: '1rem',
        lineHeight: 1.6,
        marginBottom: '1em'
      },
      bodySmall: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        marginBottom: '1em'
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
        letterSpacing: '0.02em'
      },
      overline: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 600
      }
    };
  }

  /**
   * Check font loading performance
   */
  checkFontPerformance(fontFamily) {
    const fontName = fontFamily.match(/"([^"]+)"/)?.[1] || fontFamily;
    return {
      fontFamily,
      suggestions: [
        `Use font-display: swap for ${fontName}`,
        'Preload critical fonts with <link rel="preload">',
        'Subset fonts to used character sets',
        'Consider variable fonts for better performance'
      ]
    };
  }
}

module.exports = TypographyRules;