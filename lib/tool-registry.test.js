const { ToolRegistry, registry } = require('./tool-registry');

describe('ToolRegistry', () => {
  let r;

  beforeEach(() => {
    r = new ToolRegistry();
  });

  test('starts empty', () => {
    expect(r.getAll()).toHaveLength(0);
  });

  test('register stores entry', () => {
    r.register('test-tool', { category: 'deploy', description: 'A test' });
    const t = r.get('test-tool');
    expect(t.name).toBe('test-tool');
    expect(t.category).toBe('deploy');
    expect(typeof t.isUsable).toBe('function');
    expect(t.isUsable()).toBe(true);
    expect(t.factory).toBeNull();
  });

  test('duplicate name throws', () => {
    r.register('x', { category: 'deploy' });
    expect(() => r.register('x', { category: 'deploy' })).toThrow(/duplicate/);
  });

  test('missing category throws', () => {
    expect(() => r.register('no-cat', {})).toThrow(/category/);
  });

  test('has() returns correct boolean', () => {
    r.register('a', { category: 'deploy' });
    expect(r.has('a')).toBe(true);
    expect(r.has('b')).toBe(false);
  });

  test('getAll() returns all entries', () => {
    r.register('a', { category: 'deploy' });
    r.register('b', { category: 'design' });
    expect(r.getAll()).toHaveLength(2);
  });

  test('getCategories() returns sorted unique categories', () => {
    r.register('a', { category: 'deploy' });
    r.register('b', { category: 'design' });
    r.register('c', { category: 'deploy' });
    const cats = r.getCategories();
    expect(cats).toEqual(['deploy', 'design']);
  });

  test('get() returns undefined for missing', () => {
    expect(r.get('missing')).toBeUndefined();
  });

  describe('findUsable', () => {
    test('filters by category', () => {
      r.register('a', { category: 'deploy' });
      r.register('b', { category: 'design' });
      expect(r.findUsable('deploy')).toHaveLength(1);
      expect(r.findUsable('nonexistent')).toHaveLength(0);
    });

    test('skips tools with isUsable returning false', () => {
      r.register('good', { category: 'deploy' });
      r.register('broken', { category: 'deploy', isUsable: () => false });
      const usable = r.findUsable('deploy');
      expect(usable).toHaveLength(1);
      expect(usable[0].name).toBe('good');
    });

    test('returns all usable when no category given', () => {
      r.register('a', { category: 'deploy' });
      r.register('b', { category: 'design', isUsable: () => false });
      expect(r.findUsable()).toHaveLength(1);
    });
  });

  describe('createUsable', () => {
    test('calls factory and returns instances', () => {
      const factory = jest.fn(() => ({ created: true }));
      r.register('f', { category: 'test', factory });
      const instances = r.createUsable('test');
      expect(instances).toHaveLength(1);
      expect(instances[0]).toEqual({ created: true });
      expect(factory).toHaveBeenCalled();
    });

    test('returns entry itself if no factory', () => {
      r.register('a', { category: 'deploy' });
      const instances = r.createUsable('deploy');
      expect(instances).toHaveLength(1);
      expect(instances[0].name).toBe('a');
    });
  });
});

describe('default registry singleton', () => {
  test('registry is a ToolRegistry', () => {
    expect(registry).toBeInstanceOf(ToolRegistry);
  });
});
