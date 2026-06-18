const { describe, it } = require('node:test');
const assert = require('node:assert');
const { naturalPhrase, announceSkills, PHRASE_MAP } = require('./natural-phrases');

describe('naturalPhrase', () => {
  it('returns a string for known skill', () => {
    const p = naturalPhrase('vibe-security');
    assert.strictEqual(typeof p, 'string');
    assert.ok(p.length > 0);
  });

  it('returns null for unknown skill', () => {
    assert.strictEqual(naturalPhrase('not-a-skill'), null);
  });

  it('rotates through phrases with index', () => {
    const p0 = naturalPhrase('vibe-tdd', 0);
    const p1 = naturalPhrase('vibe-tdd', 1);
    assert.strictEqual(typeof p0, 'string');
    assert.strictEqual(typeof p1, 'string');
    // Different index may yield different phrase (if multiple exist)
    const phrases = PHRASE_MAP['vibe-tdd'];
    if (phrases.length > 1) assert.notStrictEqual(p0, p1);
  });

  it('wraps index beyond phrase count', () => {
    const phrases = PHRASE_MAP['vibe-security'];
    const p = naturalPhrase('vibe-security', phrases.length);
    assert.strictEqual(p, phrases[0]);
  });
});

describe('announceSkills', () => {
  it('returns null for empty array', () => {
    assert.strictEqual(announceSkills([]), null);
  });

  it('returns single phrase for one skill', () => {
    const p = announceSkills(['vibe-deploy']);
    assert.strictEqual(typeof p, 'string');
    assert.ok(!p.includes(' — then '));
  });

  it('joins multiple skills naturally', () => {
    const p = announceSkills(['vibe-security', 'vibe-tdd']);
    assert.ok(p.includes(' — then '));
  });

  it('filters unknown skills gracefully', () => {
    const p = announceSkills(['unknown-skill', 'vibe-review']);
    assert.strictEqual(typeof p, 'string');
  });

  it('returns null if all skills unknown', () => {
    assert.strictEqual(announceSkills(['x', 'y']), null);
  });
});
