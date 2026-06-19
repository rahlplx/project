/**
 * Anti-Slop Design Skill
 *
 * Deterministic anti-pattern detectors to prevent AI-generated design slop.
 * Contains 41 rules that catch common design mistakes and enforce quality.
 */

const { SkillBase } = require('../../../lib/skill-base.js');

class AntiSlopSkill extends SkillBase {
  constructor() {
    super();
    this.name = 'anti-slop';
    this.version = '1.0.0';
    this.description = 'Detects and prevents 41 common AI design anti-patterns';

    // Initialize all 41 anti-pattern detectors
    this.detectors = this.initializeDetectors();
  }

  initializeDetectors() {
    return {
      // ===== COLOR ANTI-PATTERNS (1-10) =====

      /**
       * 1. Purple Gradient Ban
       * AI loves generic purple gradients - detect and replace with purposeful palettes
       */
      purpleGradient: {
        id: 1,
        category: 'color',
        name: 'Purple Gradient Ban',
        pattern: /gradient.*purple|linear-gradient.*#?(?:8b5cf6|#8b5cf6|violet|purple)/i,
        message: 'Purple gradients are an AI cliche. Use purposeful, brand-specific colors.',
        severity: 'medium',
        fix: 'Use brand-appropriate gradient or solid colors from your design system.',
      },

      /**
       * 2. Rainbow Everything
       * Using too many colors from the rainbow palette
       */
      rainbowPalette: {
        id: 2,
        category: 'color',
        name: 'Rainbow Palette Overuse',
        check: design => {
          const colors = design.colors || [];
          const rainbowColors = [
            '#FF0000',
            '#FF7F00',
            '#FFFF00',
            '#00FF00',
            '#0000FF',
            '#4B0082',
            '#9400D3',
          ];
          const matches = colors.filter(c => rainbowColors.includes(c.toUpperCase()));
          return matches.length > 2;
        },
        message:
          'Rainbow color palettes are a sign of AI-generated design. Use a cohesive palette.',
        severity: 'high',
        fix: 'Limit to 3-5 colors from a coherent palette. Use tools like coolors.co for inspiration.',
      },

      /**
       * 3. Neon Everything
       * Excessive use of bright neon colors
       */
      neonColors: {
        id: 3,
        category: 'color',
        name: 'Neon Color Overuse',
        pattern: /#[0-9a-f]{6}/i,
        check: design => {
          const colors = design.colors || [];
          return colors.some(c => {
            const hex = c.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);
            return luminance > 0.8 && saturation > 200;
          });
        },
        message: 'Excessive neon colors indicate AI generation. Use refined, professional colors.',
        severity: 'medium',
        fix: 'Reduce saturation and brightness. Professional designs use muted, purposeful colors.',
      },

      /**
       * 4. Gradient Text
       * Gradient text is often an AI design choice
       */
      gradientText: {
        id: 4,
        category: 'color',
        name: 'Gradient Text Detection',
        pattern: /(background-clip|text-fill-color|webkit-background-clip).*text|text.*gradient/i,
        message: 'Gradient text is often an AI design anti-pattern.',
        severity: 'low',
        fix: 'Use solid colors or subtle shadows for text emphasis.',
      },

      /**
       * 5. Drop Shadow Overload
       * Excessive or unrealistic drop shadows
       */
      excessiveShadows: {
        id: 5,
        category: 'color',
        name: 'Excessive Drop Shadows',
        check: design => {
          const shadows = design.shadows || [];
          return (
            shadows.filter(s => {
              if (typeof s === 'string') return s.includes('box-shadow');
              return (s.blur || 20) > 40 || (s.opacity || 0.5) > 0.5;
            }).length > 3
          );
        },
        message: 'Too many or too heavy shadows create an artificial look.',
        severity: 'medium',
        fix: 'Limit shadows to key interactive elements. Use subtle, consistent shadow values.',
      },

      /**
       * 6. Blue Buttons Everywhere
       * Every button being blue is a sign of lazy AI design
       */
      blueButtonSyndrome: {
        id: 6,
        category: 'color',
        name: 'Monotonous Button Color',
        check: design => {
          const buttons = design.buttons || [];
          const colors = buttons.map(b => b.backgroundColor || b.bg);
          const uniqueColors = [...new Set(colors)];
          return uniqueColors.length === 1 && /blue|#007bff|#0d6efd/i.test(uniqueColors[0]);
        },
        message: 'All buttons being the same blue indicates template-based AI generation.',
        severity: 'medium',
        fix: 'Use semantic colors: primary for main actions, secondary for alternatives, danger for destructive.',
      },

      /**
       * 7. White on White
       * Low contrast text that's hard to read
       */
      lowContrastText: {
        id: 7,
        category: 'color',
        name: 'Low Contrast Text',
        check: design => {
          const textColor = design.textColor || '#FFFFFF';
          const bgColor = design.backgroundColor || '#FFFFFF';
          return this.calculateContrastRatio(textColor, bgColor) < 4.5;
        },
        message: 'Text contrast ratio below 4.5:1 fails WCAG accessibility.',
        severity: 'high',
        fix: 'Ensure text has at least 4.5:1 contrast ratio against background.',
      },

      /**
       * 8. Pure Black Text
       * #000000 text can be too harsh
       */
      pureBlackText: {
        id: 8,
        category: 'color',
        name: 'Harsh Pure Black Text',
        check: design => {
          const textColor = design.textColor || '';
          return textColor.toLowerCase() === '#000000' || textColor === 'black';
        },
        message: 'Pure black (#000000) can create harsh contrast. Consider softer dark colors.',
        severity: 'low',
        fix: 'Use near-black like #1a1a2e or #333333 for softer readability.',
      },

      /**
       * 9. Color Palette Size
       * Too many colors in the palette
       */
      paletteSize: {
        id: 9,
        category: 'color',
        name: 'Excessive Color Palette',
        check: design => {
          const colors = design.colors || [];
          return colors.length > 8;
        },
        message: 'Using more than 8 colors indicates lack of design system discipline.',
        severity: 'medium',
        fix: 'Limit to a primary palette of 3-5 colors plus neutrals.',
      },

      /**
       * 10. Unsaturated Grayscale
       * Grays without proper warmth/coolness
       */
      flatGrayscale: {
        id: 10,
        category: 'color',
        name: 'Flat Grayscale Palette',
        check: design => {
          const grays = design.grays || design.neutrals || [];
          if (grays.length < 3) return false;
          const values = grays.map(g => {
            const hex = g.replace('#', '');
            return parseInt(hex.substr(0, 2), 16);
          });
          const range = Math.max(...values) - Math.min(...values);
          return range < 100 || grays.length > 11;
        },
        message: 'Too many gray steps with narrow range creates flat, lifeless UI.',
        severity: 'low',
        fix: 'Use 5-7 well-spaced gray values with intentional temperature (warm or cool).',
      },

      // ===== TYPOGRAPHY ANTI-PATTERNS (11-18) =====

      /**
       * 11. Inter Font Everywhere
       * Inter has become the default AI font
       */
      interFont: {
        id: 11,
        category: 'typography',
        name: 'Inter Font Overuse',
        check: design => {
          const font = (design.fontFamily || design.font || '').toLowerCase();
          return font.includes('inter');
        },
        message: 'Inter font is overused by AI tools. Consider distinctive alternatives.',
        severity: 'medium',
        fix: 'Choose fonts that match your brand: Playfair Display for elegance, Space Grotesk for tech, etc.',
      },

      /**
       * 12. Font Soup
       * Too many different fonts
       */
      fontSoup: {
        id: 12,
        category: 'typography',
        name: 'Font Variety Overload',
        check: design => {
          const fonts = design.fonts || [design.fontFamily];
          const uniqueFonts = fonts.filter(f => f).length;
          return uniqueFonts > 4;
        },
        message: 'More than 4 different fonts indicates lack of design system.',
        severity: 'high',
        fix: 'Limit to 2-3 fonts: one for headings, one for body, optional for accents.',
      },

      /**
       * 13. Same Size Everything
       * No typographic hierarchy
       */
      noHierarchy: {
        id: 13,
        category: 'typography',
        name: 'Missing Type Hierarchy',
        check: design => {
          const sizes = design.fontSizes || [];
          if (sizes.length < 3) return true;
          const uniqueSizes = [...new Set(sizes.map(s => this.normalizeSize(s)))];
          return uniqueSizes.length <= 2;
        },
        message: 'Lack of typographic scale creates visual monotony.',
        severity: 'high',
        fix: 'Implement a type scale: 12/14/16/20/24/32/48/64px or use 1.25 ratio.',
      },

      /**
       * 14. Centered Everything
       * Over-reliance on center alignment
       */
      centerAlignment: {
        id: 14,
        category: 'typography',
        name: 'Excessive Center Alignment',
        check: design => {
          const alignments = design.textAlign || design.alignments || [];
          const centered = alignments.filter(a => a === 'center' || a === 'centered').length;
          return centered / (alignments.length || 1) > 0.7;
        },
        message: 'Over 70% centered text suggests lazy AI alignment.',
        severity: 'medium',
        fix: 'Use left alignment for body text, center for headlines and CTAs only.',
      },

      /**
       * 15. All Caps Headers
       * ALL CAPS HEADERS are an AI staple
       */
      allCapsHeaders: {
        id: 15,
        category: 'typography',
        name: 'ALL CAPS Header Usage',
        check: design => {
          const headers = design.headers || [];
          const allCaps = headers.filter(h => h === h.toUpperCase() && h.length > 3);
          return allCaps.length > 0;
        },
        message: 'ALL CAPS headers are an AI design cliche.',
        severity: 'medium',
        fix: 'Use title case or sentence case. ALL CAPS is acceptable for badges/labels only.',
      },

      /**
       * 16. Comic Sans / Papyrus
       * Obviously wrong font choices
       */
      inappropriateFonts: {
        id: 16,
        category: 'typography',
        name: 'Inappropriate Font Selection',
        check: design => {
          const font = (design.fontFamily || '').toLowerCase();
          const badFonts = ['comic sans', 'papyrus', 'wingdings', 'webdings', 'brush script'];
          return badFonts.some(bad => font.includes(bad));
        },
        message: 'These fonts are universally inappropriate for professional design.',
        severity: 'high',
        fix: 'Use professional fonts: Roboto, Open Sans, Lato, Playfair Display, etc.',
      },

      /**
       * 17. Font Weight Chaos
       * Random font weights without system
       */
      fontWeightChaos: {
        id: 17,
        category: 'typography',
        name: 'Inconsistent Font Weights',
        check: design => {
          const weights = design.fontWeights || [];
          const uniqueWeights = [...new Set(weights)];
          return uniqueWeights.length > 5;
        },
        message: 'Using too many different font weights breaks visual harmony.',
        severity: 'medium',
        fix: 'Limit to 2-3 weights: 400 (regular), 600 (semibold), 700 (bold).',
      },

      /**
       * 18. Tiny Body Text
       * Body text below 16px
       */
      tinyBodyText: {
        id: 18,
        category: 'typography',
        name: 'Body Text Too Small',
        check: design => {
          const bodySize = design.bodyFontSize || 16;
          return bodySize < 16;
        },
        message: 'Body text below 16px hurts readability.',
        severity: 'high',
        fix: 'Use minimum 16px for body text, 14px acceptable only for captions.',
      },

      // ===== LAYOUT ANTI-PATTERNS (19-28) =====

      /**
       * 19. Three Card Layout
       * The classic 3-card feature grid AI loves
       */
      threeCardLayout: {
        id: 19,
        category: 'layout',
        name: 'Three Card Feature Layout',
        check: design => {
          const cards = design.cards || [];
          const sections = design.sections || [];
          return cards.length === 3 || sections.filter(s => s.type === 'features').length > 0;
        },
        message: 'The 3-card feature layout is an AI design cliche.',
        severity: 'medium',
        fix: 'Use varied layouts: 2-column, masonry, asymmetric grids, or unique section designs.',
      },

      /**
       * 20. Hero Section Bloat
       * Oversized hero with too much content
       */
      bloatedHero: {
        id: 20,
        category: 'layout',
        name: 'Hero Section Overload',
        check: design => {
          const hero = design.hero || {};
          const elements = hero.elements || [];
          return elements.length > 5;
        },
        message: 'Hero sections should be simple with one clear CTA.',
        severity: 'medium',
        fix: 'Hero should contain: headline, subheadline, CTA, optional background. Nothing else.',
      },

      /**
       * 21. Equal Padding Everywhere
       * Same padding on all containers
       */
      uniformPadding: {
        id: 21,
        category: 'layout',
        name: 'Uniform Padding Syndrome',
        check: design => {
          const paddings = design.paddings || [];
          if (paddings.length < 5) return false;
          const uniquePaddings = [...new Set(paddings)];
          return uniquePaddings.length <= 2;
        },
        message: 'Identical padding everywhere creates mechanical feel.',
        severity: 'low',
        fix: 'Use varied spacing: tighter for related items, looser for section separation.',
      },

      /**
       * 22. Perfectly Symmetrical
       * All elements perfectly centered and symmetrical
       */
      perfectSymmetry: {
        id: 22,
        category: 'layout',
        name: 'Excessive Symmetry',
        check: design => {
          const layout = design.layout || {};
          return layout.symmetry === 'perfect' || layout.symmetry === true;
        },
        message: 'Perfect symmetry feels robotic. Asymmetry is more interesting.',
        severity: 'low',
        fix: 'Break symmetry with offset elements, varied content lengths, or intentional imbalance.',
      },

      /**
       * 23. Footer Overload
       * Oversized footer with too many links
       */
      footerBloat: {
        id: 23,
        category: 'layout',
        name: 'Footer Link Overload',
        check: design => {
          const footerLinks = design.footer?.links || [];
          return footerLinks.length > 20;
        },
        message: 'Excessive footer links create visual noise.',
        severity: 'medium',
        fix: 'Limit to essential links. Group in 3-4 columns max.',
      },

      /**
       * 24. Grid Lines Visible
       * Using actual grid lines as design element
       */
      visibleGridLines: {
        id: 24,
        category: 'layout',
        name: 'Grid Lines as Decoration',
        check: design => {
          const elements = design.elements || [];
          return elements.some(el => el.type === 'grid-line' || el.showGrid === true);
        },
        message: 'Visible grid lines are a design mistake.',
        severity: 'high',
        fix: 'Use invisible grid for alignment, never as visible decoration.',
      },

      /**
       * 25. Infinite Scroll
       * Default infinite scroll without pagination option
       */
      infiniteScrollDefault: {
        id: 25,
        category: 'layout',
        name: 'Infinite Scroll Without Option',
        check: design => {
          const pagination = design.pagination || {};
          return pagination.type === 'infinite' && !pagination.showLoadMore;
        },
        message: 'Infinite scroll without load more button frustrates users.',
        severity: 'medium',
        fix: 'Provide load more button or pagination as alternative to infinite scroll.',
      },

      /**
       * 26. Sticky Everything
       * Too many sticky elements
       */
      stickyOverload: {
        id: 26,
        category: 'layout',
        name: 'Excessive Sticky Elements',
        check: design => {
          const stickyElements = design.stickyElements || [];
          return stickyElements.length > 1;
        },
        message: 'Multiple sticky elements compete for attention.',
        severity: 'medium',
        fix: 'Only one element should be sticky (usually header/nav).',
      },

      /**
       * 27. Fixed Width Containers
       * Containers breaking on mobile
       */
      fixedWidthContainers: {
        id: 27,
        category: 'layout',
        name: 'Fixed Width on Mobile',
        check: design => {
          const containers = design.containers || [];
          return containers.some(c => c.width && !c.width.includes('%') && !c.width.includes('vw'));
        },
        message: 'Fixed width containers break responsive layouts.',
        severity: 'high',
        fix: 'Use fluid widths: 100%, max-width, or viewport units.',
      },

      /**
       * 28. Centered Column Syndrome
       * Everything in a centered narrow column
       */
      narrowCenteredColumn: {
        id: 28,
        category: 'layout',
        name: 'Narrow Centered Content Column',
        check: design => {
          const container = design.container || {};
          return container.maxWidth && container.maxWidth < 800 && container.margin === 'auto';
        },
        message: 'All content in narrow centered column feels like a Word document.',
        severity: 'medium',
        fix: 'Use full-width sections for visual variety. Reserve narrow columns for reading-heavy content.',
      },

      // ===== COMPONENT ANTI-PATTERNS (29-35) =====

      /**
       * 29. Rounded Corners Overload
       * Everything with border-radius: 9999px
       */
      pillButtons: {
        id: 29,
        category: 'component',
        name: 'Excessive Pill/Pill Shaped Elements',
        check: design => {
          const radius = design.borderRadius || [];
          const pillCount = radius.filter(r => r >= 999).length;
          return pillCount > 2;
        },
        message: 'Too many pill-shaped elements is an AI design pattern.',
        severity: 'medium',
        fix: 'Use subtle border-radius: 4-12px for buttons, 8-16px for cards.',
      },

      /**
       * 30. Icon Overload
       * Too many icons, especially from different sets
       */
      iconSoup: {
        id: 30,
        category: 'component',
        name: 'Icon Overload',
        check: design => {
          const icons = design.icons || [];
          const sets = icons.map(i => i.set).filter(Boolean);
          const uniqueSets = [...new Set(sets)];
          return icons.length > 15 || uniqueSets.length > 2;
        },
        message: 'Too many icons create visual noise. Be selective.',
        severity: 'medium',
        fix: 'Limit icons to key actions and concepts. Use one icon family consistently.',
      },

      /**
       * 31. Avatar Circle Default
       * Using default circular avatars everywhere
       */
      defaultAvatarStyle: {
        id: 31,
        category: 'component',
        name: 'Default Avatar Styling',
        check: design => {
          const avatars = design.avatars || [];
          return avatars.some(a => a.shape === 'circle' && !a.border);
        },
        message: 'Default circular avatars without styling look generic.',
        severity: 'low',
        fix: 'Add subtle borders, shadows, or use rounded squares for more personality.',
      },

      /**
       * 32. Badge Spam
       * Too many notification badges
       */
      badgeOverload: {
        id: 32,
        category: 'component',
        name: 'Notification Badge Spam',
        check: design => {
          const badges = design.badges || [];
          return badges.length > 3;
        },
        message: 'Many notification badges overwhelm the UI.',
        severity: 'medium',
        fix: 'Use badges sparingly for critical notifications only. Consider alternatives like dots.',
      },

      /**
       * 33. Toggle Everything
       * Using toggles instead of proper controls
       */
      toggleOveruse: {
        id: 33,
        category: 'component',
        name: 'Toggle Switch Overuse',
        check: design => {
          const toggles = design.toggles || [];
          const selects = design.selects || [];
          return toggles.length > 5 && toggles.length > selects.length;
        },
        message: 'Toggles should only be used for binary on/off states.',
        severity: 'low',
        fix: 'Use checkboxes for multiple selection, dropdowns for options, toggles for settings only.',
      },

      /**
       * 34. Loading Spinner Overuse
       * Spinners where skeleton screens should be used
       */
      spinnerOveruse: {
        id: 34,
        category: 'component',
        name: 'Loading Spinner Instead of Skeleton',
        check: design => {
          const loading = design.loadingIndicators || [];
          const hasSpinner = loading.some(l => l.type === 'spinner');
          const hasSkeleton = loading.some(l => l.type === 'skeleton');
          return hasSpinner && !hasSkeleton;
        },
        message: 'Spinners are less user-friendly than skeleton screens.',
        severity: 'low',
        fix: 'Use skeleton screens for content loading, spinners only for actions.',
      },

      /**
       * 35. Empty State Neglect
       * No empty state designs
       */
      missingEmptyStates: {
        id: 35,
        category: 'component',
        name: 'Missing Empty States',
        check: design => {
          const hasLists = (design.lists || []).length > 0;
          const hasEmptyStates = (design.emptyStates || []).length > 0;
          return hasLists && !hasEmptyStates;
        },
        message: 'Empty states help users understand when content is missing.',
        severity: 'medium',
        fix: 'Design empty states for lists, tables, search results with helpful messaging.',
      },

      // ===== INTERACTION ANTI-PATTERNS (36-38) =====

      /**
       * 36. Hover Card Explosion
       * Too many hover-triggered elements
       */
      hoverCardOverload: {
        id: 36,
        category: 'interaction',
        name: 'Excessive Hover Interactions',
        check: design => {
          const hoverElements = design.hoverInteractions || [];
          return hoverElements.length > 5;
        },
        message: 'Too many hover effects create distracting, inaccessible interactions.',
        severity: 'medium',
        fix: 'Reserve hover effects for interactive elements only. Mobile has no hover state.',
      },

      /**
       * 37. Auto-play Media
       * Videos or animations that auto-play
       */
      autoplayMedia: {
        id: 37,
        category: 'interaction',
        name: 'Auto-play Media Content',
        check: design => {
          const videos = design.videos || [];
          return videos.some(v => v.autoplay === true && !v.muted);
        },
        message: 'Auto-playing media with sound is an accessibility violation.',
        severity: 'high',
        fix: 'Never auto-play with sound. Auto-play muted video only if essential, with pause control.',
      },

      /**
       * 38. Modal Overload
       * Too many modals for everything
       */
      modalOverload: {
        id: 38,
        category: 'interaction',
        name: 'Excessive Modal Usage',
        check: design => {
          const modals = design.modals || [];
          const pages = design.pages || [];
          return modals.length > pages.length * 2;
        },
        message: 'Too many modals disrupt user flow.',
        severity: 'medium',
        fix: 'Use modals only for critical confirmations. Use inline editing or pages for complex forms.',
      },

      // ===== CONTENT ANTI-PATTERNS (39-41) =====

      /**
       * 39. Lorem Ipsum Detection
       * Placeholder text still in design
       */
      placeholderText: {
        id: 39,
        category: 'content',
        name: 'Lorem Ipsum Placeholder Text',
        check: design => {
          const text = design.text || '';
          const patterns = /lorem|ipsum|placeholder|temp text|sample text/i;
          return patterns.test(text);
        },
        message: 'Placeholder text should never appear in production designs.',
        severity: 'high',
        fix: 'Replace all placeholder text with real, contextual content.',
      },

      /**
       * 40. Generic Stock Photos
       * Using clich stock photo subjects
       */
      stockPhotoCliches: {
        id: 40,
        category: 'content',
        name: 'Cliche Stock Photos',
        check: design => {
          const images = design.images || [];
          const clicheKeywords = [
            'handshake',
            'diversity',
            'technology hand',
            'team smile',
            'lightbulb moment',
          ];
          return images.some(img =>
            clicheKeywords.some(kw => (img.alt || img.caption || '').toLowerCase().includes(kw))
          );
        },
        message: 'Stock photo cliches undermine authenticity.',
        severity: 'medium',
        fix: 'Use real photography, illustrations, or abstract visuals. Consider AI-generated custom art.',
      },

      /**
       * 41. Empty Hero Headlines
       * Vague hero text like "Welcome to the Future"
       */
      vagueHeroText: {
        id: 41,
        category: 'content',
        name: 'Vague Hero Headlines',
        check: design => {
          const heroText = design.hero?.headline || '';
          const vaguePhrases = [
            'welcome to the future',
            'innovating tomorrow',
            'cutting edge',
            'next generation',
            'revolutionary solution',
            'disrupting the industry',
            'best in class',
            'world class',
          ];
          return vaguePhrases.some(phrase => heroText.toLowerCase().includes(phrase));
        },
        message: 'Vague hero headlines add no value. Be specific.',
        severity: 'high',
        fix: 'Use specific, benefit-driven headlines that communicate real value.',
      },
    };
  }

  // Helper method to calculate contrast ratio
  calculateContrastRatio(color1, color2) {
    const getLuminance = hex => {
      const rgb = hex
        .replace('#', '')
        .match(/.{2}/g)
        .map(x => {
          const val = parseInt(x, 16) / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Helper to normalize font sizes
  normalizeSize(size) {
    if (typeof size === 'number') return size;
    const num = parseInt(size);
    return isNaN(num) ? 16 : num;
  }

  /**
   * Analyze a design for anti-patterns
   * @param {Object} design - The design object to analyze
   * @returns {Object} Analysis results with found violations
   */
  analyze(design) {
    const violations = [];
    const warnings = [];

    for (const [key, detector] of Object.entries(this.detectors)) {
      try {
        let detected = false;

        if (detector.pattern) {
          // Check regex patterns against serialized design
          const serialized = JSON.stringify(design);
          detected = detector.pattern.test(serialized);
        } else if (detector.check) {
          detected = detector.check(design);
        }

        if (detected) {
          const issue = {
            id: detector.id,
            category: detector.category,
            name: detector.name,
            message: detector.message,
            fix: detector.fix,
            severity: detector.severity,
          };

          if (detector.severity === 'high') {
            violations.push(issue);
          } else {
            warnings.push(issue);
          }
        }
      } catch (error) {
        console.warn(`Detector ${key} failed:`, error.message);
      }
    }

    const score = this.calculateScore(violations.length, warnings.length);

    return {
      passed: violations.length === 0,
      score,
      violations,
      warnings,
      totalIssues: violations.length + warnings.length,
      summary: this.generateSummary(violations, warnings, score),
    };
  }

  /**
   * Calculate a quality score from 0-100
   */
  calculateScore(violations, warnings) {
    const baseScore = 100;
    const violationPenalty = violations * 15;
    const warningPenalty = warnings * 5;
    return Math.max(0, Math.min(100, baseScore - violationPenalty - warningPenalty));
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(violations, warnings, score) {
    if (violations.length === 0 && warnings.length === 0) {
      return 'No anti-patterns detected. Design passes all checks.';
    }

    const parts = [];
    if (violations.length > 0) {
      parts.push(`${violations.length} critical violation(s)`);
    }
    if (warnings.length > 0) {
      parts.push(`${warnings.length} warning(s)`);
    }

    return `${parts.join(', ')}. Score: ${score}/100`;
  }

  /**
   * Get all available detector categories
   */
  getCategories() {
    const categories = {};
    for (const detector of Object.values(this.detectors)) {
      if (!categories[detector.category]) {
        categories[detector.category] = [];
      }
      categories[detector.category].push({
        id: detector.id,
        name: detector.name,
        severity: detector.severity,
      });
    }
    return categories;
  }

  /**
   * Get detailed information about a specific detector
   */
  getDetectorInfo(detectorId) {
    for (const detector of Object.values(this.detectors)) {
      if (detector.id === detectorId) {
        return {
          id: detector.id,
          category: detector.category,
          name: detector.name,
          message: detector.message,
          fix: detector.fix,
          severity: detector.severity,
        };
      }
    }
    return null;
  }
}

module.exports = AntiSlopSkill;
