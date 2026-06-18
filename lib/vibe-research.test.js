const fs = require('fs');
const path = require('path');

describe('vibe-research.md', () => {
  const filePath = path.join(__dirname, '..', 'references', 'vibe-research.md');

  test('file exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('file is readable', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });

  test('contains research protocol', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Research Protocol');
  });

  test('contains competitor analysis', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Competitor Analysis');
  });

  test('contains open source tools', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Open Source Tools');
  });

  test('contains utility catalog', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Utility Catalog');
  });

  test('contains output format', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Output');
  });

  test('under 200 lines', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    expect(lines.length).toBeLessThanOrEqual(200);
  });
});
