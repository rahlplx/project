const mod = require('./index');

describe('ProjectWizard', () => {
  it('should have PROJECT_TYPES with 9 entries', () => {
    expect(mod.PROJECT_TYPES).toHaveLength(9);
  });

  it('should have correct first project type', () => {
    expect(mod.PROJECT_TYPES[0].name).toBe('Web Application (React)');
    expect(mod.PROJECT_TYPES[0].value).toBe('react-web');
  });

  it('should have DEPLOYMENT_TARGETS with 8 entries', () => {
    expect(mod.DEPLOYMENT_TARGETS).toHaveLength(8);
  });

  it('should have correct first deployment target', () => {
    expect(mod.DEPLOYMENT_TARGETS[0].name).toBe('Vercel / Netlify (JAMstack)');
    expect(mod.DEPLOYMENT_TARGETS[0].value).toBe('vercel');
  });

  it('should have FEATURES with 12 entries', () => {
    expect(mod.FEATURES).toHaveLength(12);
  });

  it('should have correct first feature', () => {
    expect(mod.FEATURES[0].name).toBe('User Authentication (OAuth, JWT)');
    expect(mod.FEATURES[0].value).toBe('auth');
  });

  it('should have scaffold as a function', () => {
    expect(typeof mod.scaffold).toBe('function');
  });

  it('should have main as a function', () => {
    expect(typeof mod.main).toBe('function');
  });

  it('should have generateProjectSpec as a function', () => {
    expect(typeof mod.generateProjectSpec).toBe('function');
  });

  it('should generate project spec from answers', async () => {
    const answers = {
      projectName: 'TestApp',
      description: 'A test app',
      projectType: 'react-web',
      deploymentTargets: ['vercel'],
      techPreferences: 'React, Node.js',
      features: ['auth', 'database'],
      authMethod: 'JWT',
      authProviders: 'Google, GitHub',
      databaseType: 'PostgreSQL',
      orm: 'Prisma',
      designPreference: 'minimalist',
      colorScheme: 'blue',
      responsiveDesign: true,
      timeline: '1 month',
      budget: '1000',
      constraints: 'None',
      notes: 'Test notes',
    };
    const spec = await mod.generateProjectSpec(answers);
    expect(spec).toContain('# Project Specification');
    expect(spec).toContain('## TestApp');
    expect(spec).toContain('A test app');
    expect(spec).toContain('react-web');
    expect(spec).toContain('JWT');
    expect(spec).toContain('PostgreSQL');
    expect(spec).toContain('Prisma');
    expect(spec).toContain('1 month');
  });

  it('should generate spec with minimal answers', async () => {
    const answers = {
      projectName: 'Minimal',
      description: 'Minimal project',
      projectType: 'cli',
      deploymentTargets: ['static'],
      features: [],
      designPreference: 'minimalist',
      colorScheme: 'monochrome',
      responsiveDesign: false,
    };
    const spec = await mod.generateProjectSpec(answers);
    expect(spec).toContain('## Minimal');
    expect(spec).not.toContain('### Authentication');
    expect(spec).not.toContain('### Database');
  });
});
