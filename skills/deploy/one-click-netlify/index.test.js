const OneClickNetlify = require('./index');

describe('OneClickNetlify', () => {
  it('should create instance with defaults', () => {
    const skill = new OneClickNetlify();
    expect(skill.name).toBe('one-click-netlify');
    expect(skill.cliCommand).toBe('npx netlify-cli');
  });

  it('should build deploy command', () => {
    const skill = new OneClickNetlify();
    const cmd = skill.buildDeployCommand('./dist');
    expect(cmd).toContain('netlify-cli deploy');
    expect(cmd).toContain('./dist');
  });

  it('should add --prod flag', () => {
    const skill = new OneClickNetlify();
    const cmd = skill.buildDeployCommand('.', { production: true });
    expect(cmd).toContain('--prod');
  });

  it('should build init command', () => {
    const skill = new OneClickNetlify();
    const cmd = skill.buildInitCommand('./site');
    expect(cmd).toContain('netlify-cli init');
  });

  it('should build open command', () => {
    const skill = new OneClickNetlify();
    const cmd = skill.buildOpenCommand();
    expect(cmd).toContain('netlify-cli open:site');
  });

  it('should build env commands', () => {
    const skill = new OneClickNetlify();
    const result = skill.buildEnvCommand({ KEY: 'val' });
    expect(result.count).toBe(1);
  });
});
