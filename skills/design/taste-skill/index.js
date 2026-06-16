/**
 * Taste-Skill
 *
 * Faithful port of Leonxlnx/taste-skill (https://github.com/Leonxlnx/taste-skill) —
 * three design dials, brief-inference workflow, and the deterministic, hard-rule
 * subset of its anti-slop engineering checks (em-dash ban, duplicate-CTA-intent,
 * hero/eyebrow discipline). Composes with the existing anti-slop skill for the
 * color/typography/layout rules it already covers rather than duplicating them.
 */

const DIALS = {
  DESIGN_VARIANCE: {
    description: 'Controls layout asymmetry and compositional risk',
    bands: [
      { range: [1, 3], label: 'Predictable', detail: 'Symmetrical grids, equal padding, centered alignment' },
      { range: [4, 7], label: 'Offset', detail: 'Varied aspect ratios, margin overlaps, left-aligned headers' },
      { range: [8, 10], label: 'Asymmetric', detail: 'Masonry, fractional grid units, massive empty zones' }
    ]
  },
  MOTION_INTENSITY: {
    description: 'Controls animation scope and sophistication',
    bands: [
      { range: [1, 3], label: 'Static', detail: 'No auto-animations; hover/active states only' },
      { range: [4, 7], label: 'Fluid CSS', detail: 'Transitions, cascading delays, transform-focused movement' },
      { range: [8, 10], label: 'Advanced Choreography', detail: 'Scroll-triggered reveals, parallax, hijacks' }
    ]
  },
  VISUAL_DENSITY: {
    description: 'Controls spacing and information packing',
    bands: [
      { range: [1, 3], label: 'Art Gallery', detail: 'Massive white space, large section gaps (py-32 to py-48)' },
      { range: [4, 7], label: 'Daily App', detail: 'Standard app spacing (py-16 to py-24)' },
      { range: [8, 10], label: 'Cockpit', detail: 'Tight padding, 1px dividers, mono numerals throughout' }
    ]
  }
};

const BASELINE = { DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6, VISUAL_DENSITY: 4 };

// gstack-style signal -> dial nudge table, vibe words drawn from the brief.
const SIGNAL_TABLE = [
  { words: ['minimalist', 'apple-like', 'clean'], DESIGN_VARIANCE: 3, MOTION_INTENSITY: 2, VISUAL_DENSITY: 2 },
  { words: ['awwwards', 'editorial', 'magazine'], DESIGN_VARIANCE: 6, MOTION_INTENSITY: 4, VISUAL_DENSITY: 4 },
  { words: ['linear-style', 'saas', 'dashboard'], DESIGN_VARIANCE: 4, MOTION_INTENSITY: 3, VISUAL_DENSITY: 7 },
  { words: ['brutalist', 'unconventional', 'bold'], DESIGN_VARIANCE: 9, MOTION_INTENSITY: 5, VISUAL_DENSITY: 6 },
  { words: ['cockpit', 'data-dense', 'analytics'], DESIGN_VARIANCE: 4, MOTION_INTENSITY: 2, VISUAL_DENSITY: 9 }
];

// Near-duplicate CTA intents (Pre-Flight Fail: "NO DUPLICATE CTA INTENT").
const CTA_INTENT_GROUPS = [
  ['get in touch', 'contact us', 'reach out', 'talk to us'],
  ['get started', 'start now', 'begin', 'try it now'],
  ['learn more', 'find out more', 'discover more'],
  ['sign up', 'join now', 'create account', 'register']
];

class TasteSkill {
  constructor() {
    this.name = 'taste-skill';
    this.version = '1.0.0';
    this.description = 'Three-dial design taste enforcement with em-dash and duplicate-CTA-intent bans, ported from Leonxlnx/taste-skill.';
    this.dials = DIALS;
    this.baseline = BASELINE;
  }

  getDial(name) {
    return DIALS[name] || null;
  }

  bandFor(name, value) {
    const dial = DIALS[name];
    if (!dial) return null;
    const band = dial.bands.find((b) => value >= b.range[0] && value <= b.range[1]);
    return band || null;
  }

  /**
   * Infer dial values from a structured brief (vibeWords drive the signal table;
   * unmatched briefs fall back to baseline rather than guessing).
   */
  inferDials(brief = {}) {
    const vibeWords = (brief.vibeWords || []).map((w) => w.toLowerCase());
    const matched = SIGNAL_TABLE.find((row) => row.words.some((w) => vibeWords.includes(w)));

    const dials = matched
      ? { DESIGN_VARIANCE: matched.DESIGN_VARIANCE, MOTION_INTENSITY: matched.MOTION_INTENSITY, VISUAL_DENSITY: matched.VISUAL_DENSITY }
      : { ...BASELINE };

    return { dials, matchedSignal: matched ? matched.words[0] : null, usedBaseline: !matched };
  }

