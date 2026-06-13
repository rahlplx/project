const KnowledgeBase = require('./index');

describe('KnowledgeBase', () => {
  it('should create instance', () => {
    const s = new KnowledgeBase();
    expect(s.name).toBe('knowledge-base');
  });

  it('should generate README', () => {
    const s = new KnowledgeBase();
    const r = s.generate('readme', { title: 'Test', description: 'A test project', features: ['auth'] });
    expect(r.success).toBe(true);
    expect(r.title).toBe('Test');
  });

  it('should generate API docs', () => {
    const s = new KnowledgeBase();
    const r = s.generate('api', { name: 'Users API', endpoints: [{ method: 'GET', path: '/users' }] });
    expect(r.endpoints).toHaveLength(1);
  });

  it('should generate changelog', () => {
    const s = new KnowledgeBase();
    const r = s.generate('changelog', { entries: [{ version: '1.0.0', changes: ['Initial release'] }] });
    expect(r.entries).toHaveLength(1);
  });
});
