/**
 * Design Audit System
 * Implements design audit from impeccable
 */

const fs = require('fs');
const path = require('path');

class DesignAudit {
  constructor() {
    this.antiPatterns = [
      'generic-layouts',
      'placeholder-content',
      'ai-slop',
      'poor-typography',
      'bad-color-contrast',
      'overly-complex',
      'lack-of-personality',
      'poor-accessibility',
      'slow-performance',
      'inconsistent-design'
    ];

    this.auditHistory = [];
  }

  /**
   * Run full design audit
   */
  async audit(design) {
    const audit = {
      timestamp: new Date().toISOString(),
      design: design,
      antiPatterns: this.detectAntiPatterns(design),
      scoring: this.scoreDesign(design),
      improvements: this.suggestImprovements(design),
      report: this.generateReport(design)
    };

    this.auditHistory.push(audit);
    return audit;
  }

  /**
   * Detect anti-patterns
   */
  detectAntiPatterns(design) {
    const detected = [];

    for (const pattern of this.antiPatterns) {
      if (this.detectPattern(design, pattern)) {
        detected.push({
          pattern: pattern,
          severity: this.getSeverity(pattern),
          description: this.getPatternDescription(pattern),
          solution: this.getPatternSolution(pattern)
        });
      }
    }

    return detected;
  }

  /**
   * Detect specific pattern
   */
  detectPattern(design, pattern) {
    const detectors = {
      'generic-layouts': (d) => d.layout && d.layout.includes('grid'),
      'placeholder-content': (d) => d.content && d.content.includes('lorem'),
      'ai-slop': (d) => d.style && d.style.includes('gradient'),
      'poor-typography': (d) => d.typography && d.typography.fontSize < 16,
      'bad-color-contrast': (d) => d.color && d.color.contrast < 4.5,
      'overly-complex': (d) => d.components && d.components.length > 10,
      'lack-of-personality': (d) => d.branding && !d.branding.personalized,
      'poor-accessibility': (d) => d.accessibility && d.accessibility.score < 7,
      'slow-performance': (d) => d.performance && d.performance.loadTime > 3,
      'inconsistent-design': (d) => d.consistency && d.consistency.score < 8
    };

    return detectors[pattern] ? detectors[pattern](design) : false;
  }

  /**
   * Get severity level
   */
  getSeverity(pattern) {
    const severities = {
      'generic-layouts': 'medium',
      'placeholder-content': 'high',
      'ai-slop': 'high',
      'poor-typography': 'medium',
      'bad-color-contrast': 'high',
      'overly-complex': 'medium',
      'lack-of-personality': 'medium',
      'poor-accessibility': 'high',
      'slow-performance': 'high',
      'inconsistent-design': 'medium'
    };

    return severities[pattern] || 'low';
  }

  /**
   * Get pattern description
   */
  getPatternDescription(pattern) {
    const descriptions = {
      'generic-layouts': 'Layout uses common grid patterns without unique styling',
      'placeholder-content': 'Content includes placeholder text like lorem ipsum',
      'ai-slop': 'Design uses obvious AI-generated patterns like gradients',
      'poor-typography': 'Font size is too small for comfortable reading',
      'bad-color-contrast': 'Color contrast does not meet accessibility standards',
      'overly-complex': 'Design has too many components creating cognitive overload',
      'lack-of-personality': 'Design lacks unique branding and personality',
      'poor-accessibility': 'Design does not meet accessibility standards',
      'slow-performance': 'Design has performance issues affecting user experience',
      'inconsistent-design': 'Design elements are not consistent across the interface'
    };

    return descriptions[pattern] || 'Unknown pattern';
  }

  /**
   * Get pattern solution
   */
  getPatternSolution(pattern) {
    const solutions = {
      'generic-layouts': 'Use unique layout patterns that reflect brand identity',
      'placeholder-content': 'Use real content that represents actual user data',
      'ai-slop': 'Add unique styling elements and avoid generic AI patterns',
      'poor-typography': 'Increase font size to at least 16px for body text',
      'bad-color-contrast': 'Use tools to check contrast ratios and adjust colors',
      'overly-complex': 'Simplify design by reducing number of components',
      'lack-of-personality': 'Add unique branding elements and personality',
      'poor-accessibility': 'Implement ARIA labels and keyboard navigation',
      'slow-performance': 'Optimize images and reduce bundle size',
      'inconsistent-design': 'Create and follow a design system'
    };

    return solutions[pattern] || 'No solution available';
  }

  /**
   * Score design
   */
  scoreDesign(design) {
    return {
      typography: this.scoreTypography(design),
      color: this.scoreColor(design),
      layout: this.scoreLayout(design),
      accessibility: this.scoreAccessibility(design),
      performance: this.scorePerformance(design),
      overall: this.calculateOverallScore(design)
    };
  }

  /**
   * Score typography
   */
  scoreTypography(design) {
    let score = 10;
    const issues = [];

    if (design.typography) {
      if (design.typography.fontSize < 16) {
        score -= 2;
        issues.push('Font size too small');
      }
      if (design.typography.lineHeight < 1.5) {
        score -= 1;
        issues.push('Line height too tight');
      }
      if (!design.typography.fontFamily) {
        score -= 1;
        issues.push('No font family specified');
      }
    }

    return {
      score: Math.max(0, score),
      maxScore: 10,
      issues: issues,
      suggestions: this.getTypographySuggestions(issues)
    };
  }

