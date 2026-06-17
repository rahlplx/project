const PromptTemplates = require('./index');

describe('PromptTemplates', () => {
  it('should create instance with defaults', () => {
    const s = new PromptTemplates();
    expect(s.name).toBe('prompt-templates');
    expect(s.version).toBe('1.0.0');
  });

  it('should return 10 categories', () => {
    const s = new PromptTemplates();
    const cats = s.getCategories();
    expect(cats).toHaveLength(10);
    expect(cats[0]).toHaveProperty('count');
  });

  it('should return 26 templates total', () => {
    const s = new PromptTemplates();
    const all = s.getAllTemplates();
    const count = Object.values(all).flat().length;
    expect(count).toBe(26);
  });

  it('should get template by category and id', () => {
    const s = new PromptTemplates();
    const t = s.getTemplate('web', 'landing-page');
    expect(t).not.toBeNull();
    expect(t.name).toBe('Build a Landing Page');
    expect(t.prompt).toContain('[PROJECT_NAME]');
  });

  it('should return null for unknown template', () => {
    const s = new PromptTemplates();
    expect(s.getTemplate('web', 'nonexistent')).toBeNull();
    expect(s.getTemplate('unknown', 'x')).toBeNull();
  });

  it('should return all web templates', () => {
    const s = new PromptTemplates();
    const all = s.getAllTemplates();
    expect(all.web).toHaveLength(3);
  });

  it('should search templates by keyword', () => {
    const s = new PromptTemplates();
    const r = s.search('API');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]).toHaveProperty('category');
    expect(r[0]).toHaveProperty('name');
  });

  it('should return empty search for no match', () => {
    const s = new PromptTemplates();
    const r = s.search('zzz999nonexistent');
    expect(r).toHaveLength(0);
  });

  it('should return metadata via toJSON', () => {
    const s = new PromptTemplates();
    const j = s.toJSON();
    expect(j.totalTemplates).toBe(26);
    expect(j.categories).toHaveLength(10);
  });

  it('should have all backend templates', () => {
    const s = new PromptTemplates();
    const all = s.getAllTemplates();
    expect(all.backend).toHaveLength(3);
    expect(all.database).toHaveLength(2);
    expect(all.auth).toHaveLength(2);
    expect(all.devops).toHaveLength(2);
    expect(all.testing).toHaveLength(2);
    expect(all.refactor).toHaveLength(3);
  });

  it('should make templates copy-paste ready', () => {
    const s = new PromptTemplates();
    const t = s.getTemplate('auth', 'login');
    expect(t.prompt).toContain('[APP_NAME]');
    expect(t.name).toBe('Implement Authentication');
  });
});
