const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ContextManager } = require('./context-manager');

describe('ContextManager', () => {
  let contextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  it('should initialize with empty context stack', () => {
    assert.deepStrictEqual(contextManager.contextStack, []);
    assert.strictEqual(contextManager.currentContext, null);
  });

  it('should push context', () => {
    const context = { task: 'test', files: ['file1.js'] };
    contextManager.pushContext(context);

    assert.deepStrictEqual(contextManager.currentContext, context);
    assert.strictEqual(contextManager.contextStack.length, 1);
  });

  it('should pop context', () => {
    const context1 = { task: 'test1' };
    const context2 = { task: 'test2' };

    contextManager.pushContext(context1);
    contextManager.pushContext(context2);

    const popped = contextManager.popContext();
    assert.deepStrictEqual(popped, context1);
    assert.deepStrictEqual(contextManager.currentContext, context1);
  });

  it('should get current context', () => {
    const context = { task: 'test' };
    contextManager.pushContext(context);

    assert.deepStrictEqual(contextManager.getCurrentContext(), context);
  });

  it('should reset context', () => {
    contextManager.pushContext({ task: 'test' });
    contextManager.resetContext();

    assert.deepStrictEqual(contextManager.contextStack, []);
    assert.strictEqual(contextManager.currentContext, null);
  });

  it('should get iron laws', () => {
    const laws = contextManager.getIronLaws();
    assert.ok(Array.isArray(laws));
    assert.ok(laws.length > 0);
    assert.ok(laws[0].includes('CONTEXT HYGIENE'));
  });

  it('should get next steps for phase', () => {
    const nextSteps = contextManager.getNextSteps('think');
    assert.ok(Array.isArray(nextSteps));
    assert.ok(nextSteps.length > 0);
    assert.ok(nextSteps[0].includes('plan'));
  });

  it('should list artifacts for phase', () => {
    const artifacts = contextManager.listArtifacts('think');
    assert.ok(Array.isArray(artifacts));
  });

  it('should format handoff', () => {
    const handoff = {
      from: 'think',
      to: 'plan',
      timestamp: new Date().toISOString(),
      context: 'Test context',
      artifacts: ['file1.js'],
      nextSteps: ['Run /vibe:plan'],
      ironLaws: ['Context hygiene']
    };

    const formatted = contextManager.formatHandoff(handoff);
    assert.strictEqual(typeof formatted, 'string');
    assert.ok(formatted.includes('think'));
    assert.ok(formatted.includes('plan'));
  });

  it('parseHandoff round-trip preserves artifacts, nextSteps, and ironLaws', () => {
    const original = {
      from: 'build',
      to: 'harness',
      timestamp: new Date().toISOString(),
      context: 'Built the feature',
      artifacts: ['lib/foo.js', 'lib/bar.js'],
      nextSteps: ['Run /vibe:harness'],
      ironLaws: ['EVIDENCE BEFORE CLAIMING DONE', 'COMPLETENESS OVER SPEED']
    };

    const formatted = contextManager.formatHandoff(original);
    const parsed = contextManager.parseHandoff(formatted);

    assert.deepStrictEqual(parsed.artifacts, original.artifacts);
    assert.deepStrictEqual(parsed.nextSteps, original.nextSteps);
    assert.deepStrictEqual(parsed.ironLaws, original.ironLaws);
    assert.strictEqual(parsed.from, original.from);
    assert.strictEqual(parsed.to, original.to);
  });

  it('parseHandoff does not route nextSteps items into artifacts', () => {
    const original = {
      from: 'harness',
      to: 'review',
      timestamp: new Date().toISOString(),
      context: 'Harness passed',
      artifacts: ['only-artifact.js'],
      nextSteps: ['Run /vibe:review for code review'],
      ironLaws: ['SYSTEMATIC DEBUGGING']
    };

    const parsed = contextManager.parseHandoff(contextManager.formatHandoff(original));
    assert.strictEqual(parsed.artifacts.length, 1);
    assert.strictEqual(parsed.nextSteps.length, 1);
    assert.strictEqual(parsed.ironLaws.length, 1);
    assert.ok(!parsed.artifacts.some(a => a.includes('review')));
  });
});