  /**
   * Get typography suggestions
   */
  getTypographySuggestions(issues) {
    const suggestions = [];

    if (issues.includes('Font size too small')) {
      suggestions.push('Increase font size to at least 16px');
    }
    if (issues.includes('Line height too tight')) {
      suggestions.push('Set line height to 1.5 or greater');
    }
    if (issues.includes('No font family specified')) {
      suggestions.push('Choose a readable font family');
    }

    return suggestions;
  }

  /**
   * Score color
   */
  scoreColor(design) {
    let score = 10;
    const issues = [];

    if (design.color) {
      if (design.color.contrast < 4.5) {
        score -= 3;
        issues.push('Color contrast too low');
      }
      if (design.color.colors && design.color.colors.length > 5) {
        score -= 1;
        issues.push('Too many colors');
      }
    }

    return {
      score: Math.max(0, score),
      maxScore: 10,
      issues: issues,
      suggestions: this.getColorSuggestions(issues)
    };
  }

  /**
   * Get color suggestions
   */
  getColorSuggestions(issues) {
    const suggestions = [];

    if (issues.includes('Color contrast too low')) {
      suggestions.push('Increase contrast ratio to at least 4.5');
    }
    if (issues.includes('Too many colors')) {
      suggestions.push('Limit color palette to 3-5 colors');
    }

    return suggestions;
  }

  /**
   * Score layout
   */
  scoreLayout(design) {
    let score = 10;
    const issues = [];

    if (design.layout) {
      if (design.components && design.components.length > 10) {
        score -= 2;
        issues.push('Too many components');
      }
      if (!design.whiteSpace || design.whiteSpace < 16) {
        score -= 1;
        issues.push('Insufficient white space');
      }
    }

    return {
      score: Math.max(0, score),
      maxScore: 10,
      issues: issues,
      suggestions: this.getLayoutSuggestions(issues)
    };
  }

  /**
   * Get layout suggestions
   */
  getLayoutSuggestions(issues) {
    const suggestions = [];

    if (issues.includes('Too many components')) {
      suggestions.push('Reduce number of components on screen');
    }
    if (issues.includes('Insufficient white space')) {
      suggestions.push('Add more padding and margins');
    }

    return suggestions;
  }

  /**
   * Score accessibility
   */
  scoreAccessibility(design) {
    let score = 10;
    const issues = [];

    if (design.accessibility) {
      if (!design.accessibility.ariaLabels) {
        score -= 2;
        issues.push('Missing ARIA labels');
      }
      if (!design.accessibility.keyboardNavigation) {
        score -= 2;
        issues.push('No keyboard navigation');
      }
      if (design.accessibility.score && design.accessibility.score < 7) {
        score -= 1;
        issues.push('Low accessibility score');
      }
    }

    return {
      score: Math.max(0, score),
      maxScore: 10,
      issues: issues,
      suggestions: this.getAccessibilitySuggestions(issues)
    };
  }

  /**
   * Get accessibility suggestions
   */
  getAccessibilitySuggestions(issues) {
    const suggestions = [];

    if (issues.includes('Missing ARIA labels')) {
      suggestions.push('Add ARIA labels to interactive elements');
    }
    if (issues.includes('No keyboard navigation')) {
      suggestions.push('Implement keyboard navigation support');
    }
    if (issues.includes('Low accessibility score')) {
      suggestions.push('Use accessibility testing tools');
    }

    return suggestions;
  }

  /**
   * Score performance
   */
  scorePerformance(design) {
    let score = 10;
    const issues = [];

    if (design.performance) {
      if (design.performance.loadTime && design.performance.loadTime > 3) {
        score -= 3;
        issues.push('Slow load time');
      }
      if (design.performance.imageSize && design.performance.imageSize > 1000000) {
        score -= 2;
        issues.push('Large image sizes');
      }
    }

    return {
      score: Math.max(0, score),
      maxScore: 10,
      issues: issues,
      suggestions: this.getPerformanceSuggestions(issues)
    };
  }

  /**
   * Get performance suggestions
   */
  getPerformanceSuggestions(issues) {
    const suggestions = [];

    if (issues.includes('Slow load time')) {
      suggestions.push('Optimize images and reduce bundle size');
    }
    if (issues.includes('Large image sizes')) {
      suggestions.push('Compress images and use modern formats');
    }

    return suggestions;
  }

  /**
   * Calculate overall score
   */
  calculateOverallScore(design) {
    const scores = [
      this.scoreTypography(design).score,
      this.scoreColor(design).score,
      this.scoreLayout(design).score,
      this.scoreAccessibility(design).score,
      this.scorePerformance(design).score
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * Suggest improvements
   */
  suggestImprovements(design) {
    const improvements = [];

    const antiPatterns = this.detectAntiPatterns(design);
    for (const pattern of antiPatterns) {
      improvements.push({
        issue: pattern.description,
        solution: pattern.solution,
        priority: pattern.severity === 'high' ? 'high' : 'medium'
      });
    }

    return improvements;
  }

  /**
   * Generate report
   */
  generateReport(design) {
    const antiPatterns = this.detectAntiPatterns(design);
    const scoring = this.scoreDesign(design);

    return {
      summary: {
        antiPatternsFound: antiPatterns.length,
        overallScore: scoring.overall,
        highSeverity: antiPatterns.filter(p => p.severity === 'high').length,
        mediumSeverity: antiPatterns.filter(p => p.severity === 'medium').length
      },
      details: {
        antiPatterns: antiPatterns,
        scoring: scoring
      },
      recommendations: this.suggestImprovements(design)
    };
  }

  /**
   * Get audit history
   */
  getAuditHistory() {
    return this.auditHistory;
  }

  /**
   * Get latest audit
   */
  getLatestAudit() {
    return this.auditHistory[this.auditHistory.length - 1];
  }
}

module.exports = { DesignAudit };
