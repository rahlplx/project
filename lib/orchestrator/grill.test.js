const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { Grill } = require('./grill');

describe('Grill', () => {
  let grill;

  beforeEach(() => {
    grill = new Grill();
  });

  it('should flag a short request as needing grilling', () => {
    assert.strictEqual(grill.needsGrilling('fix it'), true);
  });

  it('should flag a vague request even if long enough', () => {
    assert.strictEqual(grill.needsGrilling('please make this website nicer for everyone visiting it'), true);
  });

  it('should not flag a specific, well-scoped request', () => {
    const request = 'Add a "forgot password" link below the login form that emails a reset token to the user';
    assert.strictEqual(grill.needsGrilling(request), false);
  });

  it('should generate scope and success-criteria questions for a vague build request', () => {
    const questions = grill.generateQuestions('build an app that helps people');
    assert.ok(questions.length > 0);
  });

  it('should fall back to generic questions when nothing specific matched but still short', () => {
    const questions = grill.generateQuestions('go');
    assert.strictEqual(questions.length, 2);
  });

  it('should return no questions for a clear request', () => {
    const request = 'Add a "forgot password" link below the login form that emails a reset token to the user';
    assert.deepStrictEqual(grill.generateQuestions(request), []);
  });

  it('grill() should bundle needsGrilling and questions together', () => {
    const result = grill.grill('fix it');
    assert.strictEqual(result.needsGrilling, true);
    assert.ok(result.questions.length > 0);
  });

  it('grill() should return empty questions when no grilling needed', () => {
    const request = 'Add a "forgot password" link below the login form that emails a reset token to the user';
    const result = grill.grill(request);
    assert.strictEqual(result.needsGrilling, false);
    assert.deepStrictEqual(result.questions, []);
  });
});
