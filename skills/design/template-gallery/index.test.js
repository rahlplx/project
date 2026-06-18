const TemplateGallery = require('./index');
const fs = require('fs');
const path = require('path');

describe('TemplateGallery', () => {
  it('should create instance', () => {
    const s = new TemplateGallery();
    expect(s.name).toBe('template-gallery');
  });

  it('should list templates', () => {
    const s = new TemplateGallery();
    const list = s.list();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('id');
  });

  it('should get by id', () => {
    const s = new TemplateGallery();
    const t = s.getById('node-cli');
    expect(t.name).toBe('Node.js CLI');
  });

  it('should filter by category', () => {
    const s = new TemplateGallery();
    const r = s.filter('cli');
    expect(r.length).toBeGreaterThan(0);
  });

  it('should scaffold template', () => {
    const s = new TemplateGallery();
    const out = path.join(require('os').tmpdir(), 'test-scaffold-' + Date.now());
    const r = s.scaffold('node-cli', out);
    expect(r.success).toBe(true);
    const readme = fs.readFileSync(path.join(out, 'README.md'), 'utf-8');
    expect(readme).toContain('Node.js CLI');
    // cleanup
    fs.rmSync(out, { recursive: true, force: true });
  });
});
