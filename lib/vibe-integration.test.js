const { describe, test, expect } = require('./jest-compat');

const fs = require('fs');
const path = require('path');

describe('vibe-integration.md', () => {
  const filePath = path.join(__dirname, '..', 'references', 'vibe-integration.md');

  test('file exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('file is readable', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });

  test('contains integration protocol', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## Integration Protocol');
  });

  test('contains CLI integration', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## CLI Integration');
  });

  test('contains MCP integration', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('## MCP Integration');
  });

  test('under 200 lines', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    expect(lines.length).toBeLessThanOrEqual(200);
  });
});
