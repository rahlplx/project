/**
 * Visual Plans Skill
 * Generates UI mockups and visual plans from natural language descriptions
 */

class VisualPlansSkill {
  constructor(options = {}) {
    this.name = 'visual-plans';
    this.description = 'Generate UI mockups and pseudo-code from descriptions';
    this.colorScheme = options.colorScheme || 'modern';
    this.style = options.style || 'minimal';
  }

  /**
   * Generate a visual plan from a description
   * @param {string} description - Natural language description of the UI
   * @returns {Object} Visual plan with layout and components
   */
  generatePlan(description) {
    const components = this.parseDescription(description);
    const layout = this.determineLayout(components);

    return {
      type: 'visual-plan',
      timestamp: new Date().toISOString(),
      layout,
      components,
      mockup: this.generateMockupCode(components),
      styling: this.getStylingGuide(),
    };
  }

  /**
   * Parse description into structured components
   */
  parseDescription(description) {
    const components = [];
    const sentences = description.split(/[,;]|\n/).filter(s => s.trim());

    for (const sentence of sentences) {
      const component = this.extractComponent(sentence.trim());
      if (component) {
        components.push(component);
      }
    }

    return components;
  }

  /**
   * Extract component details from a sentence
   */
  extractComponent(sentence) {
    const lowerSentence = sentence.toLowerCase();

    const componentTypes = [
      { keywords: ['button', 'btn'], type: 'button' },
      { keywords: ['input', 'text field', 'field'], type: 'input' },
      { keywords: ['header', 'heading', 'title'], type: 'header' },
      { keywords: ['nav', 'navigation', 'menu'], type: 'navigation' },
      { keywords: ['card', 'panel', 'container'], type: 'card' },
      { keywords: ['image', 'img', 'photo', 'picture'], type: 'image' },
      { keywords: ['list', 'items', 'array'], type: 'list' },
      { keywords: ['form'], type: 'form' },
      { keywords: ['footer'], type: 'footer' },
      { keywords: ['modal', 'dialog', 'popup'], type: 'modal' },
      { keywords: ['sidebar', 'sidebar'], type: 'sidebar' },
    ];

    for (const { keywords, type } of componentTypes) {
      if (keywords.some(k => lowerSentence.includes(k))) {
        return {
          type,
          label: this.extractLabel(sentence),
          position: this.inferPosition(lowerSentence),
          styles: this.inferStyles(lowerSentence, type),
        };
      }
    }

    return null;
  }

  /**
   * Extract label from component description
   */
  extractLabel(sentence) {
    const patterns = [
      /(?:called|named|labeled|labeled as)\s+["']([^"']+)["']/i,
      /(?:with|showing|displaying)\s+["']([^"']+)["']/i,
      /^(\w+(?:\s+\w+){0,2})/,
    ];

    for (const pattern of patterns) {
      const match = sentence.match(pattern);
      if (match) return match[1];
    }

    return sentence.split(' ').slice(0, 2).join(' ');
  }

  /**
   * Infer position based on keywords
   */
  inferPosition(lowerSentence) {
    if (lowerSentence.includes('top')) return 'top';
    if (lowerSentence.includes('bottom')) return 'bottom';
    if (lowerSentence.includes('left')) return 'left';
    if (lowerSentence.includes('right')) return 'right';
    if (lowerSentence.includes('center')) return 'center';
    return 'auto';
  }

  /**
   * Infer styles from description
   */
  inferStyles(lowerSentence, _type) {
    const styles = {};

    if (lowerSentence.includes('primary')) styles.variant = 'primary';
    else if (lowerSentence.includes('secondary')) styles.variant = 'secondary';

    if (lowerSentence.includes('large') || lowerSentence.includes('big')) {
      styles.size = 'large';
    } else if (lowerSentence.includes('small')) {
      styles.size = 'small';
    }

    if (lowerSentence.includes('rounded')) styles.borderRadius = '12px';
    if (lowerSentence.includes('dark')) styles.backgroundColor = '#333';
    if (lowerSentence.includes('light')) styles.backgroundColor = '#f5f5f5';

    return styles;
  }

  /**
   * Determine layout based on components
   */
  determineLayout(components) {
    const hasNav = components.some(c => c.type === 'navigation');
    const hasSidebar = components.some(c => c.type === 'sidebar');
    const hasHeader = components.some(c => c.type === 'header');

    if (hasSidebar && hasNav) {
      return 'sidebar-layout';
    }
    if (hasHeader && hasNav) {
      return 'app-layout';
    }
    return 'single-page';
  }

  /**
   * Generate mockup code
   */
  generateMockupCode(components) {
    let code = '// Generated UI Mockup\n\n';

    code += 'const UI = () => (\n  <div class="app-container">\n';

    for (const component of components) {
      code += this.generateComponentCode(component, 2);
    }

    code += '  </div>\n);\n';

    return code;
  }

  /**
   * Generate code for a single component
   */
  generateComponentCode(component, indent) {
    const spaces = '  '.repeat(indent);
    const { type, label, styles } = component;

    switch (type) {
      case 'button':
        return `${spaces}<button class="btn ${styles.variant || ''}">${label}</button>\n`;
      case 'input':
        return `${spaces}<input type="text" placeholder="${label}" class="input-field" />\n`;
      case 'header':
        return `${spaces}<h1 class="page-header">${label}</h1>\n`;
      case 'card':
        return `${spaces}<div class="card">\n${spaces}  <h3>${label}</h3>\n${spaces}  <p>Card content...</p>\n${spaces}</div>\n`;
      case 'navigation':
        return `${spaces}<nav class="nav-bar">\n${spaces}  <span>${label}</span>\n${spaces}</nav>\n`;
      default:
        return `${spaces}<div class="${type}">${label}</div>\n`;
    }
  }

  /**
   * Get styling guide based on selected style
   */
  getStylingGuide() {
    const styles = {
      minimal: {
        fontFamily: 'Inter, system-ui, sans-serif',
        spacing: '8px',
        borderRadius: '4px',
        shadows: 'none',
      },
      modern: {
        fontFamily: 'SF Pro, Inter, sans-serif',
        spacing: '16px',
        borderRadius: '12px',
        shadows: '0 4px 12px rgba(0,0,0,0.1)',
      },
      brutalist: {
        fontFamily: 'monospace',
        spacing: '4px',
        borderRadius: '0px',
        shadows: '4px 4px 0 #000',
      },
    };

    return styles[this.style] || styles.minimal;
  }

  /**
   * Generate ASCII mockup visualization
   */
  generateAsciiMockup(components) {
    const lines = [];
    lines.push('┌─────────────────────────────────────┐');
    lines.push('│           UI Mockup                 │');
    lines.push('├─────────────────────────────────────┤');

    for (const comp of components.slice(0, 5)) {
      const label = (comp.label || comp.type).substring(0, 25);
      const padding = ' '.repeat(Math.max(0, 30 - label.length));
      lines.push(`│ [${comp.type.toUpperCase()}] ${label}${padding}│`);
    }

    lines.push('└─────────────────────────────────────┘');
    return lines.join('\n');
  }
}

module.exports = VisualPlansSkill;
