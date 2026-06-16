const AntiSlopSkill = require('../anti-slop');

const COMMANDS = [
  { name: 'craft', description: 'Full shape-then-build flow with visual iteration' },
  { name: 'init', description: 'One-time setup gathering design context (surface type, audience, voice, palette, typography)' },
  { name: 'document', description: 'Generate a DESIGN.md from existing code' },
  { name: 'extract', description: 'Pull reusable components and design tokens out of existing code' },
  { name: 'shape', description: 'Plan UX/UI before writing code' },
  { name: 'critique', description: 'UX design review of hierarchy and resonance' },
  { name: 'audit', description: 'Technical quality checks: accessibility, performance, anti-pattern detectors' },
  { name: 'polish', description: 'Final pass and shipping-readiness check' },
  { name: 'bolder', description: 'Amplify an understated design' },
  { name: 'quieter', description: 'Tone down an overly bold design' },
  { name: 'distill', description: 'Strip a design to its essence' },
  { name: 'harden', description: 'Error handling, i18n, and edge cases' },
  { name: 'onboard', description: 'First-run flows and empty states' },
  { name: 'animate', description: 'Add purposeful motion' },
  { name: 'colorize', description: 'Introduce strategic color' },
  { name: 'typeset', description: 'Fix font choices and type hierarchy' },
  { name: 'layout', description: 'Fix spacing and visual rhythm' },
  { name: 'delight', description: 'Add moments of joy' },
  { name: 'overdrive', description: 'Add extraordinary technical effects' },
  { name: 'clarify', description: 'Improve unclear UX copy' },
  { name: 'adapt', description: 'Adapt for different devices' },
  { name: 'optimize', description: 'Performance improvements' },
  { name: 'live', description: 'Visual variant mode for browser iteration' }
];

