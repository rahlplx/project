const { describe, it } = require('node:test');
const assert = require('node:assert');
const { SkillRouter } = require('./skill-router');

describe('SkillRouter', () => {
  const router = new SkillRouter();

  it('should route auth keywords to security + tdd', () => {
    const r = router.route('add a login page with JWT auth');
    assert.ok(r.skills.includes('vibe-security'));
    assert.ok(r.skills.includes('vibe-tdd'));
  });

  it('should route payment keywords to security + tdd + review', () => {
    const r = router.route('integrate Stripe payment checkout');
    assert.ok(r.skills.includes('vibe-security'));
    assert.ok(r.skills.includes('vibe-tdd'));
    assert.ok(r.skills.includes('vibe-review'));
  });

  it('should route UI keywords to design + tdd', () => {
    const r = router.route('build a landing page with hero section');
    assert.ok(r.skills.includes('vibe-design'));
  });

  it('should route deploy keywords to deploy + security', () => {
    const r = router.route('deploy the app to production');
    assert.ok(r.skills.includes('vibe-deploy'));
  });

  it('should fall back to /vibe with low confidence for unknown intent', () => {
    const r = router.route('do the thing');
    assert.deepStrictEqual(r.skills, ['vibe']);
    assert.ok(r.confidence < 0.5);
  });

  it('should increase confidence when multiple intent signals match', () => {
    const single = router.route('add tests');
    const multi = router.route('add login tests with security review');
    assert.ok(multi.confidence > single.confidence);
  });

  it('should return all routing table entries via getTable()', () => {
    const table = router.getTable();
    assert.ok(table.length > 0);
    assert.ok(table[0].id);
    assert.ok(table[0].skills);
    assert.ok(table[0].reason);
  });
});
