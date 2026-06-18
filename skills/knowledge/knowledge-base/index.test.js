const KnowledgeBase = require('./index');

describe('KnowledgeBase', () => {
  it('should create instance', () => {
    const s = new KnowledgeBase();
    expect(s.name).toBe('knowledge-base');
  });

  it('should generate README', () => {
    const s = new KnowledgeBase();
    const r = s.generate('readme', {
      title: 'Test',
      description: 'A test project',
      features: ['auth'],
    });
    expect(r.success).toBe(true);
    expect(r.title).toBe('Test');
  });

  it('should generate API docs', () => {
    const s = new KnowledgeBase();
    const r = s.generate('api', {
      name: 'Users API',
      endpoints: [{ method: 'GET', path: '/users' }],
    });
    expect(r.endpoints).toHaveLength(1);
  });

  it('should generate changelog', () => {
    const s = new KnowledgeBase();
    const r = s.generate('changelog', {
      entries: [{ version: '1.0.0', changes: ['Initial release'] }],
    });
    expect(r.entries).toHaveLength(1);
  });

  it('should generate with empty options', () => {
    const s = new KnowledgeBase();
    const r = s.generate('readme', {});
    expect(r.success).toBe(true);
    expect(r.title).toBe('Project');
    expect(r.content).toContain('# Project');
  });

  it('should return error for unsupported doc type', () => {
    const s = new KnowledgeBase();
    const r = s.generate('unknown-format', { title: 'x' });
    expect(r.success).toBe(false);
    expect(r.error).toContain('Unknown doc type');
  });

  it('should throw on null content', () => {
    const s = new KnowledgeBase();
    expect(() => s.generate('readme', null)).toThrow();
  });

  it('should validate output format for each doc type', () => {
    const s = new KnowledgeBase();
    const readme = s.generate('readme', { title: 'P', description: 'D', features: ['a'] });
    expect(readme).toHaveProperty('content');
    expect(readme).toHaveProperty('sections');
    expect(readme.sections).toContain('Features');

    const api = s.generate('api', { name: 'API', endpoints: [{ method: 'POST', path: '/data' }] });
    expect(api).toHaveProperty('endpoints');
    expect(api.endpoints[0]).toHaveProperty('method');
    expect(api.endpoints[0]).toHaveProperty('path');

    const comp = s.generate('component', { name: 'Btn', props: [{ name: 'label' }] });
    expect(comp).toHaveProperty('props');
    expect(comp).toHaveProperty('usage');
    expect(comp.props[0]).toHaveProperty('type');

    const changelog = s.generate('changelog', { entries: [{ version: '1.0.0', changes: ['a'] }] });
    expect(changelog).toHaveProperty('entries');
    expect(changelog.entries[0]).toHaveProperty('version');
    expect(changelog.entries[0]).toHaveProperty('changes');
  });

  it('should generate with missing required fields', () => {
    const s = new KnowledgeBase();
    const r = s.generate('readme', {});
    expect(r.success).toBe(true);
    expect(r.content).toContain('Description');
    expect(r.content).toContain('npm install');
  });
});
