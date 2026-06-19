const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ToolRegistry } = require('./tool-registry');

describe('ToolRegistry', () => {
  let reg;

  beforeEach(() => {
    reg = new ToolRegistry();
  });

  it('registers a tool', () => {
    reg.register('test-tool', { category: 'test', description: 'A test tool' });
    const all = reg.findAll();
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].name, 'test-tool');
  });

  it('findUsable returns only tools where isUsable returns true', async () => {
    reg.register('tool-a', { category: 'deploy', isUsable: () => true });
    reg.register('tool-b', { category: 'deploy', isUsable: () => false });
    reg.register('tool-c', { category: 'deploy', isUsable: () => true });

    const usable = await reg.findUsable('deploy');
    assert.strictEqual(usable.length, 2);
    assert.ok(usable.every(t => t.isUsable));
  });

  it('getUnusable returns only tools where isUsable returns false with reason', async () => {
    reg.register('tool-a', { category: 'deploy', isUsable: () => true });
    reg.register('tool-b', {
      category: 'deploy',
      isUsable: () => ({ usable: false, reason: 'Git not installed' }),
    });

    const unusable = await reg.getUnusable('deploy');
    assert.strictEqual(unusable.length, 1);
    assert.strictEqual(unusable[0].name, 'tool-b');
    assert.strictEqual(unusable[0].reason, 'Git not installed');
  });

  it('findUsable filters by category', async () => {
    reg.register('deploy-1', { category: 'deploy', isUsable: () => true });
    reg.register('test-1', { category: 'testing', isUsable: () => true });

    const deployTools = await reg.findUsable('deploy');
    assert.strictEqual(deployTools.length, 1);
    assert.strictEqual(deployTools[0].name, 'deploy-1');
  });

  it('findUsable with "all" category returns all usable tools', async () => {
    reg.register('tool-a', { category: 'deploy', isUsable: () => true });
    reg.register('tool-b', { category: 'testing', isUsable: () => true });

    const all = await reg.findUsable('all');
    assert.strictEqual(all.length, 2);
  });

  it('isUsable with no check returns true by default', async () => {
    reg.register('no-check', { category: 'test' });
    const usable = await reg.findUsable('test');
    assert.strictEqual(usable.length, 1);
  });

  it('isUsable timeout marks tool as unusable', async () => {
    reg._timeout = 50;
    reg.register('slow-tool', {
      category: 'test',
      isUsable: () => new Promise(resolve => setTimeout(() => resolve(true), 5000)),
    });

    const usable = await reg.findUsable('test');
    assert.strictEqual(usable.length, 0);
  });

  it('isUsable error marks tool as unusable', async () => {
    reg.register('broken-tool', {
      category: 'test',
      isUsable: () => { throw new Error('Check failed'); },
    });

    const usable = await reg.findUsable('test');
    assert.strictEqual(usable.length, 0);
  });

  it('returns empty array for unknown category', async () => {
    reg.register('tool-a', { category: 'deploy', isUsable: () => true });
    const result = await reg.findUsable('nonexistent');
    assert.strictEqual(result.length, 0);
  });

  it('overwrite replaces existing registration', async () => {
    reg.register('tool', { category: 'deploy', isUsable: () => false });
    reg.register('tool', { category: 'deploy', isUsable: () => true });

    const usable = await reg.findUsable('deploy');
    assert.strictEqual(usable.length, 1);
    assert.ok(usable[0].isUsable);
  });

  it('findAll returns all tools across categories', () => {
    reg.register('tool-a', { category: 'deploy', description: 'Deploy tool' });
    reg.register('tool-b', { category: 'testing', description: 'Test tool' });
    reg.register('tool-c', { category: 'design', description: 'Design tool' });

    const all = reg.findAll();
    assert.strictEqual(all.length, 3);
    assert.ok(all.some(t => t.category === 'deploy'));
    assert.ok(all.some(t => t.category === 'testing'));
    assert.ok(all.some(t => t.category === 'design'));
  });
});
