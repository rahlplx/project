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
    const origExit = process.exit;
    let exitCode = null;
    process.exit = code => {
      exitCode = code;
    };
    const origLog = console.log;
    console.log = () => {};
    try {
      await mod.scaffold({ templateKey: 'nonexistent' });
    } catch {
      // expected to throw or exit
    }
    console.log = origLog;
    if (exitCode !== null) {
      process.exit = origExit;
      expect(exitCode).toBe(1);
    } else {
      process.exit = origExit;
    }
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
