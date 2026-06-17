const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { SubagentDispatch } = require('./subagent-dispatch');

describe('SubagentDispatch', () => {
  let subagentDispatch;

  beforeEach(() => {
    subagentDispatch = new SubagentDispatch();
  });

  it('should initialize with empty subagents', () => {
    assert.strictEqual(subagentDispatch.subagents.size, 0);
    assert.strictEqual(subagentDispatch.timeouts.size, 0);
  });

  it('should create subagent', () => {
    const task = { id: 'task-1', description: 'Test task' };
    const context = { task: 'Test task', files: ['file1.js'] };

    const subagent = subagentDispatch.create(task, context);
    assert.ok('id' in subagent);
    assert.ok('task' in subagent);
    assert.ok('context' in subagent);
    assert.strictEqual(subagent.status, 'pending');
  });

  it('should generate unique ID', () => {
    const id1 = subagentDispatch.generateId();
    const id2 = subagentDispatch.generateId();
    assert.notStrictEqual(id1, id2);
  });

  it('should isolate context', () => {
    const context = {
      task: 'Test task',
      files: ['file1.js'],
      constraints: ['constraint1'],
      history: ['history1'],
      state: { step: 1 },
    };

    const isolated = subagentDispatch.isolateContext(context);
    assert.ok('task' in isolated);
    assert.ok('files' in isolated);
    assert.ok('constraints' in isolated);
    assert.deepStrictEqual(isolated.history, []);
    assert.strictEqual(isolated.state, null);
  });

  it('should build non-interactive prompt', () => {
    const prompt = 'Test prompt';
    const agent = 'opencode';

    const fullPrompt = subagentDispatch.buildNonInteractivePrompt(prompt, agent);
    assert.strictEqual(typeof fullPrompt, 'string');
    assert.ok(fullPrompt.includes('NON-INTERACTIVE MODE'));
    assert.ok(fullPrompt.includes('Test prompt'));
    assert.ok(fullPrompt.includes('--no-input'));
  });

  it('should dispatch subagent', async () => {
    const task = { id: 'task-1', description: 'Test task' };
    const context = { task: 'Test task', files: ['file1.js'] };
    const subagent = subagentDispatch.create(task, context);

    const result = await subagentDispatch.dispatch(subagent, 'Test prompt');
    assert.ok('success' in result);
    assert.ok('output' in result);
  });

  it('should collect results', () => {
    const task = { id: 'task-1', description: 'Test task' };
    const context = { task: 'Test task', files: ['file1.js'] };
    const subagent = subagentDispatch.create(task, context);

    const results = subagentDispatch.collect(subagent.id);
    assert.ok('id' in results);
    assert.ok('task' in results);
    assert.ok('status' in results);
  });

  it('should get all subagents', () => {
    const task = { id: 'task-1', description: 'Test task' };
    const context = { task: 'Test task', files: ['file1.js'] };
    subagentDispatch.create(task, context);

    const all = subagentDispatch.getAll();
    assert.ok(Array.isArray(all));
    assert.strictEqual(all.length, 1);
  });

  it('should get subagent by ID', () => {
    const task = { id: 'task-1', description: 'Test task' };
    const context = { task: 'Test task', files: ['file1.js'] };
    const subagent = subagentDispatch.create(task, context);

    const found = subagentDispatch.get(subagent.id);
    assert.strictEqual(found.id, subagent.id);
  });

  it('should cancel subagent', () => {
    const task = { id: 'task-1', description: 'Test task' };
    const context = { task: 'Test task', files: ['file1.js'] };
    const subagent = subagentDispatch.create(task, context);
    subagent.status = 'running';

    const cancelled = subagentDispatch.cancel(subagent.id);
    assert.strictEqual(cancelled, true);
  });

  it('should reset all subagents', () => {
    const task = { id: 'task-1', description: 'Test task' };
    const context = { task: 'Test task', files: ['file1.js'] };
    subagentDispatch.create(task, context);

    subagentDispatch.reset();
    assert.strictEqual(subagentDispatch.subagents.size, 0);
    assert.strictEqual(subagentDispatch.timeouts.size, 0);
  });
});
