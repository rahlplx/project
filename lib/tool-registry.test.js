const { describe, it } = require('node:test');
const assert = require('assert');
const { ToolRegistry } = require('./tool-registry');

describe('ToolRegistry', () => {
  it('register stores a tool and findAll returns it', () => {
    const registry = new ToolRegistry();
    registry.register('test-tool', { isUsable: () => true, category: 'test', metadata: {} });
    const all = registry.findAll();
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].name, 'test-tool');
  });

  it('findUsable returns only tools where isUsable is true', () => {
    const registry = new ToolRegistry();
    registry.register('usable', { isUsable: () => true, category: 'deploy', metadata: {} });
    registry.register('unusable', { isUsable: () => false, category: 'deploy', metadata: {} });
    const usable = registry.findUsable('deploy');
    assert.strictEqual(usable.length, 1);
    assert.strictEqual(usable[0].name, 'usable');
  });

  it('findAll returns all registered tools regardless of usability', () => {
    const registry = new ToolRegistry();
    registry.register('a', { isUsable: () => true, category: 'deploy', metadata: {} });
    registry.register('b', { isUsable: () => false, category: 'design', metadata: {} });
    assert.strictEqual(registry.findAll().length, 2);
  });

  it('getUnusable returns unusable tools with reasons', () => {
    const registry = new ToolRegistry();
    registry.register('bad', {
      isUsable: () => false,
      category: 'deploy',
      metadata: { name: 'Bad Tool' },
    });
    registry.register('good', {
      isUsable: () => true,
      category: 'deploy',
      metadata: { name: 'Good Tool' },
    });
    const unusable = registry.getUnusable('deploy');
    assert.strictEqual(unusable.length, 1);
    assert.strictEqual(unusable[0].name, 'bad');
    assert.ok(unusable[0].reason);
  });

  it('register with same name overwrites (last wins)', () => {
    const registry = new ToolRegistry();
    registry.register('dup', { isUsable: () => false, category: 'a', metadata: {} });
    registry.register('dup', { isUsable: () => true, category: 'b', metadata: {} });
    assert.strictEqual(registry.findAll().length, 1);
    assert.strictEqual(registry.findUsable('b').length, 1);
  });

  it('isUsable that throws causes tool to be treated as unusable', () => {
    const registry = new ToolRegistry();
    registry.register('throws', {
      isUsable: () => {
        throw new Error('check failed');
      },
      category: 'deploy',
      metadata: {},
    });
    const usable = registry.findUsable('deploy');
    assert.strictEqual(usable.length, 0);
    const unusable = registry.getUnusable('deploy');
    assert.strictEqual(unusable.length, 1);
    assert.ok(unusable[0].reason.includes('Error'));
  });

  it('findUsable with no matching category returns empty array', () => {
    const registry = new ToolRegistry();
    registry.register('tool', { isUsable: () => true, category: 'deploy', metadata: {} });
    const usable = registry.findUsable('nonexistent');
    assert.deepStrictEqual(usable, []);
  });

  it('findUsable with empty registry returns empty array', () => {
    const registry = new ToolRegistry();
    assert.deepStrictEqual(registry.findUsable('deploy'), []);
  });
});
