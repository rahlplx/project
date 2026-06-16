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
});
