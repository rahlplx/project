const fs = require('fs');
const path = require('path');

describe('vibe-knowledge.md', () => {
  const filePath = path.join(__dirname, '..', 'references', 'vibe-knowledge.md');

  test('file exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('file is readable', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });

  test('contains knowledge base protocol', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Knowledge Base Protocol');
  });

  test('contains pattern storage', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Pattern Storage');
  });

  test('contains feedback loop', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Feedback Loop');
  });

  test('under 200 lines', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    expect(lines.length).toBeLessThanOrEqual(200);
  });
});
