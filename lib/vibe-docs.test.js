const fs = require('fs');
const path = require('path');

describe('vibe-docs.md', () => {
  const filePath = path.join(__dirname, '..', 'references', 'vibe-docs.md');

  test('file exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('file is readable', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });

  test('contains doc generation protocol', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Doc Generation Protocol');
  });

  test('contains PROJECT.md template', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## PROJECT.md Template');
  });

  test('contains PRD.md template', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## PRD.md Template');
  });

  test('contains MARKET_RESEARCH.md template', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## MARKET_RESEARCH.md Template');
  });

  test('under 200 lines', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    expect(lines.length).toBeLessThanOrEqual(200);
  });
});
