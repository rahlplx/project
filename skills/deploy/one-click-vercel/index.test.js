const OneClickVercel = require('./index');

describe('OneClickVercel', () => {
  it('should create instance with defaults', () => {
    const skill = new OneClickVercel();
    expect(skill.name).toBe('one-click-vercel');
    expect(skill.cliCommand).toBe('npx vercel');
  });

  it('should build deploy command', () => {
    const skill = new OneClickVercel();
    const cmd = skill.buildDeployCommand('./my-app');
    expect(cmd.cmd).toBe('npx');
    expect(cmd.args).toContain('./my-app');
    expect(cmd.args).toContain('--yes');
  });

  it('should add --prod flag for production', () => {
    const skill = new OneClickVercel();
    const cmd = skill.buildDeployCommand('.', { production: true });
    expect(cmd.args).toContain('--prod');
  });

  it('should build env commands', () => {
    const skill = new OneClickVercel();
    const result = skill.buildEnvCommand({ KEY: 'val' });
    expect(result.count).toBe(1);
    expect(result.commands[0].cmd).toBe('npx');
    expect(result.commands[0].args).toContain('env');
    expect(result.commands[0].args).toContain('add');
  });

  it('should return metadata via toJSON', () => {
    const skill = new OneClickVercel();
    const json = skill.toJSON();
    expect(json.dependencies[0]).toContain('Vercel CLI');
    expect(json.usage).toHaveProperty('deploy');
  });
});
