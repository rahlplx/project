const { createCommands } = require('./commands');

describe('cli commands', () => {
  test('creates commands object', () => {
    const commands = createCommands();
    expect(commands).toHaveProperty('intent');
    expect(commands).toHaveProperty('research');
    expect(commands).toHaveProperty('generate');
  });

  test('intent command has handler', () => {
    const commands = createCommands();
    expect(typeof commands.intent.handler).toBe('function');
  });

  test('research command has handler', () => {
    const commands = createCommands();
    expect(typeof commands.research.handler).toBe('function');
  });

  test('generate command has handler', () => {
    const commands = createCommands();
    expect(typeof commands.generate.handler).toBe('function');
  });
});