  /**
   * "Output one-line design read" — gstack/taste-skill Brief Inference Workflow step 2.
   */
  describeBriefRead(brief = {}) {
    const { dials } = this.inferDials(brief);
    const pageKind = brief.pageKind || 'page';
    const audience = brief.audience || 'a general audience';
    const vibe = (brief.vibeWords || [])[0] || 'an unspecified';
    const variance = this.bandFor('DESIGN_VARIANCE', dials.DESIGN_VARIANCE);
    return `Reading this as: ${pageKind} for ${audience}, with a ${vibe} language, leaning toward ${variance ? variance.label.toLowerCase() : 'baseline'}.`;
  }

  /**
   * Em-Dash Ban (Section 9.G) — "the single most-violated AI Tell."
   */
  checkEmDash(text = '') {
    const matches = [...String(text).matchAll(/[—–]/g)];
    return { violation: matches.length > 0, count: matches.length };
  }

  /**
   * NO DUPLICATE CTA INTENT — two CTAs with the same intent on one page is a Pre-Flight Fail.
   */
  checkDuplicateCTAIntent(ctas = []) {
    const normalized = ctas.map((c) => c.toLowerCase().trim());
    const violations = [];

    for (const group of CTA_INTENT_GROUPS) {
      const hits = normalized.filter((cta) => group.includes(cta));
      if (hits.length > 1) violations.push({ intent: group[0], duplicates: hits });
    }

    return { violation: violations.length > 0, violations };
  }

  /**
   * Hero discipline (Section 4): viewport fit, top-padding cap, max 4 stack elements.
   */
  checkHeroDiscipline(hero = {}) {
    const issues = [];
    if ((hero.headlineLines || 1) > 2) issues.push('Headline exceeds 2 lines.');
    if ((hero.subtextWords || 0) > 20) issues.push('Subtext exceeds 20 words.');
    if (hero.topPaddingRem !== undefined && hero.topPaddingRem > 6) issues.push('Top padding exceeds pt-24 (6rem) cap.');
    if ((hero.stackElements || 0) > 4) issues.push('Hero stack exceeds 4 text elements (eyebrow, headline, subtext, CTAs).');
    if (hero.ctaVisible === false) issues.push('CTA is not visible without scrolling.');

    return { passed: issues.length === 0, issues };
  }

  /**
   * EYEBROW RESTRAINT — max 1 eyebrow per 3 sections.
   */
  checkEyebrowRestraint(eyebrowCount = 0, sectionCount = 0) {
    const max = Math.ceil(sectionCount / 3);
    return { passed: eyebrowCount <= max, eyebrowCount, max };
  }

  /**
   * Pure black/white ban — use off-black/off-white instead.
   */
  checkPureBlackWhite(colors = []) {
    const violations = colors.filter((c) => /^#(000000|ffffff)$/i.test(c));
    return { violation: violations.length > 0, violations };
  }

  /**
   * MARQUEE MAX-ONE-PER-PAGE.
   */
  checkMarqueeCount(marqueeCount = 0) {
    return { passed: marqueeCount <= 1, marqueeCount };
  }

  /**
   * Aggregate Pre-Flight Check across the deterministic hard rules above.
   * Non-exhaustive vs. the real 80+ checklist — covers the checks that are
   * mechanically verifiable without a human aesthetic judgment call.
   */
  preflightCheck(design = {}) {
    const findings = [];

    const emDash = this.checkEmDash(design.copyText);
    if (emDash.violation) findings.push({ rule: 'em-dash-ban', severity: 'critical', message: `Found ${emDash.count} em-dash/en-dash character(s). Restructure with period, comma, or colon.` });

    const ctaIntent = this.checkDuplicateCTAIntent(design.ctas);
    if (ctaIntent.violation) findings.push({ rule: 'duplicate-cta-intent', severity: 'critical', message: 'Two or more CTAs share the same intent.' });

    const hero = this.checkHeroDiscipline(design.hero);
    if (!hero.passed) findings.push({ rule: 'hero-discipline', severity: 'high', message: hero.issues.join(' ') });

    const eyebrow = this.checkEyebrowRestraint(design.eyebrowCount, design.sectionCount);
    if (!eyebrow.passed) findings.push({ rule: 'eyebrow-restraint', severity: 'medium', message: `${eyebrow.eyebrowCount} eyebrows exceeds max of ${eyebrow.max} for ${design.sectionCount || 0} sections.` });

    const blackWhite = this.checkPureBlackWhite(design.colors);
    if (blackWhite.violation) findings.push({ rule: 'pure-black-white-ban', severity: 'medium', message: 'Use off-black/off-white instead of pure #000000/#ffffff.' });

    const marquee = this.checkMarqueeCount(design.marqueeCount);
    if (!marquee.passed) findings.push({ rule: 'marquee-max-one', severity: 'low', message: `${marquee.marqueeCount} marquees found; max one per page.` });

    return { passed: findings.length === 0, findings };
  }

  getDials() {
    return DIALS;
  }

  getBaseline() {
    return { ...BASELINE };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description, dials: Object.keys(DIALS), baseline: BASELINE };
  }
}

module.exports = TasteSkill;
