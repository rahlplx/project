const { createTools } = require('./tools');

describe('mcp tools', () => {
  test('creates tools array', () => {
    const tools = createTools();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
  });

  test('each tool has name and description', () => {
    const tools = createTools();
    tools.forEach(tool => {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('handler');
    });
  });

  test('includes capture_intent tool', () => {
    const tools = createTools();
    const tool = tools.find(t => t.name === 'capture_intent');
    expect(tool).toBeDefined();
  });

  test('includes research_project tool', () => {
    const tools = createTools();
    const tool = tools.find(t => t.name === 'research_project');
    expect(tool).toBeDefined();
  });

  test('includes generate_docs tool', () => {
    const tools = createTools();
    const tool = tools.find(t => t.name === 'generate_docs');
    expect(tool).toBeDefined();
  });

  test('each tool has handler function', () => {
    const tools = createTools();
    tools.forEach(tool => {
      expect(typeof tool.handler).toBe('function');
    });
  });
});
