const { ToolRegistry } = require('./tool-registry.js');
const { execSync } = require('child_process');

function checkCommand(cmd) {
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

describe('ToolRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe('register', () => {
    test('adds tool to registry', () => {
      registry.register('test-tool', {
        category: 'test',
        isUsable: () => true,
        metadata: { desc: 'test' }
      });
      const all = registry.findAll('test');
      expect(all.length).toBe(1);
      expect(all[0].name).toBe('test-tool');
    });

    test('validates required name', () => {
      expect(() => {
        registry.register('', { category: 'test', isUsable: () => true });
      }).toThrow('Tool name is required');
    });

    test('validates required category', () => {
      expect(() => {
        registry.register('test-tool', { isUsable: () => true });
      }).toThrow('Tool category is required');
    });

    test('validates required isUsable function', () => {
      expect(() => {
        registry.register('test-tool', { category: 'test', isUsable: 'not a function' });
      }).toThrow('isUsable is required and must be a function');
    });

    test('duplicate name overwrites (last wins)', () => {
      registry.register('dup', { category: 'test', isUsable: () => true });
      registry.register('dup', { category: 'test', isUsable: () => false });
      const all = registry.findAll('test');
      expect(all.length).toBe(1);
      expect(all[0].isUsable()).toBe(false);
    });
  });

  describe('findAll', () => {
    test('returns all tools in category', () => {
      registry.register('t1', { category: 'cat', isUsable: () => true });
      registry.register('t2', { category: 'cat', isUsable: () => false });
      registry.register('t3', { category: 'other', isUsable: () => true });
      const all = registry.findAll('cat');
      expect(all.length).toBe(2);
      expect(all.map(a => a.name).sort()).toEqual(['t1', 't2']);
    });

    test('returns empty array for unknown category', () => {
      const all = registry.findAll('unknown');
      expect(all.length).toBe(0);
    });
  });

  describe('findUsable', () => {
    test('returns only tools where isUsable = true', async () => {
      registry.register('usable', { category: 'test', isUsable: () => true });
      registry.register('not-usable', { category: 'test', isUsable: () => false });
      const usable = await registry.findUsable('test');
      expect(usable.length).toBe(1);
      expect(usable[0].name).toBe('usable');
    });

    test('filters out tools where isUsable throws', async () => {
      registry.register('throws', { category: 'test', isUsable: () => { throw new Error('oops'); } });
      registry.register('ok', { category: 'test', isUsable: () => true });
      const usable = await registry.findUsable('test');
      expect(usable.length).toBe(1);
      expect(usable[0].name).toBe('ok');
    });

    test('3s timeout on slow isUsable', async () => {
      registry.register('slow', {
        category: 'test',
        isUsable: () => new Promise(r => setTimeout(() => r(true), 5000))
      });
      const start = Date.now();
      const usable = await registry.findUsable('test');
      const elapsed = Date.now() - start;
      expect(usable.length).toBe(0);
      expect(elapsed).toBeLessThan(4000);
      expect(elapsed).toBeGreaterThan(2500);
    });
  });

  describe('getUnusable', () => {
    test('returns tools with isUsable = false + reasons', async () => {
      registry.register('bad', { category: 'test', isUsable: () => false });
      registry.register('good', { category: 'test', isUsable: () => true });
      const unusable = await registry.getUnusable('test');
      expect(unusable.length).toBe(1);
      expect(unusable[0].name).toBe('bad');
      expect(unusable[0].reason).toBe('isUsable returned false');
    });

    test('includes reason from thrown error', async () => {
      registry.register('throws', { category: 'test', isUsable: () => { throw new Error('custom error'); } });
      const unusable = await registry.getUnusable('test');
      expect(unusable.length).toBe(1);
      expect(unusable[0].reason).toContain('custom error');
    });

    test('includes reason from timeout', async () => {
      registry.register('slow', {
        category: 'test',
        isUsable: () => new Promise(r => setTimeout(() => r(true), 5000))
      });
      const unusable = await registry.getUnusable('test');
      expect(unusable.length).toBe(1);
      expect(unusable[0].reason).toContain('timeout');
    });
  });

  describe('integration', () => {
    test('git isUsable returns true', async () => {
      registry.register('git-test', {
        category: 'test',
        isUsable: () => checkCommand('git --version')
      });
      const usable = await registry.findUsable('test');
      expect(usable.length).toBe(1);
      expect(usable[0].name).toBe('git-test');
    });

    test('missing CLI isUsable returns false', async () => {
      registry.register('missing-cli', {
        category: 'test',
        isUsable: () => checkCommand('nonexistent-cli-xyz-123 --version')
      });
      const usable = await registry.findUsable('test');
      expect(usable.length).toBe(0);
    });
  });
});