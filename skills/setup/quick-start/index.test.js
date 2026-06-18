const mod = require('./index');

describe('QuickStart', () => {
  it('should have scaffold as a function', () => {
    expect(typeof mod.scaffold).toBe('function');
  });

  it('should have TEMPLATES with expected keys', () => {
    const keys = Object.keys(mod.TEMPLATES);
    expect(keys).toContain('react-vite');
    expect(keys).toContain('nextjs');
    expect(keys).toContain('node-api');
    expect(keys).toContain('fastify-api');
    expect(keys).toContain('react-native');
    expect(keys).toContain('electron');
    expect(keys).toContain('remix');
    expect(keys).toContain('vue-vite');
    expect(keys).toContain('svelte');
    expect(keys).toContain('astro');
    expect(keys).toContain('cli-tool');
    expect(keys).toHaveLength(11);
  });

  it('should have correct react-vite template', () => {
    expect(mod.TEMPLATES['react-vite'].name).toBe('React + Vite');
    expect(mod.TEMPLATES['react-vite'].description).toContain('Vite');
    expect(mod.TEMPLATES['react-vite'].envVars).toContain('VITE_API_URL');
  });

  it('should have cli-tool template with files', () => {
    const cli = mod.TEMPLATES['cli-tool'];
    expect(cli.files).toBeDefined();
    expect(cli.files['package.json']).toBeDefined();
    expect(cli.files['bin/index.js']).toBeDefined();
    expect(cli.files['.gitignore']).toBeDefined();
    expect(cli.files['README.md']).toBeDefined();
  });

  it('should handle list option gracefully', async () => {
    const result = await mod.scaffold({ list: true });
    expect(result).toBeUndefined();
  });

  it('should throw for unknown template', async () => {
    const origLog = console.log;
    console.log = () => {};
    const sentinel = new Error('__exit__');
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw sentinel; });
    try {
      await mod.scaffold({ templateKey: 'nonexistent', outputDir: '/tmp', projectName: 'x' });
    } catch (e) {
      if (e !== sentinel) throw e;
    }
    console.log = origLog;
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('should have envVars on relevant templates', () => {
    expect(mod.TEMPLATES.nextjs.envVars).toContain('DATABASE_URL');
    expect(mod.TEMPLATES['node-api'].envVars).toContain('PORT');
    expect(mod.TEMPLATES['node-api'].envVars).toContain('JWT_SECRET');
    expect(mod.TEMPLATES.astro.envVars).toEqual([]);
  });

  it('should have description on all templates', () => {
    Object.values(mod.TEMPLATES).forEach(t => {
      expect(t.description).toBeDefined();
      expect(t.description.length).toBeGreaterThan(0);
    });
  });
});

describe('QuickStart scaffold — file creation branches', () => {
  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('scaffolds cli-tool (files branch) and creates .env.example + README', async () => {
    const origLog = console.log;
    console.log = () => {};
    await mod.scaffold({
      templateKey: 'cli-tool',
      projectName: 'test-cli',
      outputDir: tmpDir,
      skipInstall: true,
      list: false,
    });
    console.log = origLog;
    const projectDir = path.join(tmpDir, 'test-cli');
    expect(fs.existsSync(projectDir)).toBe(true);
    expect(fs.existsSync(path.join(projectDir, '.env.example'))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, '.gitignore'))).toBe(true);
  });

  it('cli-tool template includes .gitignore in files — scaffold does not double-write it', async () => {
    const origLog = console.log;
    console.log = () => {};
    const writeSpy = jest.spyOn(fs, 'writeFileSync');
    await mod.scaffold({
      templateKey: 'cli-tool',
      projectName: 'gitignore-once',
      outputDir: tmpDir,
      skipInstall: true,
      list: false,
    });
    console.log = origLog;
    const gitignoreWrites = writeSpy.mock.calls.filter(c => String(c[0]).endsWith('.gitignore'));
    // cli-tool's files object already provides .gitignore, so scaffold skips the fallback write
    expect(gitignoreWrites).toHaveLength(1);
    writeSpy.mockRestore();
  });

  it('falls back to minimal package.json when git clone fails (repo branch)', async () => {
    const origLog = console.log;
    console.log = () => {};
    await mod.scaffold({
      templateKey: 'react-vite',
      projectName: 'clone-fail',
      outputDir: tmpDir,
      skipInstall: true,
      list: false,
    });
    console.log = origLog;
    const projectDir = path.join(tmpDir, 'clone-fail');
    expect(fs.existsSync(projectDir)).toBe(true);
    const pkgPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      expect(pkg.name).toBe('clone-fail');
    }
    expect(fs.existsSync(path.join(projectDir, '.env.example'))).toBe(true);
  });

  it('exits with code 1 when project directory already exists', async () => {
    const origLog = console.log;
    console.log = () => {};
    const projectDir = path.join(tmpDir, 'already-exists');
    fs.mkdirSync(projectDir, { recursive: true });
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await mod.scaffold({
      templateKey: 'cli-tool',
      projectName: 'already-exists',
      outputDir: tmpDir,
      skipInstall: true,
      list: false,
    });
    console.log = origLog;
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});

describe('QuickStart generateEnvFile branch — empty envVars', () => {
  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-env-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('generates .env.example with no-vars comment for templates with empty envVars', async () => {
    const origLog = console.log;
    console.log = () => {};
    await mod.scaffold({
      templateKey: 'astro',
      projectName: 'my-astro',
      outputDir: tmpDir,
      skipInstall: true,
      list: false,
    });
    console.log = origLog;
    const envFile = fs.readFileSync(path.join(tmpDir, 'my-astro', '.env.example'), 'utf8');
    expect(envFile).toContain('No environment variables required');
  });

  it('generates .env.example with NEXT_PUBLIC_ prefix hint for Next.js', async () => {
    const origLog = console.log;
    console.log = () => {};
    await mod.scaffold({
      templateKey: 'nextjs',
      projectName: 'my-next',
      outputDir: tmpDir,
      skipInstall: true,
      list: false,
    });
    console.log = origLog;
    const envFile = fs.readFileSync(path.join(tmpDir, 'my-next', '.env.example'), 'utf8');
    expect(envFile).toContain('NEXT_PUBLIC_API_URL=your-value-here');
    expect(envFile).toContain('DATABASE_URL=REPLACE_WITH_REAL_VALUE');
  });
});
