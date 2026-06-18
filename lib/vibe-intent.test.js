const fs = require('fs');
const path = require('path');

describe('vibe-intent.md', () => {
  const filePath = path.join(__dirname, '..', 'references', 'vibe-intent.md');

  test('file exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('file is readable', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });

  test('contains Q&A protocol', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Q&A Protocol');
  });

  test('contains 3 rounds', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('Round 1');
    expect(content).toContain('Round 2');
    expect(content).toContain('Round 3');
  });

  test('contains skip protocol', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Skip Protocol');
  });

  test('contains smart defaults', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Smart Defaults');
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
