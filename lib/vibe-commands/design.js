const TasteSkill = require('../../skills/design/taste-skill/index');

const handler = (args, state) => {
  console.log('\n  ═══ /vibe:design — UI Generation & Design Quality ═══\n');

  const ts = new TasteSkill();

  // ── Dial inference from project brief / args ─────────────────
  const briefText = ((args || []).join(' ').trim() || state?.goal || '').toLowerCase();
  const briefObj = briefText ? { vibeWords: briefText.split(/\s+/) } : {};
  const { dials, matchedSignal, usedBaseline } = ts.inferDials(briefObj);

  const bandLabel = (dial, val) => { const b = ts.bandFor(dial, val); return b ? b.label : '—'; };

  console.log('  \x1b[1mTaste-Skill Dials:\x1b[0m');
  console.log(`  DESIGN_VARIANCE:  ${dials.DESIGN_VARIANCE}  (${bandLabel('DESIGN_VARIANCE', dials.DESIGN_VARIANCE)})`);
  console.log(`  MOTION_INTENSITY: ${dials.MOTION_INTENSITY}  (${bandLabel('MOTION_INTENSITY', dials.MOTION_INTENSITY)})`);
  console.log(`  VISUAL_DENSITY:   ${dials.VISUAL_DENSITY}  (${bandLabel('VISUAL_DENSITY', dials.VISUAL_DENSITY)})`);
  if (usedBaseline) console.log('  \x1b[2m(baseline — no vibe-word signal detected in brief)\x1b[0m');
  if (matchedSignal) console.log(`  \x1b[2mMatched signal: "${matchedSignal}"\x1b[0m`);

  // ── Pre-flight hard rules ────────────────────────────────────
  console.log('\n  \x1b[1mPre-flight hard rules (call before shipping any UI):\x1b[0m');
  console.log('    TasteSkill.preflightCheck(designContent) enforces:');
  console.log('    ○ No em-dash in copy (—)');
  console.log('    ○ No duplicate CTA intent (e.g. "Get Started" + "Start Now" on same page)');
  console.log('    ○ Hero section discipline (one clear headline, one CTA max)');
  console.log('    ○ Eyebrow restraint (≤ 2 eyebrows per page)');
  console.log('    ○ Pure black/white ban (#000000 / #ffffff — use near-black/near-white)');
  console.log('    ○ Marquee max-one-per-page');

  // ── Pipeline guidance ────────────────────────────────────────
  console.log('\n  \x1b[1mUI Pipeline:\x1b[0m');
  console.log('  1. Run /vibe-design dials to confirm taste settings');
  console.log('  2. Generate UI screens (Stitch MCP or Figma)');
  console.log('  3. Run /vibe-design audit on generated code');
  console.log('  4. Call TasteSkill.preflightCheck(copy) before final review');
  console.log('  5. Approve and hand off to build phase');

  console.log('\n  \x1b[2mRequires has_ui=true in stack. Dials auto-inferred from project goal.\x1b[0m\n');

  return { status: 'reference', dials, matchedSignal };
};

module.exports = { handler };