const SUPPLEMENTAL_DETECTORS = {
  nestedCards: {
    id: 42,
    category: 'layout',
    name: 'Nested Cards',
    check: (d) => Array.isArray(d.cards) && d.cards.some((c) => Array.isArray(c.cards) && c.cards.length > 0),
    message: 'A card nested inside another card adds visual noise without adding meaning.',
    severity: 'medium',
    fix: 'Flatten nested cards into a single card with internal sections, or use a list instead.'
  },
  bounceEasing: {
    id: 43,
    category: 'motion',
    name: 'Bounce/Elastic Easing',
    pattern: /bounce|elastic|cubic-bezier\(\.?68,\s*-?0?\.6/i,
    message: 'Bounce/elastic easing on UI transitions reads as an AI-generated default, not an intentional choice.',
    severity: 'medium',
    fix: 'Use a standard ease-out/ease-in-out curve unless the bounce is a deliberate brand moment.'
  },
  grayTextOnColor: {
    id: 44,
    category: 'color',
    name: 'Gray Text on Colored Background',
    check: (d) => !!(d.color && d.color.background && d.color.background !== '#ffffff' && d.color.textColor === 'gray'),
    message: 'Gray text loses contrast against a colored background and reads as an unstyled default.',
    severity: 'high',
    fix: 'Use a tinted or full-contrast text color derived from the background, not generic gray.'
  },
  sideTabBorder: {
    id: 45,
    category: 'layout',
    name: 'Side-Tab Border Accent',
    pattern: /border-left.*[3-6]px.*(?:solid|#)/i,
    message: 'A thick colored left border on cards/tabs is a recognizable AI-generated layout tell.',
    severity: 'low',
    fix: 'Use background tint, weight, or spacing to indicate active state instead of a side border.'
  },
  darkGlow: {
    id: 46,
    category: 'color',
    name: 'Dark Glow / Box-Shadow Halo',
    pattern: /box-shadow:.*0\s+0\s+\d{2,3}px.*rgba?\(/i,
    message: 'Large soft glow shadows around elements are an overused AI-generated dark-mode effect.',
    severity: 'low',
    fix: 'Use a smaller, purposeful shadow or remove it; reserve glow effects for genuine focal points.'
  }
};

class ImpeccableAudit {
  constructor() {
    this.name = 'impeccable-audit';
    this.version = '1.0.0';
    this.description = 'Design quality workflow (init/shape/critique/audit/polish + 18 targeted refinement commands) with deterministic anti-pattern detectors, ported from the community impeccable skill.';
    this.antiSlop = new AntiSlopSkill();
  }

  getCommands() {
    return COMMANDS;
  }

  getCommand(name) {
    const found = COMMANDS.find((c) => c.name === name);
    if (!found) {
      return { type: 'error', message: `Unknown impeccable command: ${name}. Valid commands: ${COMMANDS.map((c) => c.name).join(', ')}` };
    }
    return found;
  }

  runInit(answers = {}) {
    const required = ['surfaceType', 'audience', 'voice'];
    const missing = required.filter((k) => !answers[k]);
    if (missing.length) {
      return { type: 'error', message: `init requires: ${missing.join(', ')}` };
    }
    if (!['brand', 'product'].includes(answers.surfaceType)) {
      return { type: 'error', message: "surfaceType must be 'brand' or 'product'" };
    }

    const context = {
      surfaceType: answers.surfaceType,
      audience: answers.audience,
      voice: answers.voice,
      antiReferences: answers.antiReferences || [],
      palette: answers.palette || [],
      typography: answers.typography || null,
      components: answers.components || []
    };

    return { context, markdown: this._renderDesignMd(context) };
  }

  _renderDesignMd(context) {
    let md = '# DESIGN.md\n\n';
    md += `**Surface type**: ${context.surfaceType}\n\n`;
    md += `**Audience**: ${context.audience}\n\n`;
    md += `**Voice**: ${context.voice}\n\n`;
    if (context.antiReferences.length) md += `**Anti-references**: ${context.antiReferences.join(', ')}\n\n`;
    if (context.palette.length) md += `**Palette**: ${context.palette.join(', ')}\n\n`;
    if (context.typography) md += `**Typography**: ${context.typography}\n\n`;
    if (context.components.length) md += `**Components**: ${context.components.join(', ')}\n\n`;
    return md;
  }

  audit(design) {
    const base = this.antiSlop.analyze(design);
    const supplemental = this._runSupplemental(design);

    const violations = [...base.violations, ...supplemental.violations];
    const warnings = [...base.warnings, ...supplemental.warnings];
    const score = Math.max(0, Math.min(100, 100 - violations.length * 15 - warnings.length * 5));

    return {
      passed: violations.length === 0,
      score,
      violations,
      warnings,
      totalIssues: violations.length + warnings.length,
      detectorCount: Object.keys(this.antiSlop.detectors).length + Object.keys(SUPPLEMENTAL_DETECTORS).length
    };
  }

  _runSupplemental(design) {
    const violations = [];
    const warnings = [];
    const serialized = JSON.stringify(design);

    for (const detector of Object.values(SUPPLEMENTAL_DETECTORS)) {
      let detected = false;
      if (detector.pattern) detected = detector.pattern.test(serialized);
      else if (detector.check) detected = !!detector.check(design);

      if (detected) {
        const issue = { id: detector.id, category: detector.category, name: detector.name, message: detector.message, fix: detector.fix, severity: detector.severity };
        if (detector.severity === 'high') violations.push(issue);
        else warnings.push(issue);
      }
    }

    return { violations, warnings };
  }

  critique(design = {}) {
    const findings = [];

    if (!design.hierarchy || design.hierarchy.levels < 2) {
      findings.push({ axis: 'hierarchy', issue: 'No clear visual hierarchy between primary and secondary content.' });
    }
    if (!design.voice || !design.voice.matchesBrand) {
      findings.push({ axis: 'resonance', issue: 'Copy/visual tone does not clearly match the stated brand voice.' });
    }
    if (!design.focalPoint) {
      findings.push({ axis: 'hierarchy', issue: 'No single focal point — everything competes for attention equally.' });
    }
    if (design.genericness && design.genericness > 7) {
      findings.push({ axis: 'resonance', issue: 'Design reads as generic/template-like rather than distinctive.' });
    }

    return {
      passed: findings.length === 0,
      findings,
      summary: findings.length === 0 ? 'Design has clear hierarchy and resonates with the stated voice.' : `${findings.length} critique finding(s).`
    };
  }

  polish(checklist = {}) {
    const items = [
      { id: 'contrast', label: 'All text meets WCAG AA contrast (4.5:1)', passed: !!checklist.contrast },
      { id: 'responsive', label: 'Verified at mobile, tablet, and desktop breakpoints', passed: !!checklist.responsive },
      { id: 'states', label: 'Hover, focus, active, and disabled states defined for interactive elements', passed: !!checklist.states },
      { id: 'emptyStates', label: 'Empty/loading/error states designed, not just the happy path', passed: !!checklist.emptyStates },
      { id: 'reducedMotion', label: 'Animations respect prefers-reduced-motion', passed: !!checklist.reducedMotion }
    ];

    const failed = items.filter((i) => !i.passed);
    return {
      readyToShip: failed.length === 0,
      items,
      blockers: failed.map((i) => i.label)
    };
  }

  toMarkdown() {
    let md = '# Impeccable Audit\n\n';
    md += `${this.description}\n\n`;
    md += '## Commands\n\n';
    for (const c of COMMANDS) md += `- \`/impeccable ${c.name}\` — ${c.description}\n`;
    return md;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description, commands: COMMANDS };
  }
}

module.exports = ImpeccableAudit;
