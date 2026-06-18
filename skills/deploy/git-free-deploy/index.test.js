const fs = require('fs');
const path = require('path');
const os = require('os');
const GitFreeDeploy = require('./index');

describe('GitFreeDeploy', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gfd-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should create instance with defaults', () => {
    const skill = new GitFreeDeploy();
    expect(skill.name).toBe('git-free-deploy');
  });

  it('should build serve command with custom port', () => {
    const skill = new GitFreeDeploy();
    const cmd = skill.buildServeCommand('./dist', 5000);
    expect(cmd.cmd).toBe('npx');
    expect(cmd.args).toEqual(['serve', './dist', '-p', '5000']);
  });

  it('should build surge command', () => {
    const skill = new GitFreeDeploy();
    const cmd = skill.buildSurgeCommand('./dist', 'my-site.surge.sh');
    expect(cmd.cmd).toBe('npx');
    expect(cmd.args).toEqual(['surge', './dist', 'my-site.surge.sh']);
  });

  it('should build netlify drop command', () => {
    const skill = new GitFreeDeploy();
    const cmd = skill.buildNetlifyDropCommand('./dist');
    expect(cmd.cmd).toBe('npx');
    expect(cmd.args).toEqual(['netlify-cli', 'deploy', '--dir', './dist']);
  });

  it('should prepare static files', () => {
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<h1>Hi</h1>');
    const skill = new GitFreeDeploy();
    const result = skill.prepareStaticFiles(tmpDir);
    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(1);
  });

  it('should validate static site', () => {
    const skill = new GitFreeDeploy();
    expect(skill.validateStaticSite(tmpDir).valid).toBe(false);
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<h1>Hi</h1>');
    expect(skill.validateStaticSite(tmpDir).valid).toBe(true);
  });
});
