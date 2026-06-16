const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { TDDWorkflow } = require('./tdd-workflow');

describe('TDDWorkflow', () => {
  let tddWorkflow;

  beforeEach(() => {
    tddWorkflow = new TDDWorkflow();
  });

  it('should initialize with empty task history', () => {
    assert.deepStrictEqual(tddWorkflow.taskHistory, []);
    assert.strictEqual(tddWorkflow.currentPhase, null);
  });

  it('should build prompt for red phase', () => {
    const task = {
      id: 'task-1',
      description: 'Test task',
      testPath: 'test.js',
      implementationPath: 'impl.js'
    };

    const prompt = tddWorkflow.buildPrompt(task, 'red');
    assert.strictEqual(typeof prompt, 'string');
    assert.ok(prompt.includes('RED'));
    assert.ok(prompt.includes('Test task'));
  });

  it('should build prompt for green phase', () => {
    const task = {
      id: 'task-1',
      description: 'Test task',
      testPath: 'test.js',
      implementationPath: 'impl.js'
    };

    const prompt = tddWorkflow.buildPrompt(task, 'green');
    assert.strictEqual(typeof prompt, 'string');
    assert.ok(prompt.includes('GREEN'));
    assert.ok(prompt.includes('Test task'));
  });

  it('should build prompt for refactor phase', () => {
    const task = {
      id: 'task-1',
      description: 'Test task',
      testPath: 'test.js',
      implementationPath: 'impl.js'
    };

    const prompt = tddWorkflow.buildPrompt(task, 'refactor');
    assert.strictEqual(typeof prompt, 'string');
    assert.ok(prompt.includes('REFACTOR'));
    assert.ok(prompt.includes('Test task'));
  });

  it('should execute phase', async () => {
    const task = {
      id: 'task-1',
      description: 'Test task',
      testPath: 'test.js',
      implementationPath: 'impl.js'
    };

    const result = await tddWorkflow.executePhase(task, 'red');
    assert.ok('prompt' in result);
    assert.strictEqual(result.phase, 'red');
    assert.deepStrictEqual(result.task, task);
  });

  it('should verify phase', async () => {
    const task = {
      id: 'task-1',
      description: 'Test task',
      testPath: 'test.js',
      implementationPath: 'impl.js'
    };

    const verification = await tddWorkflow.verifyPhase(task, 'red');
    assert.ok('passed' in verification);
    assert.ok('message' in verification);
  });

  it('should execute full cycle', async () => {
    const task = {
      id: 'task-1',
      description: 'Test task',
      testPath: 'test.js',
      implementationPath: 'impl.js'
    };

    const results = await tddWorkflow.executeCycle(task);
    assert.ok(Array.isArray(results));
    assert.ok(results.length > 0);
  });

  it('should get task history', () => {
    const history = tddWorkflow.getTaskHistory();
    assert.ok(Array.isArray(history));
  });

  it('should get current phase', () => {
    const phase = tddWorkflow.getCurrentPhase();
    assert.strictEqual(phase, null);
  });

  it('should reset workflow', () => {
    tddWorkflow.reset();
    assert.deepStrictEqual(tddWorkflow.taskHistory, []);
    assert.strictEqual(tddWorkflow.currentPhase, null);
  });
});
